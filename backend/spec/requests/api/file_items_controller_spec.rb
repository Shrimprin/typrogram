# frozen_string_literal: true

require 'rails_helper'

RSpec.describe API::FileItemsController, type: :request do
  include_context 'with authenticated user'

  let!(:repository) { create(:repository, :with_file_items, user: user) }

  describe 'GET /api/repositories/:repository_id/file_items/:id' do
    subject(:get_nil_content_file_item) do
      get api_repository_file_item_path(repository_id: repository.id, id: nil_content_file_item.id), headers: headers
    end

    let(:get_file_item) do
      get api_repository_file_item_path(repository_id: repository.id, id: file_item.id), headers: headers
    end
    let(:file_item) { create(:file_item, :typing, repository:) }
    let(:parent_dir) { create(:file_item, :directory, repository:) }
    let(:nil_content_file_item) { create(:file_item, :nil_content, repository:, parent: parent_dir) }

    context 'when content exists' do
      let(:typing_progress) do
        create(:typing_progress, file_item:, row: 5, column: 5, elapsed_seconds: 60, total_correct_type_count: 150,
                                 total_typo_count: 10)
      end

      before do
        create(:typo, typing_progress:, row: 1, column: 1, character: 'a')
      end

      it 'returns the success status' do
        get_file_item
        expect(response).to have_http_status(:ok)
      end

      it 'returns the file item' do
        get_file_item
        json = response.parsed_body

        expect(json).to have_json_attributes(
          id: file_item.id,
          name: file_item.name,
          path: file_item.path,
          status: file_item.status,
          type: file_item.type,
          content: file_item.content
        )
      end

      it 'returns the typing progress' do
        get_file_item
        json = response.parsed_body

        expect(json['typing_progress']).to have_json_attributes(
          row: 5,
          column: 5,
          elapsed_seconds: 60,
          total_correct_type_count: 150,
          total_typo_count: 10,
          accuracy: 93.8,
          wpm: 30.0
        )

        expect(json['typing_progress']['typos'].first).to include(
          row: 1,
          column: 1,
          character: 'a'
        )
      end
    end

    context 'when typing progress has zero values' do
      it 'returns accuracy as 100.0 and wpm as 0.0' do
        create(:typing_progress, file_item:, row: 0, column: 0, elapsed_seconds: 0, total_correct_type_count: 0,
                                 total_typo_count: 0)
        get api_repository_file_item_path(repository_id: repository.id, id: file_item.id), headers: headers

        json = response.parsed_body

        expect(json['typing_progress']).to have_json_attributes(
          row: 0,
          column: 0,
          elapsed_seconds: 0,
          total_correct_type_count: 0,
          total_typo_count: 0,
          accuracy: 100.0,
          wpm: 0.0
        )
      end
    end

    context 'when content is nil and fetched content is ASCII' do
      before do
        github_client_mock = instance_double(Octokit::Client)
        allow(Octokit::Client).to receive(:new).and_return(github_client_mock)
        content = Base64.strict_encode64('Hello, World!')
        allow(github_client_mock)
          .to receive(:contents)
          .with(repository.url, path: nil_content_file_item.path, ref: repository.commit_hash)
          .and_return({ content: })
      end

      it 'updates the file item content and keeps status as untyped' do
        expect(nil_content_file_item.content).to be_nil
        expect(nil_content_file_item.status).to eq('untyped')

        get_nil_content_file_item

        nil_content_file_item.reload
        expect(nil_content_file_item.content).to eq('Hello, World!')
        expect(nil_content_file_item.status).to eq('untyped')
      end
    end

    context 'when content is nil and fetched content is non-ASCII' do
      before do
        github_client_mock = instance_double(Octokit::Client)
        allow(Octokit::Client).to receive(:new).and_return(github_client_mock)
        content = Base64.strict_encode64('こんにちは、世界！')
        allow(github_client_mock)
          .to receive(:contents)
          .with(repository.url, path: nil_content_file_item.path, ref: repository.commit_hash)
          .and_return({ content: })
      end

      it 'updates the file item content and sets status as unsupported' do
        expect(nil_content_file_item.content).to be_nil
        expect(nil_content_file_item.status).to eq('untyped')

        get_nil_content_file_item

        nil_content_file_item.reload
        expect(nil_content_file_item.content).to eq('こんにちは、世界！')
        expect(nil_content_file_item.status).to eq('unsupported')
      end

      it 'updates parent directory status to typed when all siblings are typed or unsupported' do
        create(:file_item, :typed, repository:, parent: parent_dir)
        create(:file_item, :unsupported, repository:, parent: parent_dir)

        expect(parent_dir.status).to eq('untyped')

        get_nil_content_file_item

        parent_dir.reload
        expect(parent_dir.status).to eq('typed')
      end
    end

    context 'when file item does not exist' do
      subject(:get_non_existent_file_item) do
        get api_repository_file_item_path(repository_id: repository.id, id: 0), headers: headers
      end

      it 'returns not found status' do
        get_non_existent_file_item

        expect(response).to have_http_status(:not_found)
      end
    end

    context 'when update failed' do
      before do
        github_client_mock = instance_double(Octokit::Client)
        allow(Octokit::Client).to receive(:new).and_return(github_client_mock)
        content = Base64.strict_encode64('Hello, World!')
        allow(github_client_mock)
          .to receive(:contents)
          .with(repository.url, path: nil_content_file_item.path, ref: repository.commit_hash)
          .and_return({ content: })

        allow_any_instance_of(FileItem).to receive(:fetch_file_content_and_update_parent_status).and_return(false) # rubocop:disable RSpec/AnyInstance

        get_nil_content_file_item
      end

      it 'returns unprocessable content status' do
        expect(response).to have_http_status(:unprocessable_content)
      end
    end

    context 'when too many requests' do
      before do
        github_client_mock = instance_double(Octokit::Client)
        allow(Octokit::Client).to receive(:new).and_return(github_client_mock)
        allow(github_client_mock)
          .to receive(:contents)
          .with(repository.url, path: nil_content_file_item.path, ref: repository.commit_hash)
          .and_raise(Octokit::TooManyRequests)
      end

      it 'returns too_many_requests status' do
        get_nil_content_file_item

        expect(response).to have_http_status(:too_many_requests)
        json = response.parsed_body
        expect(json['message']).to eq('Too many requests. Please try again later.')
      end
    end

    context 'when unauthorized' do
      before do
        github_client_mock = instance_double(Octokit::Client)
        allow(Octokit::Client).to receive(:new).and_return(github_client_mock)
        allow(github_client_mock)
          .to receive(:contents)
          .with(repository.url, path: nil_content_file_item.path, ref: repository.commit_hash)
          .and_raise(Octokit::Unauthorized)
      end

      it 'returns unauthorized status' do
        get_nil_content_file_item

        expect(response).to have_http_status(:unauthorized)
        json = response.parsed_body
        expect(json['message']).to eq('Invalid access token.')
      end
    end

    context 'when unexpected error occurs' do
      before do
        github_client_mock = instance_double(Octokit::Client)
        allow(Octokit::Client).to receive(:new).and_return(github_client_mock)
        allow(github_client_mock)
          .to receive(:contents)
          .with(repository.url, path: nil_content_file_item.path, ref: repository.commit_hash)
          .and_raise(StandardError)
      end

      it 'returns internal server error status' do
        get_nil_content_file_item

        expect(response).to have_http_status(:internal_server_error)
        json = response.parsed_body
        expect(json['message']).to eq('An error occurred. Please try again later.')
      end
    end
  end

  describe 'PATCH /api/repositories/:repository_id/file_items/:id' do
    let(:untyped_file_item) { repository.file_items.where(type: :file, status: :untyped).first }

    context 'when status is typed' do
      subject(:update_file_item_to_typed) do
        patch api_repository_file_item_path(repository_id: repository.id, id: untyped_file_item.id),
              params: {
                file_item: {
                  status: :typed,
                  typing_progress: {
                    row: untyped_file_item.content.split("\n").size - 1,
                    column: untyped_file_item.content.split("\n").last.size,
                    elapsed_seconds: 330,
                    total_correct_type_count: 50,
                    total_typo_count: 10,
                    typos: [
                      { row: 1, column: 1, character: 'a' },
                      { row: 2, column: 2, character: 'b' }
                    ]
                  }
                }
              }, headers: headers
      end

      it 'returns success status' do
        update_file_item_to_typed
        expect(response).to have_http_status(:ok)
      end

      it 'returns repository with file items and progress' do
        update_file_item_to_typed
        json = response.parsed_body
        repository.reload

        expect(json).to have_json_attributes(
          id: repository.id,
          name: repository.name,
          last_typed_at: repository.last_typed_at.as_json,
          progress: repository.progress
        )

        file_items = json['file_items']
        expect(file_items.length).to eq(4)
        expect(file_items.find { |item| item['type'] == 'dir' }['file_items'].length).to eq(2)
      end

      it 'updates the file item status to typed' do
        update_file_item_to_typed
        updated_file_item = FileItem.find(untyped_file_item.id)
        expect(updated_file_item.status).to eq('typed')
      end

      it 'updates the file item typing progress and typos' do
        update_file_item_to_typed
        updated_file_item = FileItem.find(untyped_file_item.id)
        expect(updated_file_item.typing_progress.row).to eq(untyped_file_item.content.split("\n").size - 1)
        expect(updated_file_item.typing_progress.column).to eq(untyped_file_item.content.split("\n").last.size)
        expect(updated_file_item.typing_progress.elapsed_seconds).to eq(330)
        expect(updated_file_item.typing_progress.total_correct_type_count).to eq(50)
        expect(updated_file_item.typing_progress.total_typo_count).to eq(10)

        expect(updated_file_item.typing_progress.typos.length).to eq(2)
        expect(updated_file_item.typing_progress.typos[0].row).to eq(1)
        expect(updated_file_item.typing_progress.typos[0].column).to eq(1)
        expect(updated_file_item.typing_progress.typos[0].character).to eq('a')
        expect(updated_file_item.typing_progress.typos[1].row).to eq(2)
        expect(updated_file_item.typing_progress.typos[1].column).to eq(2)
        expect(updated_file_item.typing_progress.typos[1].character).to eq('b')
      end
    end

    context 'when status is typing' do
      subject(:update_file_item_to_typing) do
        patch api_repository_file_item_path(repository_id: repository.id, id: untyped_file_item.id),
              params: {
                file_item: {
                  status: :typing,
                  typing_progress: {
                    row: 3,
                    column: 1,
                    elapsed_seconds: 330,
                    total_correct_type_count: 50,
                    total_typo_count: 10,
                    typos: [
                      { row: 1, column: 1, character: 'a' },
                      { row: 2, column: 2, character: 'b' }
                    ]
                  }
                }
              }, headers: headers
      end

      it 'returns success status' do
        update_file_item_to_typing
        expect(response).to have_http_status(:ok)
      end

      it 'returns file item' do
        update_file_item_to_typing
        json = response.parsed_body
        expect(json['id']).to eq(untyped_file_item.id)
      end

      it 'updates the file item status to typing' do
        update_file_item_to_typing
        updated_file_item = FileItem.find(untyped_file_item.id)
        expect(updated_file_item.status).to eq('typing')
      end

      it 'updates the typing progress and typos' do
        update_file_item_to_typing
        updated_file_item = FileItem.find(untyped_file_item.id)
        expect(updated_file_item.typing_progress.row).to eq(3)
        expect(updated_file_item.typing_progress.column).to eq(1)
        expect(updated_file_item.typing_progress.elapsed_seconds).to eq(330)
        expect(updated_file_item.typing_progress.total_correct_type_count).to eq(50)
        expect(updated_file_item.typing_progress.total_typo_count).to eq(10)

        expect(updated_file_item.typing_progress.typos.length).to eq(2)
        expect(updated_file_item.typing_progress.typos[0].row).to eq(1)
        expect(updated_file_item.typing_progress.typos[0].column).to eq(1)
        expect(updated_file_item.typing_progress.typos[0].character).to eq('a')
        expect(updated_file_item.typing_progress.typos[1].row).to eq(2)
        expect(updated_file_item.typing_progress.typos[1].column).to eq(2)
        expect(updated_file_item.typing_progress.typos[1].character).to eq('b')
      end
    end

    context 'when repository does not exist' do
      it 'returns not found status' do
        patch api_repository_file_item_path(repository_id: 0, id: untyped_file_item.id),
              params: { file_item: { status: :typed } }, headers: headers

        expect(response).to have_http_status(:not_found)
      end
    end

    context 'when invalid params is given' do
      let(:invalid_params) do
        {
          row: nil,
          column: nil
        }
      end

      it 'returns unprocessable entity status for both typed and typing status' do
        # typedとtypingの両方のパターンをテストする
        # それぞれを別のテストに分けるとrubocopのRepeatExample警告が出るためまとめた

        # status: typed
        patch api_repository_file_item_path(repository_id: repository.id, id: untyped_file_item.id),
              params: { file_item: { status: :typed, typing_progress: invalid_params } }, headers: headers

        expect(response).to have_http_status(:unprocessable_content)
        json = response.parsed_body
        expect(json['errors']['typing_progress.row']).to include("can't be blank")
        expect(json['errors']['typing_progress.column']).to include("can't be blank")

        # status: typing
        patch api_repository_file_item_path(repository_id: repository.id, id: untyped_file_item.id),
              params: { file_item: { status: :typing, typing_progress: invalid_params } }, headers: headers

        expect(response).to have_http_status(:unprocessable_content)
        json = response.parsed_body
        expect(json['errors']['typing_progress.row']).to include("can't be blank")
        expect(json['errors']['typing_progress.column']).to include("can't be blank")
      end
    end

    context 'when invalid status is given' do
      it 'returns bad request status' do
        patch api_repository_file_item_path(repository_id: repository.id, id: untyped_file_item.id),
              params: { file_item: { status: :invalid } }, headers: headers

        expect(response).to have_http_status(:bad_request)
        json = response.parsed_body
        expect(json['message']).to eq('Invalid status.')
      end
    end
  end
end

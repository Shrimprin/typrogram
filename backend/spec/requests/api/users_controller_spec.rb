# frozen_string_literal: true

require 'rails_helper'

RSpec.describe API::UsersController, type: :request do
  let(:user) { create(:user) }
  let(:repository) { create(:repository, :with_extensions, user:) }
  let(:file_item) { create(:file_item, :with_typing_progress_and_typos, repository:) }
  let(:token) { JsonWebToken.encode(user.id, 30.days.from_now) }
  let(:headers) { { 'Authorization' => "Bearer #{token}" } }

  describe 'DELETE /api/users/:id' do
    it 'deletes the user and all associated records' do
      user_id = user.id
      repository_id = repository.id
      file_item_id = file_item.id
      typing_progress_id = file_item.typing_progress.id
      typo_ids = file_item.typing_progress.typos.pluck(:id)
      extension_ids = repository.extensions.pluck(:id)

      # rubocop:disable Layout/MultilineMethodCallIndentation
      expect do
        delete "/api/users/#{user.id}", headers: headers
      end.to change(User, :count).by(-1)
        .and change(Repository, :count).by(-1)
        .and change(FileItem, :count).by(-1)
        .and change(TypingProgress, :count).by(-1)
        .and change(Typo, :count).by(-2)
        .and change(Extension, :count).by(-2)
      # rubocop:enable Layout/MultilineMethodCallIndentation

      expect(User.find_by(id: user_id)).to be_nil
      expect(Repository.find_by(id: repository_id)).to be_nil
      expect(FileItem.find_by(id: file_item_id)).to be_nil
      expect(TypingProgress.find_by(id: typing_progress_id)).to be_nil
      expect(Typo.where(id: typo_ids)).to be_empty
      expect(Extension.where(id: extension_ids)).to be_empty
    end

    it 'returns success status and message' do
      delete "/api/users/#{user.id}", headers: headers

      expect(response).to have_http_status(:ok)

      response_body = response.parsed_body
      expect(response_body['message']).to eq('Account has been successfully deleted.')
    end

    describe 'error handling' do
      it 'returns unprocessable_content when ActiveRecord::RecordNotDestroyed is raised' do
        # @current_user.destroy!がエラーを返すようにモック
        allow(User).to receive(:find).with(user.id).and_return(user)
        allow(user).to receive(:destroy!).and_raise(ActiveRecord::RecordNotDestroyed)

        delete "/api/users/#{user.id}", headers: headers

        expect(response).to have_http_status(:unprocessable_content)

        response_body = response.parsed_body
        expect(response_body['message']).to eq('Failed to delete account.')
      end

      it 'returns internal_server_error when StandardError is raised' do
        # @current_user.destroy!がエラーを返すようにモック
        allow(User).to receive(:find).with(user.id).and_return(user)
        allow(user).to receive(:destroy!).and_raise(StandardError)

        delete "/api/users/#{user.id}", headers: headers

        expect(response).to have_http_status(:internal_server_error)

        response_body = response.parsed_body
        expect(response_body['message']).to eq('An error occurred. Please try again later.')
      end

      it 'returns forbidden error when trying to delete another user' do
        other_user = create(:user)

        delete "/api/users/#{other_user.id}", headers: headers

        expect(response).to have_http_status(:forbidden)

        response_body = response.parsed_body
        expect(response_body['message']).to eq('Unauthorized access.')
      end
    end
  end
end

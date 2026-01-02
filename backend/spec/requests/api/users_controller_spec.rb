# frozen_string_literal: true

require 'rails_helper'

RSpec.describe API::UsersController, type: :request do
  let(:user) { create(:user) }
  let(:repository) { create(:repository, :with_extensions, user:) }
  let(:file_item) { create(:file_item, :with_typing_progress_and_typos, repository:) }
  let(:token) { JsonWebToken.encode(user.id, 30.days.from_now) }
  let(:headers) { { 'Authorization' => "Bearer #{token}" } }

  describe 'DELETE /api/users' do
    subject(:delete_user) do
      delete '/api/users', headers: headers
    end

    it 'deletes the user and all associated records' do
      user_id = user.id
      repository_id = repository.id
      file_item_id = file_item.id
      typing_progress_id = file_item.typing_progress.id
      typo_ids = file_item.typing_progress.typos.pluck(:id)
      extension_ids = repository.extensions.pluck(:id)

      # rubocop:disable Layout/MultilineMethodCallIndentation
      expect do
        delete_user
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
      delete_user

      expect(response).to have_http_status(:ok)

      json = response.parsed_body
      expect(json['message']).to eq('Account has been successfully deleted.')
    end

    describe 'when unexpected error occurs' do
      it 'returns internal_server_error' do
        # @current_user.destroy_with_associationsがエラーを返すようにモック
        allow(User).to receive(:find_by).with(id: user.id).and_return(user)
        allow(user).to receive(:destroy_with_associations).and_raise(StandardError)

        delete_user

        expect(response).to have_http_status(:internal_server_error)

        json = response.parsed_body
        expect(json['message']).to eq('An error occurred. Please try again later.')
      end
    end
  end
end

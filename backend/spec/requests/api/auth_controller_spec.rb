# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'API::Auth', type: :request do
  describe 'POST /api/auth/callback/github' do
    let(:valid_params) { { auth: { github_id: '12345', name: 'テストユーザー' } } }

    context 'when new user' do
      it 'creates user and returns user data' do
        expect do
          post '/api/auth/callback/github', params: valid_params
        end.to change(User, :count).by(1)

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json).to have_key('access_token')
        expect(json).to have_key('user_id')
        expect(json).to have_key('expires_at')

        token = json['access_token']
        decoded_token = JsonWebToken.decode(token)
        expect(decoded_token).to have_key(:user_id)
        expect(User.exists?(decoded_token[:user_id])).to be true
        expect(json['user_id']).to eq(decoded_token[:user_id])
      end
    end

    context 'when existing user' do
      it 'returns user data' do
        existing_user = create(:user, github_id: valid_params[:auth][:github_id], name: valid_params[:auth][:name])
        expect do
          post '/api/auth/callback/github', params: valid_params
        end.not_to change(User, :count)

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json).to have_key('access_token')
        expect(json).to have_key('user_id')
        expect(json).to have_key('expires_at')

        token = json['access_token']
        decoded_token = JsonWebToken.decode(token)
        expect(decoded_token).to have_key(:user_id)
        expect(decoded_token[:user_id]).to eq(existing_user.id)
        expect(json['user_id']).to eq(existing_user.id)
      end
    end

    context 'when existing user with different name' do
      it 'updates name' do
        existing_user = create(:user, github_id: valid_params[:auth][:github_id], name: 'old_name')
        new_name = 'new_name'
        updated_params = { auth: { github_id: valid_params[:auth][:github_id], name: new_name } }

        expect do
          post '/api/auth/callback/github', params: updated_params
        end.not_to change(User, :count)

        existing_user.reload
        expect(existing_user.name).to eq(new_name)
      end
    end

    context 'when invalid params' do
      it 'returns error message' do
        invalid_params = { auth: { github_id: '12345' } }
        post '/api/auth/callback/github', params: invalid_params

        expect(response).to have_http_status(:unprocessable_content)
        json = response.parsed_body
        expect(json['message']).to eq('Please provide valid user information.')
      end
    end

    context 'when unexpected error occurs' do
      it 'returns error message' do
        allow(User).to receive(:find_or_initialize_by).and_raise(StandardError)

        post '/api/auth/callback/github', params: valid_params

        expect(response).to have_http_status(:internal_server_error)
        json = response.parsed_body
        expect(json['message']).to eq('An error occurred during authentication. Please try again later.')
      end
    end
  end
end

# frozen_string_literal: true

require 'rails_helper'

RSpec.describe API::LoginController, type: :request do
  describe 'POST /api/login' do
    let(:valid_params) { { github_id: '12345', name: 'テストユーザー' } }

    context 'when new user' do
      subject(:create_user) do
        post '/api/login', params: valid_params
      end

      it 'creates user and returns user data' do
        expect do
          create_user
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
      subject(:authenticate_existing_user) do
        post '/api/login', params: valid_params
      end

      it 'returns user data' do
        existing_user = create(:user, github_id: valid_params[:github_id], name: valid_params[:name])
        expect do
          authenticate_existing_user
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
      subject(:update_user_name) do
        post '/api/login', params: updated_params
      end

      let(:new_name) { 'new_name' }
      let(:updated_params) { { github_id: valid_params[:github_id], name: new_name } }

      it 'updates name' do
        existing_user = create(:user, github_id: valid_params[:github_id], name: 'old_name')

        expect do
          update_user_name
        end.not_to change(User, :count)

        existing_user.reload
        expect(existing_user.name).to eq(new_name)
      end
    end
  end
end

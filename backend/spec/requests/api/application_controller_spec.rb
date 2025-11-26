# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ApplicationController, type: :request do
  let(:user) { create(:user) }
  # テスト用のダミーコントローラーをスタブとして定義
  let(:test_controller) do
    Class.new(ApplicationController) do
      def index
        render json: { user_id: @current_user.id }, status: :ok
      end
    end
  end
  let(:expires_at) { 30.days.from_now }
  let(:token) { JsonWebToken.encode(user.id, expires_at) }
  let(:headers) { { 'Authorization' => "Bearer #{token}" } }

  # テスト用のダミーコントローラーとroutesを定義
  before do
    Rails.application.routes.draw do
      get 'test_authentication', to: 'test#index'
    end
    stub_const('TestController', test_controller)
  end

  # テスト後にroutesを元に戻す
  after do
    Rails.application.reload_routes!
  end

  describe 'Authentication before_action' do
    context 'when token is valid' do
      it 'returns success status and current_user_id' do
        get '/test_authentication', headers: headers

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body['user_id']).to eq(user.id)
      end
    end

    context 'when token is invalid' do
      let(:headers) { { 'Authorization' => 'Bearer invalid-token' } }

      it 'returns unauthorized status' do
        get '/test_authentication', headers: headers

        expect(response).to have_http_status(:unauthorized)
        expect(response.parsed_body['message']).to eq('Please login.')
      end
    end

    context 'when token is expired' do
      let(:expired_token) { JsonWebToken.encode(user.id, 1.hour.ago) }
      let(:headers) { { 'Authorization' => "Bearer #{expired_token}" } }

      it 'returns unauthorized status' do
        get '/test_authentication', headers: headers

        expect(response).to have_http_status(:unauthorized)
        expect(response.parsed_body['message']).to eq('Please login.')
      end
    end

    context 'when user is not found' do
      let(:non_existent_user_token) { JsonWebToken.encode(-9999, expires_at) }
      let(:headers) { { 'Authorization' => "Bearer #{non_existent_user_token}" } }

      it 'returns unauthorized status' do
        get '/test_authentication', headers: headers

        expect(response).to have_http_status(:unauthorized)
        expect(response.parsed_body['message']).to eq('Please login.')
      end
    end
  end
end

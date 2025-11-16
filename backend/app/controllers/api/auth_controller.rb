# frozen_string_literal: true

module API
  class AuthController < ApplicationController
    skip_before_action :authenticate_request!

    def login
      user = User.find_or_initialize_by(github_id: login_params[:github_id])
      user.name = login_params[:name]
      user.save!

      expires_at = 30.days.from_now
      access_token = JsonWebToken.encode(user.id, expires_at)
      render json: {
        access_token:,
        expires_at: expires_at.to_i,
        user_id: user.id
      }, status: :ok
    rescue ActiveRecord::RecordInvalid => e
      LogUtils.log_warn(e, 'AuthController#login')
      render json: { message: 'Please provide valid user information.' }, status: :unprocessable_content
    rescue StandardError => e
      LogUtils.log_error(e, 'AuthController#login')
      render json: { message: 'An error occurred during authentication. Please try again later.' },
             status: :internal_server_error
    end

    private

    def login_params
      params.expect(auth: %i[github_id name])
    end
  end
end

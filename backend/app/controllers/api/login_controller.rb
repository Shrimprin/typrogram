# frozen_string_literal: true

module API
  class LoginController < ApplicationController
    skip_before_action :authenticate_request!

    def create
      user = User.find_or_initialize_by(github_id: params[:github_id])
      user.name = params[:name]
      user.save!

      expires_at = 30.days.from_now
      access_token = JsonWebToken.encode(user.id, expires_at)
      render json: {
        access_token:,
        expires_at: expires_at.to_i,
        user_id: user.id
      }, status: :ok
    rescue ActiveRecord::RecordInvalid => e
      LogUtils.log_warn(e, 'LoginController#create')
      render json: { message: 'Please provide valid user information.' }, status: :unprocessable_content
    rescue StandardError => e
      LogUtils.log_error(e, 'LoginController#create')
      render json: { message: 'An error occurred during authentication. Please try again later.' },
             status: :internal_server_error
    end
  end
end

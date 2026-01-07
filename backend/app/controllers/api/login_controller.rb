# frozen_string_literal: true

class API::LoginController < ApplicationController
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
  end
end

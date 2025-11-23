# frozen_string_literal: true

class ApplicationController < ActionController::API
  include Pagy::Method

  before_action :authenticate_request!

  private

  def authenticate_request!
    header = request.headers['Authorization']
    token = header.split.last if header
    decoded_token = JsonWebToken.decode(token)

    if decoded_token
      @current_user = User.find(decoded_token[:user_id])
    else
      render json: { message: 'Please login.' }, status: :unauthorized
    end
  rescue ActiveRecord::RecordNotFound, JWT::DecodeError => e
    LogUtils.log_warn(e, 'ApplicationController#authenticate_request!')
    render json: { message: 'Please login.' }, status: :unauthorized
  end
end

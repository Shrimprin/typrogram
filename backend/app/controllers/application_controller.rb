# frozen_string_literal: true

class ApplicationController < ActionController::API
  include Pagy::Method

  before_action :authenticate_request!

  private

  def authenticate_request!
    header = request.headers['Authorization']
    token = header.split.last if header
    decoded_token = JsonWebToken.decode(token) || {}

    @current_user = User.find_by(id: decoded_token[:user_id])
    return if @current_user

    render json: { message: 'Please login.' }, status: :unauthorized
  end
end

# frozen_string_literal: true

class ApplicationController < ActionController::API
  include Pagy::Method

  before_action :authenticate_request!

  rescue_from StandardError, with: :handle_standard_error
  rescue_from Octokit::TooManyRequests, with: :handle_too_many_requests
  rescue_from Octokit::Unauthorized, with: :handle_unauthorized
  rescue_from ActiveRecord::RecordNotFound, with: :handle_record_not_found
  rescue_from ActiveRecord::RecordNotDestroyed, with: :handle_record_not_destroyed

  private

  def authenticate_request!
    header = request.headers['Authorization']
    token = header.split.last if header
    decoded_token = JsonWebToken.decode(token) || {}

    @current_user = User.find_by(id: decoded_token[:user_id])
    return if @current_user

    render json: { message: 'Please login.' }, status: :unauthorized
  end

  def handle_standard_error(exception)
    logger.error exception.full_message
    render json: { message: 'An error occurred. Please try again later.' }, status: :internal_server_error
  end

  # GitHubAPIのリミットレートは1つのアクセストークンにつき5000回/時間
  # これは全ユーザで共通（ユーザAが5000回リクエストするとユーザBはリクエストできない）ため、システムエラーとする
  # https://docs.github.com/ja/rest/using-the-rest-api/rate-limits-for-the-rest-api
  def handle_too_many_requests(exception)
    logger.error exception.full_message
    render json: { message: 'An error occurred. Please try again later.' }, status: :too_many_requests
  end

  #  管理者側で設定るするアクセストークンの有効期限が切れている場合はシステムエラーとする
  def handle_unauthorized(exception)
    logger.error exception.full_message
    render json: { message: 'An error occurred. Please try again later.' }, status: :unauthorized
  end

  def handle_record_not_found(_exception)
    render json: { message: 'Resource not found.' }, status: :not_found
  end

  def handle_record_not_destroyed(exception)
    logger.error exception.full_message
    render json: { message: 'Failed to delete account.' }, status: :unprocessable_content
  end
end

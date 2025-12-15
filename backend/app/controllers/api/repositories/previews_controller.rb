# frozen_string_literal: true

class API::Repositories::PreviewsController < ApplicationController
  def show
    url = params[:repository_preview][:url]
    repository_url = UrlUtils.extract_github_repository_path(url)

    if repository_url.nil?
      render json: { message: 'Invalid URL.' }, status: :unprocessable_content
      return
    end

    github_client = GithubClient.new

    unless github_client.repository?(repository_url)
      render json: { message: 'Repository not found.' }, status: :not_found
      return
    end

    repository_preview_data = github_client.build_repository_preview_data(repository_url)

    render json: repository_preview_data, status: :ok
  rescue Octokit::TooManyRequests => e
    LogUtils.log_warn(e, 'API::Repositories::PreviewsController#show')
    render json: { message: 'Too many requests. Please try again later.' }, status: :too_many_requests
  rescue Octokit::Unauthorized => e
    LogUtils.log_error(e, 'API::Repositories::PreviewsController#show')
    render json: { message: 'Invalid access token.' }, status: :unauthorized
  rescue StandardError => e
    LogUtils.log_error(e, 'API::Repositories::PreviewsController#show')
    render json: { message: 'An error occurred. Please try again later.' }, status: :internal_server_error
  end
end

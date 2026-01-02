# frozen_string_literal: true

class API::Repositories::PreviewsController < ApplicationController
  def show
    url = params[:repository_preview][:url]
    repository_url = GithubUrl.extract_repository_path(url)

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
  end
end

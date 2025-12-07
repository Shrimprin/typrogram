# frozen_string_literal: true

class API::Repositories::PreviewsController < ApplicationController
  def show
    url = params[:repository_preview][:url]
    repository_url = UrlUtils.extract_github_repository_path(url)

    if repository_url.nil?
      render json: { message: 'Invalid URL.' }, status: :unprocessable_content
      return
    end

    client = Octokit::Client.new(access_token: ENV.fetch('GITHUB_ACCESS_TOKEN'))
    repository_preview_data = build_repository_preview_data(client, repository_url, url)

    render json: repository_preview_data, status: :ok
  rescue Octokit::NotFound => e
    LogUtils.log_warn(e, 'API::Repositories::PreviewsController#show')
    render json: { message: 'Repository not found.' }, status: :not_found
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

  private

  def build_repository_preview_data(client, repository_url, url)
    repository_info = client.repository(repository_url)
    latest_commit = client.commits(repository_url).first
    extensions = extract_extensions_from_repository(client, repository_url, latest_commit.sha)

    {
      name: repository_info.name,
      url:,
      extensions:
    }
  end

  def extract_extensions_from_repository(client, repository_url, commit_hash)
    file_tree_data = client.tree(repository_url, commit_hash, recursive: true)
    extension_counts = Hash.new(0) # ex. { '.rb' => 3, '.gitignore' => 1, 'no extension' => 1 }

    file_tree_data.tree.each do |node|
      next unless node.type == 'blob'

      extension = Extension.extract_extension_name(node.path)
      extension_counts[extension] += 1
    end

    extensions = extension_counts.map do |extension, count|
      {
        name: extension,
        file_count: count,
        is_active: true
      }
    end

    extensions.sort_by { |ext| [-ext[:file_count], ext[:name]] }
  end
end

# frozen_string_literal: true

class API::RepositoriesController < ApplicationController
  before_action :set_repository, only: %i[show destroy]
  after_action { response.headers.merge!(@pagy.headers_hash) if @pagy }

  def index
    @pagy, repositories = pagy(@current_user.repositories.order(last_typed_at: :asc))
    render json: RepositorySerializer.new(repositories, params: { progress: true }), status: :ok
  end

  def show
    render json: RepositorySerializer.new(@repository, params: { file_items: true }), status: :ok
  end

  def create
    url = repository_params[:url]
    repository_url = UrlUtils.extract_github_repository_path(url)

    if repository_url.nil?
      render json: { message: 'Invalid URL.' }, status: :unprocessable_content
      return
    end

    client = Octokit::Client.new(access_token: ENV.fetch('GITHUB_ACCESS_TOKEN'))
    repository = build_repository(client, repository_url)

    if repository.save_with_file_items(client)
      render json: RepositorySerializer.new(repository), status: :created
    else
      render json: { errors: repository.errors }, status: :unprocessable_content
    end
  rescue Octokit::NotFound => e
    LogUtils.log_warn(e, 'RepositoriesController#create')
    render json: { message: 'Repository not found.' }, status: :not_found
  rescue Octokit::TooManyRequests => e
    LogUtils.log_warn(e, 'RepositoriesController#create')
    render json: { message: 'Too many requests. Please try again later.' }, status: :too_many_requests
  rescue Octokit::Unauthorized => e
    LogUtils.log_error(e, 'RepositoriesController#create')
    render json: { message: 'Invalid access token.' }, status: :unauthorized
  rescue StandardError => e
    LogUtils.log_error(e, 'RepositoriesController#create')
    render json: { message: 'An error occurred. Please try again later.' }, status: :internal_server_error
  end

  def destroy
    @repository.destroy_with_associations
    render json: { message: 'Repository deleted successfully.' }, status: :ok
  rescue StandardError => e
    LogUtils.log_error(e, 'RepositoriesController#destroy')
    render json: { message: 'Failed to delete repository.' }, status: :internal_server_error
  end

  private

  def repository_params
    params.expect(repository: [:url, { extensions_attributes: [%i[name is_active]] }])
  end

  def set_repository
    @repository = @current_user.repositories.find(params[:id])
  rescue ActiveRecord::RecordNotFound => e
    LogUtils.log_warn(e, 'RepositoriesController#set_repository')
    render json: { message: 'Repository not found.' }, status: :not_found
  end

  def build_repository(client, repository_url)
    repository_info = client.repository(repository_url)
    repository_name = repository_info.name
    latest_commit = client.commits(repository_url).first
    commit_hash = latest_commit.sha

    Repository.new(
      user: @current_user,
      name: repository_name,
      url: repository_url,
      commit_hash:,
      extensions_attributes: repository_params[:extensions_attributes] || []
    )
  end
end

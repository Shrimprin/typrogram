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

    extensions_attributes = repository_params[:extensions_attributes] || []
    repository = github_client.build_repository(@current_user, repository_url, extensions_attributes)

    if repository.save_with_file_items(github_client)
      render json: RepositorySerializer.new(repository), status: :created
    else
      render json: { errors: repository.errors }, status: :unprocessable_content
    end
  end

  def destroy
    @repository.destroy_with_associations
    render json: { message: 'Repository deleted successfully.' }, status: :ok
  end

  private

  def repository_params
    params.expect(repository: [:url, { extensions_attributes: [%i[name is_active]] }])
  end

  def set_repository
    @repository = @current_user.repositories.find(params[:id])
  end
end

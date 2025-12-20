# frozen_string_literal: true

class API::FileItemsController < ApplicationController
  before_action :set_repository, only: %i[show update]
  before_action :set_file_item, only: %i[show update]

  def show
    if @file_item.fetch_file_content_and_update_parent_status
      render json: FileItemSerializer.new(
        @file_item,
        params: { content: true, typing_progress: true, children: true }
      ), status: :ok
    else
      render json: { errors: @file_item.errors }, status: :unprocessable_content
    end
  rescue Octokit::TooManyRequests => e
    LogUtils.log_warn(e, 'FileItemsController#show')
    render json: { message: 'Too many requests. Please try again later.' }, status: :too_many_requests
  rescue Octokit::Unauthorized => e
    LogUtils.log_error(e, 'FileItemsController#show')
    render json: { message: 'Invalid access token.' }, status: :unauthorized
  rescue StandardError => e
    LogUtils.log_error(e, 'FileItemsController#show')
    render json: { message: 'An error occurred. Please try again later.' }, status: :internal_server_error
  end

  def update
    case file_item_params[:status]
    when 'typed'
      if @file_item.update_with_parent(file_item_params) && @repository.update(last_typed_at: Time.zone.now)
        render json: RepositorySerializer.new(@repository, params: { file_items: true, progress: true }), status: :ok
      else
        render json: { errors: @file_item.errors }, status: :unprocessable_content
      end
    when 'typing'
      if @file_item.update_with_typing_progress(file_item_params) && @repository.update(last_typed_at: Time.zone.now)
        render json: FileItemSerializer.new(@file_item, params: { children: true }), status: :ok
      else
        render json: { errors: @file_item.errors }, status: :unprocessable_content
      end
    else
      render json: { message: 'Invalid status.' }, status: :bad_request
    end
  end

  private

  def file_item_params
    params.expect(file_item: [:status, {
                    typing_progress: [:row, :column, :elapsed_seconds, :total_correct_type_count, :total_typo_count, {
                      typos: [%i[row column character]]
                    }]
                  }])
  end

  def set_repository
    @repository = @current_user.repositories.find(params[:repository_id])
  rescue ActiveRecord::RecordNotFound => e
    LogUtils.log_warn(e, 'FileItemsController#set_repository')
    render json: { message: 'Repository not found.' }, status: :not_found
  end

  def set_file_item
    repository = @repository || @current_user.repositories.find(params[:repository_id])
    @file_item = repository.file_items.find(params[:id])
  rescue ActiveRecord::RecordNotFound => e
    LogUtils.log_warn(e, 'FileItemsController#set_file_item')
    render json: { message: 'File not found.' }, status: :not_found
  end
end

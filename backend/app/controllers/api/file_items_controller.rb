# frozen_string_literal: true

class API::FileItemsController < ApplicationController
  before_action :set_repository, :set_file_item

  def show
    if @file_item.fetch_file_content_and_update_parent_status
      render json: FileItemSerializer.new(
        @file_item,
        params: { content: true, typing_progress: true, children: true }
      ), status: :ok
    else
      render json: { errors: @file_item.errors }, status: :unprocessable_content
    end
  end

  def update
    case file_item_params[:status]
    when 'typed'
      if @file_item.update_with_parent(file_item_params, is_timestamp: true)
        render json: RepositorySerializer.new(@repository, params: { file_items: true, progress: true }), status: :ok
      else
        render json: { errors: @file_item.errors }, status: :unprocessable_content
      end
    when 'typing'
      if @file_item.update_with_typing_progress(file_item_params, is_timestamp: true)
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
  end

  def set_file_item
    repository = @repository || @current_user.repositories.find(params[:repository_id])
    @file_item = repository.file_items.find(params[:id])
  end
end

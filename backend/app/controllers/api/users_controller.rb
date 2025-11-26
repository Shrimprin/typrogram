# frozen_string_literal: true

module API
  class UsersController < ApplicationController
    def destroy
      user_id = params[:id].to_i

      if @current_user.id != user_id
        render json: { message: 'Unauthorized access.' }, status: :forbidden
        return
      end

      @current_user.destroy_with_associations
      render json: { message: 'Account has been successfully deleted.' }, status: :ok
    rescue ActiveRecord::RecordNotDestroyed => e
      LogUtils.log_error(e, 'UsersController#destroy')
      render json: { message: 'Failed to delete account.' }, status: :unprocessable_content
    rescue StandardError => e
      LogUtils.log_error(e, 'UsersController#destroy')
      render json: { message: 'An error occurred. Please try again later.' }, status: :internal_server_error
    end
  end
end

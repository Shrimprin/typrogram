# frozen_string_literal: true

class API::UsersController < ApplicationController
  def destroy
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

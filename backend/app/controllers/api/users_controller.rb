# frozen_string_literal: true

class API::UsersController < ApplicationController
  def destroy
    @current_user.destroy_with_associations
    render json: { message: 'Account has been successfully deleted.' }, status: :ok
  end
end

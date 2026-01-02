Rails.application.routes.draw do
  namespace :api do
    resource :login, only: [:create], controller: 'login'
    resource :users, only: [:destroy]
    namespace :repositories do
      resource :preview, only: [:show]
    end
    resources :repositories, only: [:index, :show, :create, :destroy] do
      resources :file_items, only: [:show, :update]
    end
  end
end

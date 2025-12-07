Rails.application.routes.draw do
  # post '/api/auth/callback/github', to: 'api/auth#login'

  namespace :api do
    resource :login, only: [:create], controller: 'login'
    resources :users, only: [:destroy]
    namespace :repositories do
      resource :preview, only: [:show]
    end
    resources :repositories, only: [:index, :show, :create, :destroy] do
      resources :file_items, only: [:show, :update]
    end
  end
end

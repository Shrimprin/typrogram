Rails.application.routes.draw do
  post '/api/auth/callback/github', to: 'api/auth#login'

  namespace :api do
    resources :users, only: [:destroy]
    get '/repositories/preview', to: 'repositories/previews#show'
    resources :repositories, only: [:index, :show, :create, :destroy] do
      resources :file_items, only: [:show, :update]
    end
  end
end

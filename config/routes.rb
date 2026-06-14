Rails.application.routes.draw do
  devise_for :users, controllers: { registrations: "users/registrations" }
  resource :password_setup, only: [ :edit, :update ], controller: "users/password_setups"

  get "dashboard", to: "admin/dashboard#show", as: :dashboard_root

  namespace :admin do
    root to: "dashboard#show"

    resources :notifications, only: [ :index, :update ] do
      collection do
        patch :mark_all
      end
    end

    resources :users
    resources :leads
    resources :clients
    resources :services
    resources :quotes do
      resources :quote_messages, only: [ :create ]
      member do
        patch :accept
        patch :reject
        patch :send_quote
        get :pdf
      end
    end
    resources :projects do
      resources :tasks, only: [ :create, :update, :destroy ], controller: "project_tasks"
    end
    resources :tasks
    resources :invoices
    resources :payments
    resources :expenses
    resources :file_uploads, path: "files" do
      member do
        get :download
      end
    end
    resources :reminders, path: "follow-ups"
  end

  get "about", to: "pages#about"
  get "work", to: "pages#work"
  get "pricing", to: "pages#pricing"
  get "blog", to: "pages#blog"
  get "contact", to: "pages#contact"
  post "leads", to: "leads#create"
  get "team", to: "pages#team"
  get "careers", to: "pages#careers"
  get "testimonials", to: "pages#testimonials"
  get "case-studies", to: "pages#case_studies", as: :case_studies
  get "faqs", to: "pages#faqs"
  get "privacy", to: "pages#privacy"
  get "terms", to: "pages#terms"
  get "services/:slug", to: "pages#service", as: :service

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  root "pages#home"
end

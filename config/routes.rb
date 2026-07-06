Rails.application.routes.draw do
  devise_for :users, controllers: { registrations: "users/registrations" }
  resource :password_setup, only: [ :edit, :update ], controller: "users/password_setups"

  get "dashboard", to: "admin/dashboard#show", as: :dashboard_root

  namespace :admin do
    root to: "dashboard#show"

    resources :notifications, only: [ :index, :update ] do
      member do
        get :open
      end

      collection do
        patch :mark_all
      end
    end

    resources :users
    resources :leads do
      collection do
        get :import
        post :import, action: :process_import
        patch :bulk_update
        delete :bulk_destroy
      end

      resources :custom_fields, only: [ :create, :destroy ], controller: "lead_custom_fields", param: :index
    end
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
    resources :blog_categories, path: "blog-categories"
    resources :blog_posts, path: "blog"
  end

  get "sitemap.xml", to: "sitemap#show", defaults: { format: :xml }, format: false, as: :sitemap
  get "sitemap", to: redirect("/sitemap.xml")
  get "robots.txt", to: "robots#show", as: :robots
  get "llms.txt", to: "llms#show", as: :llms

  get "blog", to: "blog_posts#index", as: :blog
  get "blog/:slug", to: "blog_posts#show", as: :blog_post
  get "about", to: "pages#about"
  get "work", to: "pages#work"
  get "pricing", to: "pages#pricing"
  get "contact", to: "pages#contact"
  post "leads", to: "leads#create"
  namespace :ai_receptionist, path: "ai-receptionist" do
    post "messages", to: "messages#create"
  end
  get "team", to: "pages#team"
  get "careers", to: "pages#careers"
  get "testimonials", to: "pages#testimonials"
  get "case-studies", to: "pages#case_studies", as: :case_studies
  get "faqs", to: "pages#faqs"
  get "privacy", to: "pages#privacy"
  get "terms", to: "pages#terms"
  get "free-mvp-build", to: "pages#free_mvp_build", as: :free_mvp_build
  get "free-marketing-report", to: "pages#free_marketing_report", as: :free_marketing_report
  get "services/:slug", to: "pages#service", as: :service
  get "solutions/:slug", to: "pages#seo_landing", as: :seo_landing

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  root "pages#home"
end

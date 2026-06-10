Rails.application.routes.draw do
  devise_for :users

  get "dashboard", to: "admin/dashboard#show", as: :dashboard_root

  get "about", to: "pages#about"
  get "work", to: "pages#work"
  get "pricing", to: "pages#pricing"
  get "blog", to: "pages#blog"
  get "contact", to: "pages#contact"
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

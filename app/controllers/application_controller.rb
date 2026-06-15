class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  layout "visitor"

  rescue_from CanCan::AccessDenied, with: :handle_access_denied

  def current_ability
    @current_ability ||= Ability.new(current_user)
  end

  private

  def handle_access_denied
    if user_signed_in?
      redirect_to dashboard_root_path, alert: "You do not have access to that area."
    else
      redirect_to new_user_session_path, alert: "Please sign in to continue."
    end
  end

  def after_sign_in_path_for(_resource)
    dashboard_root_path
  end

  def after_sign_out_path_for(_resource_or_scope)
    root_path
  end
end

class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern, unless: :crawler_asset_request?

  layout "visitor"

  rescue_from CanCan::AccessDenied, with: :handle_access_denied
  rescue_from ActionController::ParameterMissing, with: :handle_upload_payload_error
  rescue_from ActionController::BadRequest, with: :handle_upload_payload_error

  def current_ability
    @current_ability ||= Ability.new(current_user)
  end

  private

  def crawler_asset_request?
    request.path.in?(%w[/sitemap.xml /robots.txt])
  end

  def handle_access_denied
    if user_signed_in?
      redirect_to dashboard_root_path, alert: "You do not have access to that area."
    else
      redirect_to new_user_session_path, alert: "Please sign in to continue."
    end
  end

  def handle_upload_payload_error(exception)
    Rails.logger.warn("Upload payload error: #{exception.class} #{exception.message}")

    message = "The upload was too large or incomplete. Images must be 25 MB or smaller."
    redirect_back fallback_location: dashboard_root_path, alert: message
  end

  def after_sign_in_path_for(_resource)
    dashboard_root_path
  end

  def after_sign_out_path_for(_resource_or_scope)
    root_path
  end
end

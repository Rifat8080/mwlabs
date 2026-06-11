module Users
  class PasswordSetupsController < ApplicationController
    layout "visitor"

    before_action :authenticate_user!
    before_action :ensure_password_setup_allowed

    def edit
    end

    def update
      if password_setup_params[:password].blank?
        current_user.errors.add(:password, "can't be blank")
        render :edit, status: :unprocessable_entity
      elsif current_user.update(password_setup_params)
        session.delete(:password_setup_user_id)
        bypass_sign_in current_user
        redirect_to dashboard_root_path, notice: "Your password is set. Welcome to your client portal."
      else
        render :edit, status: :unprocessable_entity
      end
    end

    private

    def password_setup_params
      params.require(:user).permit(:password, :password_confirmation)
    end

    def ensure_password_setup_allowed
      return if session[:password_setup_user_id] == current_user.id

      redirect_to dashboard_root_path, alert: "Password setup is only available after creating a new portal account."
    end
  end
end

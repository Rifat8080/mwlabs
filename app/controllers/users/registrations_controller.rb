module Users
  class RegistrationsController < Devise::RegistrationsController
    private

    def build_resource(hash = {})
      super
      self.resource.role = "client" if resource.role.blank? || resource.role == "admin"
      self.resource.status = "Active"
    end

    def sign_up_params
      params.require(:user).permit(:name, :phone, :email, :password, :password_confirmation)
    end

    def account_update_params
      params.require(:user).permit(:name, :phone, :email, :password, :password_confirmation, :current_password)
    end
  end
end

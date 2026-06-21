module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = find_verified_user
    end

    private

    def find_verified_user
      env["warden"].user || user_from_session || reject_unauthorized_connection
    end

    def user_from_session
      user_id = request.session.dig("warden.user.user.key", 0, 0)
      User.find_by(id: user_id) if user_id.present?
    end
  end
end

module Admin
  class NotificationsChannel < ApplicationCable::Channel
    def subscribed
      return unless current_user
      stream_for current_user
      transmit({
        type: "subscribed",
        message: "Connected to notifications",
        unread_count: current_user.notifications.unread.count
      })
    end

    def unsubscribed
      # Any cleanup needed when channel is unsubscribed
    end
  end
end

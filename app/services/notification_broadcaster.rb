class NotificationBroadcaster
  def self.stream_name(user)
    "notifications:user:#{user.id}"
  end

  def self.broadcast(user, payload)
    return unless user.is_a?(User)

    ActionCable.server.broadcast(stream_name(user), payload)
  end

  def self.unread_count_changed(user)
    broadcast(user, {
      type: "unread_count_changed",
      unread_count: user.notifications.unread.count
    })
  end
end

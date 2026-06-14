class ActivityLog < ApplicationRecord
  belongs_to :user, optional: true
  belongs_to :subject, polymorphic: true

  validates :action, presence: true

  def self.record!(subject:, action:, user: nil, details: nil, notify: true)
    activity = create!(subject: subject, user: user, action: action, details: details)
    if notify
      begin
        NotificationService.notify(notifiable: subject, action: action, actor: user, details: details)
      rescue StandardError => e
        Rails.logger.error("NotificationService failed: #{e.message}")
        Rails.logger.error(e)
      end
    end
    activity
  end
end

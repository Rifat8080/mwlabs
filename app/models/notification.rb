class Notification < ApplicationRecord
  LEVELS = %w[info success warning danger].freeze

  belongs_to :recipient, polymorphic: true
  belongs_to :notifiable, polymorphic: true, optional: true
  belongs_to :actor, polymorphic: true, optional: true

  scope :unread, -> { where(read_at: nil) }
  scope :read, -> { where.not(read_at: nil) }
  scope :recent, -> { order(created_at: :desc) }

  validates :action, :recipient, presence: true
  validates :level, inclusion: { in: LEVELS }

  after_create_commit :broadcast_created

  def mark_as_read!
    update!(read_at: Time.current) if read_at.nil?
  end

  def badge_class
    case level
    when "info" then "bg-blue-50 text-blue-700"
    when "success" then "bg-emerald-50 text-emerald-700"
    when "warning" then "bg-amber-50 text-amber-700"
    when "danger" then "bg-rose-50 text-rose-700"
    else "bg-slate-50 text-slate-700"
    end
  end

  def icon_class
    icon.presence || "fa-bell"
  end

  def broadcast_created
    return unless recipient.is_a?(User)

    Admin::NotificationsChannel.broadcast_to(
      recipient,
      type: "notification_created",
      dropdown_html: ApplicationController.render(
        partial: "shared/notification_item",
        locals: { notification: self, dom_id: "dropdown_notification_#{id}" }
      ),
      index_html: ApplicationController.render(
        partial: "shared/notification_item",
        locals: { notification: self, dom_id: "admin_notification_#{id}", variant: :page }
      ),
      unread_count: recipient.notifications.unread.count
    )
  rescue StandardError => e
    Rails.logger.error("Notification broadcast failed: #{e.message}")
    Rails.logger.error(e.backtrace.join("\n"))
  end
end

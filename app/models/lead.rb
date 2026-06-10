class Lead < ApplicationRecord
  SOURCES = [
    "Website Contact Form", "Quotation Form", "Facebook", "Google Ads", "WhatsApp",
    "Referral", "Cold Email", "LinkedIn", "Manual Entry"
  ].freeze
  STATUSES = [
    "New", "Contacted", "Need Requirement", "Quote Preparing", "Quote Sent",
    "Follow Up", "Won", "Lost", "Future Prospect"
  ].freeze
  URGENCIES = [ "Low", "Normal", "High", "Urgent" ].freeze

  belongs_to :assigned_to, class_name: "User", optional: true, inverse_of: :assigned_leads
  belongs_to :client, optional: true
  has_many :quotes, dependent: :nullify
  has_many :activity_logs, as: :subject, dependent: :destroy
  has_many :reminders, as: :remindable, dependent: :destroy

  validates :name, presence: true
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }, allow_blank: true
  validates :status, inclusion: { in: STATUSES }

  after_create_commit :record_created_activity
  after_save_commit :sync_follow_up_reminder, if: :saved_change_to_follow_up_date?
  after_update_commit :record_status_activity, if: :saved_change_to_status?

  scope :followups_due, -> { where.not(follow_up_date: nil).where(follow_up_date: ..Date.current) }
  scope :new_this_month, -> { where(created_at: Time.current.beginning_of_month..) }

  def display_name
    company_name.present? ? "#{name} (#{company_name})" : name
  end

  def convert_to_client!
    return client if client.present?

    created_client = Client.create!(
      name: name,
      company_name: company_name,
      email: email,
      phone: phone,
      country: country,
      source: source,
      notes: notes,
      follow_up_date: follow_up_date
    )

    update!(client: created_client, status: "Won")
    created_client
  end

  private

  def record_created_activity
    ActivityLog.record!(subject: self, action: "Lead created", details: "Lead entered from #{source.presence || 'manual entry'}.")
  end

  def record_status_activity
    ActivityLog.record!(subject: self, action: "Lead status changed", details: "Moved to #{status}.")
  end

  def sync_follow_up_reminder
    return if follow_up_date.blank?

    reminders.where(status: "Open").first_or_initialize.tap do |reminder|
      reminder.user = assigned_to || User.where(role: "admin").first || User.first
      reminder.title = "Follow up with #{display_name}"
      reminder.due_date = follow_up_date
      reminder.next_action = "Follow up about #{service_interest.presence || 'their requirement'}"
      reminder.note = notes
      reminder.save! if reminder.user.present?
    end
  end
end

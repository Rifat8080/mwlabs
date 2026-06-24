class Lead < ApplicationRecord
  SOURCES = [
    "Website Contact Form", "AI Receptionist", "Landing Page", "Quotation Form", "Facebook", "Messenger",
    "Google Ads", "WhatsApp", "Referral", "Cold Email", "LinkedIn", "Manual Entry"
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
  has_many :ai_receptionist_conversations, dependent: :nullify

  validates :name, presence: true
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }, allow_blank: true
  validates :status, inclusion: { in: STATUSES }

  after_create_commit :record_created_activity
  after_save_commit :sync_follow_up_reminder, if: :saved_change_to_follow_up_date?
  after_save :sync_client_from_status, if: :saved_change_to_status?
  after_update_commit :record_status_activity, if: :saved_change_to_status?

  scope :followups_due, -> { where.not(follow_up_date: nil).where(follow_up_date: ..Date.current) }
  scope :new_this_month, -> { where(created_at: Time.current.beginning_of_month..) }

  def display_name
    company_name.present? ? "#{name} (#{company_name})" : name
  end

  def next_action
    case status
    when "New"
      "Contact the lead and confirm the requirement."
    when "Contacted"
      "Book a meeting or collect deeper requirements."
    when "Need Requirement"
      "Collect missing business details, assets, and scope."
    when "Quote Preparing"
      "Prepare and send the quote."
    when "Quote Sent", "Follow Up"
      "Follow up and handle objections."
    when "Won"
      "Start project onboarding."
    when "Lost"
      "Record why the lead was lost."
    when "Future Prospect"
      "Schedule a future nurture follow-up."
    else
      "Review lead status."
    end
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

  def sync_client_from_status
    case status
    when "Won"
      convert_to_client!
    when "Lost"
      remove_client_for_lost_lead!
    end
  end

  def remove_client_for_lost_lead!
    linked_client = client
    return if linked_client.blank?

    update_column(:client_id, nil)

    if linked_client.projects.exists? || linked_client.invoices.exists?
      linked_client.update!(status: "Inactive")
      ActivityLog.record!(
        subject: self,
        action: "Client archived",
        details: "Linked client was marked inactive because project or invoice history exists."
      )
    elsif linked_client.leads.where.not(id: id).none?
      linked_client.destroy!
      ActivityLog.record!(subject: self, action: "Client removed", details: "Linked client was removed after the lead was lost.")
    end
  end

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

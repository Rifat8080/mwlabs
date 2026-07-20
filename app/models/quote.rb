class Quote < ApplicationRecord
  STATUSES = [ "Draft", "Sent", "Viewed", "Accepted", "Rejected", "Revised", "Expired" ].freeze
  NEGOTIATION_STATUSES = %w[none open resolved].freeze
  CLIENT_VISIBLE_STATUSES = %w[Sent Viewed Revised Accepted Rejected Expired].freeze

  # pdf_symbol is an ASCII-safe fallback for Prawn's built-in Helvetica font, which only
  # supports Windows-1252 and cannot render ৳, ₹, or Arabic script without a bundled Unicode font.
  CURRENCIES = {
    "USD" => { symbol: "$", name: "US Dollar" },
    "BDT" => { symbol: "৳", pdf_symbol: "Tk ", name: "Bangladeshi Taka" },
    "EUR" => { symbol: "€", name: "Euro" },
    "GBP" => { symbol: "£", name: "British Pound" },
    "AUD" => { symbol: "A$", name: "Australian Dollar" },
    "CAD" => { symbol: "C$", name: "Canadian Dollar" },
    "INR" => { symbol: "₹", pdf_symbol: "Rs ", name: "Indian Rupee" },
    "AED" => { symbol: "د.إ", pdf_symbol: "AED ", name: "UAE Dirham" },
    "SGD" => { symbol: "S$", name: "Singapore Dollar" },
    "JPY" => { symbol: "¥", name: "Japanese Yen" }
  }.freeze

  belongs_to :client, optional: true
  belongs_to :lead, optional: true
  belongs_to :sent_by, class_name: "User", optional: true
  has_many :quote_items, dependent: :destroy
  has_many :quote_messages, dependent: :destroy
  has_many :projects, dependent: :nullify
  has_many :invoices, dependent: :nullify
  has_many :activity_logs, as: :subject, dependent: :destroy
  has_many :reminders, as: :remindable, dependent: :destroy

  accepts_nested_attributes_for :quote_items, allow_destroy: true, reject_if: :all_blank

  before_validation :calculate_totals
  before_create :ensure_public_token
  after_create_commit :record_created_activity
  after_update_commit :sync_sales_workflow, if: :saved_change_to_status?

  validates :status, inclusion: { in: STATUSES }
  validates :negotiation_status, inclusion: { in: NEGOTIATION_STATUSES }
  validates :currency, inclusion: { in: CURRENCIES.keys }
  validates :total_amount, numericality: { greater_than_or_equal_to: 0 }
  validates :public_token, uniqueness: true, allow_nil: true
  validate :client_or_lead_present

  def display_name
    "Quote #{created_at&.strftime('%Y%m%d') || 'Draft'} - #{client&.display_name || lead&.display_name}"
  end

  def quote_reference
    public_token.presence || "Q-#{id.to_s.first(8).upcase}"
  end

  def currency_symbol
    CURRENCIES.fetch(currency, CURRENCIES["USD"])[:symbol]
  end

  # ASCII-safe symbol for PDF rendering (Prawn's built-in font can't render all currency symbols).
  def currency_pdf_symbol
    entry = CURRENCIES.fetch(currency, CURRENCIES["USD"])
    entry[:pdf_symbol] || entry[:symbol]
  end

  def recipient_name
    client&.display_name || lead&.display_name
  end

  def recipient_email
    client&.email || lead&.email
  end

  def sent?
    sent_at.present? || status.in?(%w[Sent Viewed Revised Accepted Rejected Expired])
  end

  def accepted?
    status == "Accepted" || accepted_at.present?
  end

  def decision_closed?
    accepted? || status.in?(%w[Rejected Expired])
  end

  def normalize_decision_state!
    return unless accepted_at.present? && status != "Accepted"

    update!(status: "Accepted", negotiation_status: "resolved")
  end

  def negotiable?
    !decision_closed? && status != "Draft"
  end

  def negotiation_open?
    negotiation_status == "open"
  end

  def acceptance_blocked_by_negotiation?
    negotiation_open?
  end

  def latest_negotiation_message
    quote_messages.chronological.last
  end

  def awaiting_response_from
    return "Client" unless negotiation_open?

    latest_message = quote_messages.visible_to_client.where.not(kind: "system").chronological.last
    return "Client" if latest_message.blank?
    return "M&W Labs" if latest_message.user&.role == "client"

    "Client"
  end

  def negotiation_message_count
    quote_messages.visible_to_client.where.not(kind: "system").count
  end

  def last_negotiation_activity_at
    latest_negotiation_message&.created_at || sent_at || updated_at
  end

  def accessible_to_client?(user)
    return false if user.blank? || user.role != "client"
    return false unless status.in?(CLIENT_VISIBLE_STATUSES)

    linked_client = Client.find_by("LOWER(email) = ?", user.email.downcase)
    return true if client.present? && linked_client&.id == client_id
    return true if lead.present? && lead.email.present? && lead.email.downcase == user.email.downcase

    false
  end

  def next_action
    case status
    when "Draft"
      "Finalize pricing and send the quote."
    when "Sent", "Viewed", "Revised"
      negotiation_open? ? "Resolve the open negotiation before accepting this quote." : "Follow up before the quote validity date."
    when "Accepted"
      "Confirm kickoff and review the generated project."
    when "Rejected"
      "Capture rejection reason and decide whether to revise."
    when "Expired"
      "Revise pricing or mark as future prospect."
    else
      "Review quote status."
    end
  end

  def send_to_recipient!(user:)
    transaction do
      ensure_public_token!
      update!(
        status: "Sent",
        sent_at: Time.current,
        sent_by: user,
        negotiation_status: "none"
      )
      quote_messages.create!(
        user: user,
        kind: "system",
        message: "Quote sent to #{recipient_name} via the client portal.",
        internal: false
      )
      ActivityLog.record!(subject: self, user: user, action: "Quote sent", details: "Quote published to portal for #{recipient_name}.")
    end
  end

  def mark_viewed!(user: nil)
    return if status != "Sent"

    update!(status: "Viewed")
    quote_messages.create!(
      user: user || sent_by || User.where(role: "admin").first,
      kind: "system",
      message: "Quote opened in the client portal.",
      internal: true
    )
    ActivityLog.record!(subject: self, user: user, action: "Quote viewed", details: "Recipient viewed the quote in the portal.")
  end

  def request_revision!(user:, message:, kind: "change_request", internal: false)
    transaction do
      quote_messages.create!(user: user, message: message, kind: kind, internal: internal)
      update!(status: "Revised", negotiation_status: "open") unless accepted? || internal
      ActivityLog.record!(
        subject: self,
        user: user,
        action: kind == "staff_reply" ? "Quote reply posted" : "Quote change requested",
        details: message.truncate(180),
        notify: !internal
      )
      schedule_negotiation_follow_up!(user)
    end
  end

  def resolve_negotiation!(user:, message: nil)
    transaction do
      update!(negotiation_status: "resolved")
      quote_messages.create!(
        user: user,
        kind: "system",
        message: message.presence || "Negotiation resolved. This quote is ready for acceptance.",
        internal: false
      )
      ActivityLog.record!(subject: self, user: user, action: "Quote negotiation resolved", details: "Quote is ready for acceptance.")
    end
  end

  def reject!(user:, message: nil)
    transaction do
      update!(status: "Rejected", negotiation_status: "resolved")
      quote_messages.create!(
        user: user,
        kind: "system",
        message: message.presence || "Quote was rejected.",
        internal: false
      )
      lead&.update!(status: "Lost") if lead.present?
      ActivityLog.record!(subject: self, user: user, action: "Quote rejected", details: message.presence || "Quote rejected in portal.")
    end
  end

  def accept!(user: nil)
    transaction do
      if accepted_at.present?
        normalize_decision_state!
        return [ projects.first, invoices.first ]
      end
      raise_open_negotiation_error! if acceptance_blocked_by_negotiation?

      accepted_client = client || lead&.convert_to_client!
      update!(client: accepted_client, status: "Accepted", accepted_at: Time.current, negotiation_status: "resolved")

      project = create_project_from_quote!(accepted_client)
      invoice = create_invoice_from_quote!(accepted_client, project)

      quote_messages.create!(
        user: user || sent_by || User.where(role: "admin").first,
        kind: "system",
        message: "Quote accepted. Project onboarding has started.",
        internal: false
      )
      ActivityLog.record!(subject: self, user: user, action: "Quote accepted", details: "Project and draft invoice created.")
      [ project, invoice ]
    end
  end

  def calculate_totals
    self.discount ||= 0
    self.tax ||= 0
    self.subtotal = quote_items.reject(&:marked_for_destruction?).sum do |item|
      item.quantity.to_d * item.unit_price.to_d
    end
    self.total_amount = subtotal - discount + tax
  end

  private

  def ensure_public_token
    self.public_token ||= SecureRandom.urlsafe_base64(24)
  end

  def ensure_public_token!
    ensure_public_token
    save! if public_token_changed?
  end

  def client_or_lead_present
    errors.add(:base, "Select a client or lead") if client.blank? && lead.blank?
  end

  def raise_open_negotiation_error!
    errors.add(:base, "Resolve the open quote negotiation before accepting this quote.")
    raise ActiveRecord::RecordInvalid, self
  end

  def create_project_from_quote!(accepted_client)
    Projects::QuoteProjectBuilder.new(self, accepted_client).call
  end

  def create_invoice_from_quote!(accepted_client, project)
    Invoice.create!(
      client: accepted_client,
      project: project,
      quote: self,
      invoice_number: Invoice.next_number,
      issue_date: Date.current,
      due_date: 14.days.from_now.to_date,
      subtotal: subtotal,
      discount: discount,
      tax: tax,
      total: total_amount,
      status: "Draft",
      notes: payment_terms
    )
  end

  def record_created_activity
    ActivityLog.record!(subject: self, action: "Quote created", details: "Quote total is #{format('%.2f', total_amount)}.")
  end

  def sync_sales_workflow
    ActivityLog.record!(subject: self, action: "Quote status changed", details: "Moved to #{status}.")

    case status
    when "Sent", "Viewed", "Revised"
      sync_lead_quote_sent!
      schedule_quote_follow_up!
    when "Rejected"
      lead&.update!(status: "Lost")
    when "Expired"
      lead&.update!(status: "Future Prospect")
    end
  end

  def sync_lead_quote_sent!
    return if lead.blank? || lead.status.in?([ "Won", "Lost" ])

    lead.update!(
      status: "Quote Sent",
      follow_up_date: suggested_follow_up_date
    )
  end

  def schedule_quote_follow_up!
    owner = lead&.assigned_to || sent_by || User.where(role: "admin").first || User.first
    return if owner.blank?

    reminders.where(status: "Open").first_or_initialize.tap do |reminder|
      reminder.user = owner
      reminder.title = "Follow up quote for #{client&.display_name || lead&.display_name}"
      reminder.due_date = suggested_follow_up_date
      reminder.next_action = next_action
      reminder.note = notes
      reminder.save!
    end
  end

  def schedule_negotiation_follow_up!(actor)
    owner = lead&.assigned_to || sent_by || User.where(role: "admin").first
    return if owner.blank? || actor == owner

    reminders.create!(
      user: owner,
      title: "Respond to quote negotiation for #{recipient_name}",
      due_date: Date.current,
      status: "Open",
      next_action: "Review the latest quote message and reply or revise pricing.",
      note: quote_messages.order(created_at: :desc).first&.message
    )
  end

  def suggested_follow_up_date
    return 2.days.from_now.to_date if validity_date.blank?

    [ Date.current, validity_date - 2.days ].max
  end
end

class Quote < ApplicationRecord
  STATUSES = [ "Draft", "Sent", "Viewed", "Accepted", "Rejected", "Revised", "Expired" ].freeze

  belongs_to :client, optional: true
  belongs_to :lead, optional: true
  has_many :quote_items, dependent: :destroy
  has_many :projects, dependent: :nullify
  has_many :invoices, dependent: :nullify
  has_many :activity_logs, as: :subject, dependent: :destroy
  has_many :reminders, as: :remindable, dependent: :destroy

  accepts_nested_attributes_for :quote_items, allow_destroy: true, reject_if: :all_blank

  before_validation :calculate_totals
  after_create_commit :record_created_activity
  after_update_commit :sync_sales_workflow, if: :saved_change_to_status?

  validates :status, inclusion: { in: STATUSES }
  validates :total_amount, numericality: { greater_than_or_equal_to: 0 }
  validate :client_or_lead_present

  def display_name
    "Quote #{created_at&.strftime('%Y%m%d') || 'Draft'} - #{client&.display_name || lead&.display_name}"
  end

  def accepted?
    status == "Accepted"
  end

  def next_action
    case status
    when "Draft"
      "Finalize pricing and send the quote."
    when "Sent", "Viewed", "Revised"
      "Follow up before the quote validity date."
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

  def accept!(user: nil)
    transaction do
      return [ projects.first, invoices.first ] if accepted_at.present?

      accepted_client = client || lead&.convert_to_client!
      update!(client: accepted_client, status: "Accepted", accepted_at: Time.current)

      project = create_project_from_quote!(accepted_client)
      invoice = create_invoice_from_quote!(accepted_client, project)

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

  def client_or_lead_present
    errors.add(:base, "Select a client or lead") if client.blank? && lead.blank?
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
    owner = lead&.assigned_to || User.where(role: "admin").first || User.first
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

  def suggested_follow_up_date
    return 2.days.from_now.to_date if validity_date.blank?

    [ Date.current, validity_date - 2.days ].max
  end
end

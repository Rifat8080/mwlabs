class Invoice < ApplicationRecord
  STATUSES = [ "Draft", "Sent", "Partially Paid", "Paid", "Overdue", "Cancelled" ].freeze

  belongs_to :client
  belongs_to :project, optional: true
  belongs_to :quote, optional: true
  has_many :payments, dependent: :destroy

  before_validation :set_invoice_number, on: :create
  before_validation :calculate_total
  after_create_commit :record_created_activity
  after_update_commit :record_status_activity, if: :saved_change_to_status?

  validates :invoice_number, presence: true, uniqueness: true
  validates :status, inclusion: { in: STATUSES }
  validates :total, :paid_amount, numericality: { greater_than_or_equal_to: 0 }

  scope :unpaid, -> { where.not(status: [ "Paid", "Cancelled" ]) }
  scope :overdue, -> { unpaid.where(due_date: ...Date.current) }

  def self.mark_overdue!
    overdue.where.not(status: "Overdue").find_each do |invoice|
      invoice.update!(status: "Overdue")
    end
  end

  def self.next_number
    "MW-#{Date.current.strftime('%Y%m')}-#{(count + 1).to_s.rjust(4, '0')}"
  end

  def display_name
    invoice_number
  end

  def due_amount
    total - paid_amount
  end

  def next_action
    case status
    when "Draft"
      "Review and send invoice to the client."
    when "Sent"
      "Follow up before due date #{due_date || 'is reached'}."
    when "Partially Paid"
      "Chase remaining balance of #{format('%.2f', due_amount)}."
    when "Overdue"
      "Escalate payment follow-up immediately."
    when "Paid"
      "Reconcile payment and review project profitability."
    else
      "Review invoice status."
    end
  end

  def refresh_payment_status!
    new_paid_amount = payments.sum(:amount)
    update!(
      paid_amount: new_paid_amount,
      status: next_payment_status(new_paid_amount)
    )
  end

  private

  def set_invoice_number
    self.invoice_number = self.class.next_number if invoice_number.blank?
  end

  def calculate_total
    self.subtotal ||= 0
    self.discount ||= 0
    self.tax ||= 0
    self.total = subtotal - discount + tax
    self.paid_amount ||= 0
  end

  def next_payment_status(amount_paid = paid_amount)
    return "Cancelled" if status == "Cancelled"
    return "Paid" if amount_paid >= total && total.positive?
    return "Partially Paid" if amount_paid.positive?
    return "Overdue" if due_date.present? && due_date < Date.current

    status.presence || "Draft"
  end

  def record_created_activity
    ActivityLog.record!(subject: project, action: "Invoice drafted", details: "#{invoice_number} for #{format('%.2f', total)}.") if project.present?
  end

  def record_status_activity
    ActivityLog.record!(subject: project, action: "Invoice status changed", details: "#{invoice_number} moved to #{status}.") if project.present?
  end
end

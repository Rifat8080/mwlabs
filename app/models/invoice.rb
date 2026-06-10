class Invoice < ApplicationRecord
  STATUSES = [ "Draft", "Sent", "Partially Paid", "Paid", "Overdue", "Cancelled" ].freeze

  belongs_to :client
  belongs_to :project, optional: true
  belongs_to :quote, optional: true
  has_many :payments, dependent: :destroy

  before_validation :set_invoice_number, on: :create
  before_validation :calculate_total

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
end

class Payment < ApplicationRecord
  METHODS = [ "Bank Transfer", "Cash", "bKash", "Nagad", "Wise", "Payoneer", "Stripe", "PayPal" ].freeze

  belongs_to :invoice

  after_commit :refresh_invoice_status
  after_create_commit :record_payment_activity

  validates :amount, numericality: { greater_than: 0 }
  validates :payment_method, inclusion: { in: METHODS }, allow_blank: true

  def display_name
    "#{amount} on #{payment_date || created_at&.to_date}"
  end

  private

  def refresh_invoice_status
    invoice.refresh_payment_status!
  end

  def record_payment_activity
    return if invoice.project.blank?

    ActivityLog.record!(
      subject: invoice.project,
      action: "Payment recorded",
      details: "#{format('%.2f', amount)} received for #{invoice.invoice_number} via #{payment_method.presence || 'manual payment'}."
    )
  end
end

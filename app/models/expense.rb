class Expense < ApplicationRecord
  CATEGORIES = [
    "Software Subscriptions", "Hosting", "Domain", "Ads", "Freelancer Payment",
    "Employee Salary", "Office Cost", "Internet", "Design Assets", "Video Assets",
    "Travel", "Client Entertainment", "Loan Repayment", "Investment", "Miscellaneous"
  ].freeze
  METHODS = Payment::METHODS

  belongs_to :project, optional: true
  belongs_to :client, optional: true

  has_one_attached :receipt

  validates :date, :category, presence: true
  validates :category, inclusion: { in: CATEGORIES }
  validates :amount, numericality: { greater_than: 0 }
  validates :payment_method, inclusion: { in: METHODS }, allow_blank: true

  def display_name
    "#{category} - #{amount}"
  end
end

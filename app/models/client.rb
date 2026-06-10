class Client < ApplicationRecord
  STATUSES = [ "Active", "Inactive", "Past", "Prospect" ].freeze

  has_many :leads, dependent: :nullify
  has_many :quotes, dependent: :nullify
  has_many :projects, dependent: :restrict_with_error
  has_many :invoices, dependent: :restrict_with_error
  has_many :expenses, dependent: :nullify
  has_many :file_uploads, dependent: :nullify

  before_destroy :mark_linked_leads_lost, prepend: true

  validates :name, presence: true
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }, allow_blank: true
  validates :status, inclusion: { in: STATUSES }

  def display_name
    company_name.presence || name
  end

  private

  def mark_linked_leads_lost
    Lead.where(client_id: id).update_all(status: "Lost", updated_at: Time.current)
  end
end

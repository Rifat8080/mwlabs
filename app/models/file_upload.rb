class FileUpload < ApplicationRecord
  CATEGORIES = [
    "Client Logo", "Brand Guidelines", "Raw Footage", "Edited Video", "Website Content",
    "Proposal", "Invoice", "Contract", "Ad Creatives", "Design Files", "Final Delivery Files"
  ].freeze
  VISIBILITIES = [ "Internal Only", "Client Visible" ].freeze
  STATUSES = [ "Uploaded", "Needs Approval", "Approved", "Rejected", "Archived" ].freeze

  belongs_to :client, optional: true
  belongs_to :project, optional: true
  belongs_to :task, optional: true

  has_one_attached :file

  before_validation :set_approval_status

  validates :category, inclusion: { in: CATEGORIES }, allow_blank: true
  validates :visibility, inclusion: { in: VISIBILITIES }, allow_blank: true
  validates :status, inclusion: { in: STATUSES }

  def display_name
    file.attached? ? file.filename.to_s : "#{category} file"
  end

  private

  def set_approval_status
    self.status = "Needs Approval" if needs_approval? && (status.blank? || status == "Uploaded")
    self.visibility ||= "Internal Only"
  end
end

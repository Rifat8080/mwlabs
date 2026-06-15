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

  before_validation :sync_relationships
  before_validation :set_approval_status

  validate :file_must_be_attached
  validate :task_must_belong_to_project
  validate :client_must_match_project

  validates :category, inclusion: { in: CATEGORIES }, allow_blank: true
  validates :visibility, inclusion: { in: VISIBILITIES }, allow_blank: true
  validates :status, inclusion: { in: STATUSES }

  def display_name
    file.attached? ? file.filename.to_s : "#{category} file"
  end

  def file_size
    return unless file.attached?

    file.blob.byte_size
  end

  def content_type
    return unless file.attached?

    file.blob.content_type
  end

  private

  def sync_relationships
    self.project ||= task.project if task.present?
    self.client ||= project.client if project.present?
  end

  def set_approval_status
    self.status = "Needs Approval" if needs_approval? && (status.blank? || status == "Uploaded")
    self.visibility ||= "Internal Only"
  end

  def file_must_be_attached
    return if persisted? && file.attached?

    errors.add(:file, "must be attached") unless file.attached?
  end

  def task_must_belong_to_project
    return if task.blank? || project.blank? || task.project_id == project.id

    errors.add(:task, "must belong to the selected project")
  end

  def client_must_match_project
    return if client.blank? || project.blank? || project.client_id == client.id

    errors.add(:client, "must match the selected project's client")
  end
end

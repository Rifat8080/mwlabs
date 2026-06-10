class Service < ApplicationRecord
  CATEGORIES = [
    "Software & Web Development", "Digital Marketing", "Branding & Design",
    "Video Editing", "AI Automation"
  ].freeze
  STATUSES = [ "Active", "Inactive" ].freeze

  validates :name, :category, presence: true
  validates :category, inclusion: { in: CATEGORIES }
  validates :status, inclusion: { in: STATUSES }
  validates :base_price, numericality: { greater_than_or_equal_to: 0 }

  scope :active, -> { where(status: "Active") }

  def display_name
    "#{name} - #{category}"
  end

  def checklist_items
    default_task_checklist.to_s.lines.map(&:strip).reject(&:blank?)
  end
end

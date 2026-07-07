class DailyPlan < ApplicationRecord
  has_many :checklist_items, as: :checklistable, dependent: :destroy

  accepts_nested_attributes_for :checklist_items, allow_destroy: true, reject_if: :all_blank

  validates :date, presence: true, uniqueness: true

  def self.for_date(date)
    find_or_initialize_by(date: date)
  end

  def display_name
    "Daily Plan: #{date}"
  end

  def morning_checklist_items
    checklist_items.where(list_type: "morning").ordered
  end

  def evening_checklist_items
    checklist_items.where(list_type: "evening").ordered
  end
end

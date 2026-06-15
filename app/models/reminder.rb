class Reminder < ApplicationRecord
  STATUSES = [ "Open", "Done", "Snoozed", "Cancelled" ].freeze

  belongs_to :user
  belongs_to :remindable, polymorphic: true, optional: true

  validates :title, :due_date, presence: true
  validates :status, inclusion: { in: STATUSES }

  scope :due_today, -> { where(status: "Open", due_date: ..Date.current) }

  def display_name
    title
  end
end

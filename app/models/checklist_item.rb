class ChecklistItem < ApplicationRecord
  LIST_TYPES = %w[morning evening].freeze

  belongs_to :checklistable, polymorphic: true

  validates :title, presence: true

  scope :ordered, -> { order(position: :asc, created_at: :asc) }
end

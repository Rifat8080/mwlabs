class AgencyTaskCategory < ApplicationRecord
  COLORS = %w[slate blue emerald purple pink amber cyan rose].freeze

  has_many :agency_tasks, dependent: :nullify

  validates :name, presence: true, uniqueness: true

  scope :ordered, -> { order(position: :asc, name: :asc) }

  def display_name
    name
  end
end

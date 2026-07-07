class AiKnowledgeEntry < ApplicationRecord
  validates :key, presence: true, uniqueness: true

  scope :active, -> { where(active: true) }

  def display_name
    key
  end
end

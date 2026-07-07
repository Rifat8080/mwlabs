class AiAssistantMessage < ApplicationRecord
  ROLES = %w[user assistant].freeze

  belongs_to :ai_assistant_conversation

  validates :role, inclusion: { in: ROLES }

  scope :ordered, -> { order(created_at: :asc) }
  scope :for_feature, ->(feature) { where(feature: feature) }

  def display_name
    "#{role}: #{content.to_s.truncate(40)}"
  end
end

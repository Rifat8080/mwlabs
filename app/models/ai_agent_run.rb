class AiAgentRun < ApplicationRecord
  STATUSES = %w[success error].freeze

  belongs_to :user, optional: true

  validates :agent_key, presence: true
  validates :status, inclusion: { in: STATUSES }

  scope :recent, -> { order(created_at: :desc) }
  scope :for_agent, ->(agent_key) { where(agent_key: agent_key) }

  def display_name
    "#{agent_key} (#{status})"
  end
end

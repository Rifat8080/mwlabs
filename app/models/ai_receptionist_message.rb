class AiReceptionistMessage < ApplicationRecord
  ROLES = %w[visitor assistant system].freeze

  belongs_to :ai_receptionist_conversation, touch: :last_message_at

  validates :role, inclusion: { in: ROLES }
  validates :content, presence: true

  scope :chronological, -> { order(:created_at) }

  def from_visitor?
    role == "visitor"
  end
end

class AiAssistantConversation < ApplicationRecord
  belongs_to :user
  has_many :ai_assistant_messages, dependent: :destroy

  def self.current_for(user)
    where(user: user).order(created_at: :desc).first_or_create!
  end

  def display_name
    title.presence || "Conversation #{id}"
  end
end

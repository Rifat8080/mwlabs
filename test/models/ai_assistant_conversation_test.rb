require "test_helper"

class AiAssistantConversationTest < ActiveSupport::TestCase
  test "current_for finds the most recent conversation or creates one" do
    user = users(:admin)
    conversation = AiAssistantConversation.current_for(user)
    assert conversation.persisted?

    assert_equal conversation, AiAssistantConversation.current_for(user)
  end

  test "destroys its messages when destroyed" do
    conversation = AiAssistantConversation.create!(user: users(:admin))
    conversation.ai_assistant_messages.create!(role: "user", content: "hi")

    assert_difference "AiAssistantMessage.count", -1 do
      conversation.destroy
    end
  end
end

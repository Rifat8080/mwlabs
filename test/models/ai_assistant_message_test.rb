require "test_helper"

class AiAssistantMessageTest < ActiveSupport::TestCase
  test "requires a valid role" do
    conversation = AiAssistantConversation.create!(user: users(:admin))
    message = AiAssistantMessage.new(ai_assistant_conversation: conversation, role: "not_a_role")

    assert_not message.valid?
    assert_includes message.errors[:role], "is not included in the list"
  end

  test "ordered scope returns messages oldest first" do
    conversation = AiAssistantConversation.create!(user: users(:admin))
    second = conversation.ai_assistant_messages.create!(role: "user", content: "second")
    first = conversation.ai_assistant_messages.create!(role: "assistant", content: "first", created_at: 1.hour.ago)

    assert_equal [ first, second ], conversation.ai_assistant_messages.ordered.to_a
  end
end

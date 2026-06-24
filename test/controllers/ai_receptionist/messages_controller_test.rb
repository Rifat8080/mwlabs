require "test_helper"

module AiReceptionist
  class MessagesControllerTest < ActionDispatch::IntegrationTest
    test "creates a website receptionist message through json endpoint" do
      conversation = AiReceptionistConversation.create!(channel: "website", visitor_token: "controller-token")
      assistant_message = conversation.ai_receptionist_messages.create!(
        role: "assistant",
        content: "Thanks, I can help with that.",
        llm_model: "test-local-model"
      )
      result = ConversationHandler::Result.new(
        conversation: conversation,
        assistant_message: assistant_message,
        reply: assistant_message.content,
        fallback: false
      )

      with_conversation_handler_result(result) do
        post ai_receptionist_messages_url,
          params: { message: "Need a website", visitor_token: "controller-token" },
          as: :json
      end

      assert_response :success
      payload = JSON.parse(response.body)
      assert_equal "Thanks, I can help with that.", payload["reply"]
      assert_equal "controller-token", payload["visitor_token"]
      assert_equal conversation.id, payload["conversation_id"]
      assert_equal false, payload["fallback"]
    end

    test "returns validation error for blank message" do
      post ai_receptionist_messages_url, params: { message: "" }, as: :json

      assert_response :unprocessable_entity
      assert_equal "Message cannot be blank", JSON.parse(response.body)["error"]
    end

    private

    def with_conversation_handler_result(result)
      original_call = ConversationHandler.method(:call)
      ConversationHandler.define_singleton_method(:call) { |**_kwargs| result }
      yield
    ensure
      ConversationHandler.define_singleton_method(:call) do |*args, **kwargs, &block|
        original_call.call(*args, **kwargs, &block)
      end
    end
  end
end

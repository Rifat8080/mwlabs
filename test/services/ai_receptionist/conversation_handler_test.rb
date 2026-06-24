require "test_helper"

module AiReceptionist
  class ConversationHandlerTest < ActiveSupport::TestCase
    class FakeModelClient
      attr_reader :messages

      def initialize(content: "Thanks, I captured that. What timeline should we plan around?")
        @content = content
      end

      def chat(messages:)
        @messages = messages
        { content: @content, model: "test-local-model" }
      end
    end

    class FailingModelClient
      def chat(messages:)
        raise LocalModelClient::Error, "Ollama is not running"
      end
    end

    test "captures a visitor message, local model reply, and qualified lead" do
      model_client = FakeModelClient.new

      result = ConversationHandler.call(
        visitor_token: "visitor-token-1",
        message: "Hi, my name is Rifat. My email is rifat@example.com. I need a website for my shop and budget is 50000 BDT.",
        model_client: model_client
      )

      assert_equal "test-local-model", result.assistant_message.llm_model
      assert_equal "Thanks, I captured that. What timeline should we plan around?", result.reply
      assert_not result.fallback?
      assert_equal 2, result.conversation.ai_receptionist_messages.count
      assert_equal "Rifat", result.conversation.name
      assert_equal "rifat@example.com", result.conversation.email
      assert_equal "Web & Software Development", result.conversation.service_interest
      assert_equal BigDecimal("50000"), result.conversation.budget

      lead = result.lead
      assert_equal "Rifat", lead.name
      assert_equal "rifat@example.com", lead.email
      assert_equal "AI Receptionist", lead.source
      assert_equal "Web & Software Development", lead.service_interest
      assert_includes lead.notes, "AI receptionist conversation"
      assert_includes model_client.messages.first[:content], "M&W Labs"
    end

    test "falls back gracefully when the local model is unavailable" do
      result = ConversationHandler.call(
        visitor_token: "visitor-token-2",
        message: "I need an AI automation quote. My WhatsApp is +8801700000000.",
        model_client: FailingModelClient.new
      )

      assert result.fallback?
      assert_equal "fallback", result.assistant_message.llm_model
      assert_match(/budget range/, result.reply)
      assert_nil result.conversation.name
      assert_equal "+8801700000000", result.conversation.phone
      assert_equal "AI & Automation", result.conversation.service_interest
    end

    test "fallback receptionist treats flexible / flex as urgency not a name" do
      conversation = ConversationHandler.call(
        visitor_token: "visitor-token-7",
        message: "Hi, my name is Sam. I need video, budget 67 and my email is sam@example.com.",
        model_client: FailingModelClient.new
      )

      assert_equal "Sam", conversation.conversation.name
      assert_equal "Video Editing & Content", conversation.conversation.service_interest
      assert_equal BigDecimal("67"), conversation.conversation.budget
      assert_nil conversation.conversation.urgency

      response = ConversationHandler.call(
        visitor_token: "visitor-token-7",
        message: "felx",
        model_client: FailingModelClient.new
      )

      assert_equal "Low", response.conversation.urgency
      assert_equal "Sam", response.conversation.name
      assert_match(/Perfect, Sam|Got it, Sam/i, response.reply)
      assert_no_match(/What is your name\?|share your name/i, response.reply)
    end

    test "starting a new request keeps contact info and asks only for missing details" do
      result = ConversationHandler.call(
        visitor_token: "visitor-token-9",
        message: "Hi, my name is Noor. My email is noor@example.com and I need marketing, budget 7890, urgent.",
        model_client: FailingModelClient.new
      )

      assert_equal "Noor", result.conversation.name
      assert_equal "noor@example.com", result.conversation.email
      assert_equal "Digital Marketing", result.conversation.service_interest
      assert_equal "Urgent", result.conversation.urgency

      next_result = ConversationHandler.call(
        visitor_token: "visitor-token-9",
        message: "start new",
        model_client: FailingModelClient.new
      )

      assert next_result.started_new?
      assert_equal "Noor", next_result.conversation.name
      assert_equal "noor@example.com", next_result.conversation.email
      assert_nil next_result.conversation.service_interest
      assert_nil next_result.conversation.budget
      assert_nil next_result.conversation.urgency
      assert_match(/service do you need help with/i, next_result.reply)
      assert_no_match(/best WhatsApp number or email/i, next_result.reply)
    end

    test "restart phrase in uppercase does not get captured as a visitor name" do
      result = ConversationHandler.call(
        visitor_token: "visitor-token-13",
        message: "START NEW",
        model_client: FailingModelClient.new
      )

      assert result.started_new?
      assert_nil result.conversation.name
      assert_match(/service do you need help with/i, result.reply)
    end

    test "same as before uses saved contact details" do
      initial = ConversationHandler.call(
        visitor_token: "visitor-token-12",
        message: "Hi, my name is Ray. My email is ray@example.com. I need website, budget 2000, urgent.",
        model_client: FailingModelClient.new
      )

      assert_equal "Ray", initial.conversation.name
      assert_equal "ray@example.com", initial.conversation.email

      result = ConversationHandler.call(
        visitor_token: "visitor-token-12",
        message: "same as before",
        model_client: FailingModelClient.new
      )

      assert_equal "Ray", result.conversation.name
      assert_equal "ray@example.com", result.conversation.email
      assert_match(/same contact details/i, result.reply)
      assert_no_match(/What is the best WhatsApp number or email/i, result.reply)
    end

    test "fallback receptionist handles local phone number and asks for country confirmation" do
      greeting = ConversationHandler.call(
        visitor_token: "visitor-token-3",
        message: "hi",
        model_client: FailingModelClient.new
      )
      assert_match(/I’m here|I'm here/, greeting.reply)

      contact = ConversationHandler.call(
        visitor_token: "visitor-token-3",
        message: "Mahadi 01944998080",
        model_client: FailingModelClient.new
      )
      assert_equal "Mahadi", contact.conversation.name
      assert_equal "01944998080", contact.conversation.phone
      assert_nil contact.conversation.country
      assert_match(/Which country should I use for that phone number\?/i, contact.reply)

      country = ConversationHandler.call(
        visitor_token: "visitor-token-3",
        message: "Bangladesh",
        model_client: FailingModelClient.new
      )
      assert_equal "Bangladesh", country.conversation.country
      assert_equal "+8801944998080", country.conversation.phone
      assert_match(/What service/i, country.reply)

      scope = ConversationHandler.call(
        visitor_token: "visitor-token-3",
        message: "Website 7000",
        model_client: FailingModelClient.new
      )
      assert_equal "Web & Software Development", scope.conversation.service_interest
      assert_equal BigDecimal("7000"), scope.conversation.budget
      assert_match(/urgent|this month|flexible/i, scope.reply)
      assert_no_match(/share your name/i, scope.reply)
      assert_no_match(/budget range/i, scope.reply)

      urgent = ConversationHandler.call(
        visitor_token: "visitor-token-3",
        message: "urgent",
        model_client: FailingModelClient.new
      )
      assert_equal "Urgent", urgent.conversation.urgency
      assert_match(/Perfect, Mahadi/i, urgent.reply)
      assert_match(/7000/, urgent.reply)

      greeting_again = ConversationHandler.call(
        visitor_token: "visitor-token-3",
        message: "hi",
        model_client: FailingModelClient.new
      )
      assert_match(/Welcome back, Mahadi/i, greeting_again.reply)
      assert_match(/\+8801944998080/, greeting_again.reply)

      add_more = ConversationHandler.call(
        visitor_token: "visitor-token-3",
        message: "yes",
        model_client: FailingModelClient.new
      )
      assert_match(/Send the extra detail/i, add_more.reply)
      assert_no_match(/Perfect, Mahadi/i, add_more.reply)
    end

    test "normalizes international phone numbers when country is provided" do
      result = ConversationHandler.call(
        visitor_token: "visitor-token-4",
        message: "Hi, my name is Sarah from United States. My phone is 415 555 2671. I need a website, budget 3000 USD, urgent.",
        model_client: FailingModelClient.new
      )

      assert result.fallback?
      assert_equal "Sarah", result.conversation.name
      assert_equal "United States", result.conversation.country
      assert_equal "+14155552671", result.conversation.phone
      assert_equal "Web & Software Development", result.conversation.service_interest
      assert_equal BigDecimal("3000"), result.conversation.budget
      assert_equal "Urgent", result.conversation.urgency
      assert_equal "United States", result.lead.country
      assert_equal "+14155552671", result.lead.phone
      assert_match(/country United States/i, result.reply)
      assert_no_match(/Which country/i, result.reply)
    end

    test "asks for country and then normalizes a previously captured local phone" do
      contact = ConversationHandler.call(
        visitor_token: "visitor-token-5",
        message: "Alex 415 555 2671",
        model_client: FailingModelClient.new
      )

      assert_equal "Alex", contact.conversation.name
      assert_equal "415 555 2671", contact.conversation.phone
      assert_nil contact.conversation.country
      assert_match(/Which country/i, contact.reply)

      country = ConversationHandler.call(
        visitor_token: "visitor-token-5",
        message: "United States",
        model_client: FailingModelClient.new
      )

      assert_equal "United States", country.conversation.country
      assert_equal "+14155552671", country.conversation.phone
      assert_equal "+14155552671", country.lead.phone
      assert_equal "United States", country.lead.country
      assert_no_match(/Which country/i, country.reply)
    end
  end
end

require "test_helper"

module Ai
  class TaskAssistantDailyOperationsTest < ActiveSupport::TestCase
    test "daily_operations_plan returns narrative content and parsed reminders" do
      payload = { narrative: "Focus on the client proposal today.", reminders: [ { title: "Call the client", note: "Confirm scope" } ] }.to_json
      fake = fake_client(payload)

      result = Ai::TaskAssistant.new(gemini_client: fake).daily_operations_plan

      assert_equal "Focus on the client proposal today.", result[:content]
      assert_equal "Call the client", result[:parsed]["reminders"].first["title"]
    end

    test "raises a clear error on invalid JSON" do
      fake = fake_client("not json")

      assert_raises(Ai::GeminiClient::Error) do
        Ai::TaskAssistant.new(gemini_client: fake).daily_operations_plan
      end
    end

    private

    def fake_client(content)
      client = Object.new
      client.define_singleton_method(:generate) do |**|
        { content: content, model: "gemini-2.5-flash", prompt_tokens: 1, output_tokens: 1, total_tokens: 2 }
      end
      client
    end
  end
end

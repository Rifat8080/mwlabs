require "test_helper"

module Ai
  class MarketingAssistantTest < ActiveSupport::TestCase
    test "content_ideas returns Gemini's generated ideas" do
      fake = fake_client("1. Idea one\n2. Idea two")

      result = Ai::MarketingAssistant.new(gemini_client: fake).content_ideas(
        service: "AI automation", audience: "Agencies", platform: "LinkedIn", goal: "leads"
      )
      assert_equal "1. Idea one\n2. Idea two", result[:content]
    end

    test "generate_post delegates to the content generator" do
      fake = fake_client("Draft post content")

      result = Ai::MarketingAssistant.new(gemini_client: fake).generate_post(platform: "LinkedIn", topic: "AI", instruction: "draft")
      assert_equal "Draft post content", result[:content]
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

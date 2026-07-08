require "test_helper"

module Ai
  class MarketingAssistantWeeklyPlanTest < ActiveSupport::TestCase
    test "weekly_content_plan returns narrative content and parsed items" do
      payload = {
        narrative: "Two gaps this week on LinkedIn and the blog.",
        items: [ { title: "AI automation case study", platform: "LinkedIn", publish_on: Date.current.to_s, notes: "Angle: cost savings" } ]
      }.to_json
      fake = fake_client(payload)

      result = Ai::MarketingAssistant.new(gemini_client: fake).weekly_content_plan

      assert_equal "Two gaps this week on LinkedIn and the blog.", result[:content]
      assert_equal "AI automation case study", result[:parsed]["items"].first["title"]
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

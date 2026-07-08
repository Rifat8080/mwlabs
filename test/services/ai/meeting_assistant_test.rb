require "test_helper"

module Ai
  class MeetingAssistantTest < ActiveSupport::TestCase
    test "summarize parses structured action items from Gemini's JSON response" do
      payload = {
        summary: "Discussed Q3 roadmap.",
        key_decisions: [ "Ship the AI dashboard by August" ],
        action_items: [ { task: "Draft the SEO agent prompt", assignee: "Mahadi", deadline: "2026-07-15" } ],
        follow_ups: [ "Confirm Gemini free-tier limits" ]
      }.to_json
      fake = fake_client(payload)

      result = Ai::MeetingAssistant.new(gemini_client: fake).summarize(notes: "raw notes")

      assert_equal "Discussed Q3 roadmap.", result[:parsed][:summary]
      assert_equal "Draft the SEO agent prompt", result[:parsed][:action_items].first["task"]
    end

    test "raises a clear error on invalid JSON" do
      fake = fake_client("not json")

      assert_raises(Ai::GeminiClient::Error) do
        Ai::MeetingAssistant.new(gemini_client: fake).summarize(notes: "raw notes")
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

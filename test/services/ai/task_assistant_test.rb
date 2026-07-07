require "test_helper"

module Ai
  class TaskAssistantTest < ActiveSupport::TestCase
    test "daily_plan builds a prompt from current tasks and returns Gemini's content" do
      AgencyTask.create!(title: "Overdue task", status: "Todo", priority: "High", due_date: Date.current - 2.days)
      fake = fake_client('{"content": "plan"}')

      result = Ai::TaskAssistant.new(gemini_client: fake).daily_plan
      assert_equal '{"content": "plan"}', result[:content]
    end

    test "create_from_description returns structured, symbolized data" do
      payload = { title: "Task", description: "desc", category: "Marketing", priority: "High", due_date: "2026-08-01", checklist: [ "a", "b" ] }.to_json
      fake = fake_client(payload)

      result = Ai::TaskAssistant.new(gemini_client: fake).create_from_description("do a thing")

      assert_equal "Task", result[:title]
      assert_equal [ "a", "b" ], result[:checklist]
    end

    test "create_from_description raises a clear error on invalid JSON" do
      fake = fake_client("not json")

      assert_raises(Ai::GeminiClient::Error) do
        Ai::TaskAssistant.new(gemini_client: fake).create_from_description("do a thing")
      end
    end

    test "improve returns suggested fields for an existing task" do
      task = AgencyTask.create!(title: "Fix bug", status: "Todo", priority: "Medium")
      payload = { description: "Clarified description", priority: "High", due_date: "2026-08-05", checklist: [ "Investigate", "Fix" ] }.to_json
      fake = fake_client(payload)

      result = Ai::TaskAssistant.new(gemini_client: fake).improve(task)
      assert_equal "Clarified description", result[:description]
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

require "test_helper"

module Ai
  class TaskBreakdownAgentTest < ActiveSupport::TestCase
    test "breakdown parses structured subtasks from Gemini's JSON response" do
      payload = {
        tasks: [
          { title: "Research competitors", priority: "High", estimated_duration: "3 hours", suggested_deadline: "2026-07-15", dependencies: [], checklist: [ "List 5 competitors", "Summarize pricing" ] }
        ]
      }.to_json
      fake = fake_client(payload)

      result = Ai::TaskBreakdownAgent.new(gemini_client: fake).breakdown(goal: "Launch a new AI automation service")

      assert_equal "Research competitors", result[:parsed][:tasks].first["title"]
    end

    test "create_tasks! persists AgencyTask records with checklist items" do
      subtasks = [ { title: "Write landing page copy", priority: "High", checklist: [ "Draft headline", "Draft CTA" ] } ]

      assert_difference "AgencyTask.count", 1 do
        assert_difference "ChecklistItem.count", 2 do
          Ai::TaskBreakdownAgent.new.create_tasks!(subtasks)
        end
      end

      task = AgencyTask.find_by(title: "Write landing page copy")
      assert_equal "High", task.priority
      assert_equal 2, task.checklist_items.count
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

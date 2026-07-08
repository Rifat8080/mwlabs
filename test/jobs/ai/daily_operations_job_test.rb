require "test_helper"

module Ai
  class DailyOperationsJobTest < ActiveSupport::TestCase
    test "runs the agent and notifies admins when no run exists today" do
      payload = { narrative: "Today's plan", reminders: [] }.to_json
      response = { content: payload, model: "gemini-2.5-flash", prompt_tokens: 1, output_tokens: 1, total_tokens: 2 }

      assert_difference "AiAgentRun.count", 1 do
        assert_difference "Notification.count" do
          stub_gemini_client(response) do
            Ai::DailyOperationsJob.perform_now
          end
        end
      end
    end

    test "skips running again if a run already happened today" do
      AiAgentRun.create!(agent_key: "daily_operations", status: "success", created_at: Time.current)

      assert_no_difference "AiAgentRun.count" do
        assert_no_difference "Notification.count" do
          Ai::DailyOperationsJob.perform_now
        end
      end
    end
  end
end

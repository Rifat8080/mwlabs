require "test_helper"

module Ai
  class MarketingSyncJobTest < ActiveSupport::TestCase
    test "runs the agent and notifies admins when no run exists this week" do
      payload = { narrative: "This week's plan", items: [] }.to_json
      response = { content: payload, model: "gemini-2.5-flash", prompt_tokens: 1, output_tokens: 1, total_tokens: 2 }

      assert_difference "AiAgentRun.count", 1 do
        assert_difference "Notification.count" do
          stub_gemini_client(response) do
            Ai::MarketingSyncJob.perform_now
          end
        end
      end
    end

    test "skips running again if a run already happened this week" do
      AiAgentRun.create!(agent_key: "marketing_manager", status: "success", created_at: Time.current)

      assert_no_difference "AiAgentRun.count" do
        assert_no_difference "Notification.count" do
          Ai::MarketingSyncJob.perform_now
        end
      end
    end
  end
end

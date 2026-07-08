require "test_helper"

class AiAgentRunTest < ActiveSupport::TestCase
  test "requires an agent_key and a valid status" do
    run = AiAgentRun.new(status: "not_a_status")
    assert_not run.valid?
    assert_includes run.errors[:agent_key], "can't be blank"
    assert_includes run.errors[:status], "is not included in the list"
  end

  test "for_agent and recent scopes" do
    older = AiAgentRun.create!(agent_key: "seo_assistant", status: "success", created_at: 2.days.ago)
    newer = AiAgentRun.create!(agent_key: "seo_assistant", status: "success", created_at: 1.hour.ago)
    AiAgentRun.create!(agent_key: "weekly_report", status: "success")

    assert_equal [ newer, older ], AiAgentRun.for_agent("seo_assistant").recent.to_a
  end
end

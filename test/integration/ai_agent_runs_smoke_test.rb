require "test_helper"

class AiAgentRunsSmokeTest < ActionDispatch::IntegrationTest
  setup do
    sign_in users(:admin)
  end

  test "admin can browse agent run history across all agents" do
    AiAgentRun.create!(agent_key: "weekly_report", status: "success", output: "Summary")
    AiAgentRun.create!(agent_key: "seo_assistant", status: "error", error_message: "quota exceeded")

    get admin_ai_agent_runs_path
    assert_response :success
    assert_select "a", text: "New Agent run history", count: 0
  end

  test "team_member and client are denied access" do
    [ users(:team_member), users(:client) ].each do |user|
      sign_in user
      get admin_ai_agent_runs_path
      assert_redirected_to dashboard_root_path
      sign_out user
    end
  end
end

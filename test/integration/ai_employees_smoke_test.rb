require "test_helper"

class AiEmployeesSmokeTest < ActionDispatch::IntegrationTest
  setup do
    sign_in users(:admin)
  end

  test "admin can view the AI Employees dashboard" do
    get admin_ai_employees_path
    assert_response :success
    assert_select "h1", text: /Your AI Workforce/
  end

  test "admin can view an individual agent page" do
    get admin_ai_employee_path("weekly_report")
    assert_response :success
    assert_select "h1", text: /Weekly Report Agent/
  end

  test "unknown agent key redirects back to the dashboard" do
    get admin_ai_employee_path("not_a_real_agent")
    assert_redirected_to admin_ai_employees_path
  end

  test "admin can run an agent and gets a persisted AiAgentRun" do
    payload = { narrative: "Today's top priority is X.", reminders: [ { title: "Call the client" } ] }.to_json
    response = { content: payload, model: "gemini-2.5-flash", prompt_tokens: 10, output_tokens: 5, total_tokens: 15 }

    assert_difference "AiAgentRun.count", 1 do
      stub_gemini_client(response) do
        post admin_run_ai_employee_path("daily_operations"), params: {}, as: :json
      end
    end

    assert_response :success
    body = JSON.parse(@response.body)
    assert_equal "Today's top priority is X.", body["content"]
  end

  test "admin can apply a completed run's output to the workspace" do
    run = AiAgentRun.create!(agent_key: "task_breakdown", status: "success", output: "plan", parsed: { "tasks" => [ { "title" => "Draft landing page copy", "priority" => "High" } ] })

    assert_difference "AgencyTask.count", 1 do
      post admin_apply_ai_employee_path("task_breakdown"), params: { run_id: run.id }
    end

    assert_redirected_to admin_ai_employee_path("task_breakdown")
  end

  test "Gemini errors during a run are returned as a friendly JSON error, not a 500" do
    stub_gemini_client(Ai::GeminiClient::Error.new("quota exceeded")) do
      post admin_run_ai_employee_path("daily_operations"), params: {}, as: :json
    end
    assert_response :service_unavailable
    assert_match(/quota exceeded/, JSON.parse(@response.body)["error"])
  end

  test "team_member and client are denied access to AI Employees" do
    [ users(:team_member), users(:client) ].each do |user|
      sign_in user
      get admin_ai_employees_path
      assert_redirected_to dashboard_root_path
      sign_out user
    end
  end
end

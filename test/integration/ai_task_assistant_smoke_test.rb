require "test_helper"

class AiTaskAssistantSmokeTest < ActionDispatch::IntegrationTest
  setup do
    sign_in users(:admin)
  end

  test "admin can create a task from a natural-language description via AI" do
    response = gemini_response({
      title: "LinkedIn Campaign", description: "Launch a campaign", category: "Marketing",
      priority: "High", due_date: "2026-07-15", checklist: [ "Draft copy", "Design creative" ]
    }.to_json)

    assert_difference "AgencyTask.count", 1 do
      stub_gemini_client(response) do
        post ai_create_admin_agency_tasks_path, params: { description: "Create a LinkedIn campaign for AI automation" }
      end
    end

    task = AgencyTask.find_by(title: "LinkedIn Campaign")
    assert task.present?
    assert_equal 2, task.checklist_items.count
    assert_response :redirect
  end

  test "admin sees a friendly error when the description is blank" do
    post ai_create_admin_agency_tasks_path, params: { description: "" }
    assert_redirected_to new_admin_agency_task_path
  end

  test "admin can request AI improvements for an existing task" do
    task = AgencyTask.create!(title: "Fix homepage", status: "Todo", priority: "Medium")
    response = gemini_response({
      description: "Rewrite the homepage copy for clarity", priority: "High",
      due_date: "2026-07-20", checklist: [ "Audit current copy", "Draft new copy" ]
    }.to_json)

    stub_gemini_client(response) do
      post ai_improve_admin_agency_task_path(task), headers: { "Accept" => "text/vnd.turbo-stream.html" }
    end
    assert_response :success
  end

  test "AI errors are handled gracefully, not raised as 500s" do
    stub_gemini_client(Ai::GeminiClient::Error.new("quota exceeded")) do
      post ai_create_admin_agency_tasks_path, params: { description: "Anything" }
    end
    assert_redirected_to new_admin_agency_task_path
    assert_match(/quota exceeded/, flash[:alert])
  end

  test "team_member and client are denied access to ai_create" do
    [ users(:team_member), users(:client) ].each do |user|
      sign_in user
      post ai_create_admin_agency_tasks_path, params: { description: "test" }
      assert_redirected_to dashboard_root_path
      sign_out user
    end
  end

  private

  def gemini_response(content)
    { content: content, model: "gemini-2.5-flash", prompt_tokens: 10, output_tokens: 5, total_tokens: 15 }
  end
end

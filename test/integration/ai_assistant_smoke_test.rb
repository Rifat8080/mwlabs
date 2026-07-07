require "test_helper"

class AiAssistantSmokeTest < ActionDispatch::IntegrationTest
  setup do
    sign_in users(:admin)
  end

  test "admin can view the AI assistant chat page" do
    get admin_ai_assistant_path
    assert_response :success
    assert_select "h1", text: /Your Agency Operations Assistant/
  end

  test "admin can send a chat message and gets a persisted assistant reply" do
    response = gemini_response("Here's your plan for today.")

    assert_difference "AiAssistantMessage.count", 2 do
      stub_gemini_client(response) do
        post admin_ai_assistant_messages_path, params: { message: "What should I focus on today?" }, as: :json
      end
    end

    assert_response :success
    body = JSON.parse(@response.body)
    assert_equal "Here's your plan for today.", body["reply"]
  end

  test "blank chat message is rejected" do
    post admin_ai_assistant_messages_path, params: { message: "" }, as: :json
    assert_response :unprocessable_entity
  end

  test "admin can trigger a quick action" do
    response = gemini_response("Top priority: ship the client proposal.")

    assert_difference "AiAssistantMessage.count", 2 do
      stub_gemini_client(response) do
        post admin_ai_assistant_quick_action_path, params: { action_name: "plan_my_day" }, as: :json
      end
    end
    assert_response :success
  end

  test "AI errors during chat are returned as a friendly JSON error, not a 500" do
    stub_gemini_client(Ai::GeminiClient::Error.new("quota exceeded")) do
      post admin_ai_assistant_messages_path, params: { message: "hello" }, as: :json
    end
    assert_response :service_unavailable
    assert_match(/quota exceeded/, JSON.parse(@response.body)["error"])
  end

  test "team_member and client are denied access to the AI assistant" do
    [ users(:team_member), users(:client) ].each do |user|
      sign_in user
      get admin_ai_assistant_path
      assert_redirected_to dashboard_root_path
      sign_out user
    end
  end

  test "admin can manage AI prompts and AI knowledge entries" do
    get admin_ai_prompts_path
    assert_response :success

    get admin_ai_knowledge_entries_path
    assert_response :success

    assert_difference "AiPrompt.count", 1 do
      post admin_ai_prompts_path, params: { ai_prompt: { name: "Smoke Prompt", category: "general", prompt_text: "Be helpful.", active: true } }
    end
  end

  test "AI usage logs are read-only even for admins" do
    log = AiUsageLog.create!(feature: "daily_planner", status: "success")

    get admin_ai_usage_logs_path
    assert_response :success
    assert_select "a", text: "New Ai usage log", count: 0

    get admin_ai_usage_log_path(log)
    assert_response :success
    assert_select "a", text: "Edit", count: 0
  end

  private

  def gemini_response(content)
    { content: content, model: "gemini-2.5-flash", prompt_tokens: 10, output_tokens: 5, total_tokens: 15 }
  end
end

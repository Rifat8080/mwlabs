require "test_helper"

class AiMarketingAssistantSmokeTest < ActionDispatch::IntegrationTest
  setup do
    sign_in users(:admin)
  end

  test "admin can generate content ideas" do
    response = gemini_response("1. Post about AI automation ROI\n2. Case study carousel")

    stub_gemini_client(response) do
      post ai_generate_admin_marketing_items_path, params: {
        service: "AI automation", audience: "Agency owners", platform: "LinkedIn", goal: "leads"
      }
    end
    assert_response :redirect
  end

  test "admin sees a friendly error when required fields are missing" do
    post ai_generate_admin_marketing_items_path, params: { service: "" }
    assert_redirected_to admin_marketing_items_path
  end

  test "admin can draft and rewrite content for an existing marketing item" do
    item = MarketingItem.create!(title: "AI Automation Post", platform: "LinkedIn", status: "Idea", topic: "AI automation")
    response = gemini_response("Draft LinkedIn post about AI automation.")

    stub_gemini_client(response) do
      post ai_rewrite_admin_marketing_item_path(item), headers: { "Accept" => "text/vnd.turbo-stream.html" }
    end
    assert_response :success

    stub_gemini_client(response) do
      post ai_rewrite_admin_marketing_item_path(item, instruction: "shorten"), headers: { "Accept" => "text/vnd.turbo-stream.html" }
    end
    assert_response :success
  end

  test "AI errors on rewrite are handled gracefully" do
    item = MarketingItem.create!(title: "AI Automation Post", platform: "LinkedIn", status: "Idea")

    stub_gemini_client(Ai::GeminiClient::Error.new("quota exceeded")) do
      post ai_rewrite_admin_marketing_item_path(item), headers: { "Accept" => "text/vnd.turbo-stream.html" }
    end
    assert_response :success
  end

  test "team_member and client are denied access to ai_generate" do
    [ users(:team_member), users(:client) ].each do |user|
      sign_in user
      post ai_generate_admin_marketing_items_path, params: { service: "x", audience: "y", platform: "LinkedIn", goal: "z" }
      assert_redirected_to dashboard_root_path
      sign_out user
    end
  end

  private

  def gemini_response(content)
    { content: content, model: "gemini-2.5-flash", prompt_tokens: 10, output_tokens: 5, total_tokens: 15 }
  end
end

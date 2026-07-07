require "test_helper"

class AgencySearchSmokeTest < ActionDispatch::IntegrationTest
  test "admin can search across tasks and marketing items" do
    sign_in users(:admin)
    AgencyTask.create!(title: "Unique Findable Task", status: "Todo", priority: "Medium")
    MarketingItem.create!(title: "Unique Findable Post", platform: "LinkedIn", status: "Idea")

    get admin_agency_search_path(q: "Unique Findable")
    assert_response :success
    assert_select "body", text: /Unique Findable Task/
    assert_select "body", text: /Unique Findable Post/
  end

  test "team_member and client are denied access" do
    [ users(:team_member), users(:client) ].each do |user|
      sign_in user
      get admin_agency_search_path
      assert_redirected_to dashboard_root_path
      sign_out user
    end
  end
end

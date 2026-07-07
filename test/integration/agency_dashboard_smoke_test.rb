require "test_helper"

class AgencyDashboardSmokeTest < ActionDispatch::IntegrationTest
  test "admin sees the agency dashboard with tasks and marketing widgets" do
    sign_in users(:admin)
    AgencyTask.create!(title: "Dashboard Task", status: "Todo", priority: "Medium", due_date: Date.current)
    MarketingItem.create!(title: "Dashboard Post", platform: "LinkedIn", status: "Scheduled", publish_on: Date.current)

    get admin_agency_dashboard_path
    assert_response :success
    assert_select "h1", text: /Agency Operations Dashboard/
  end

  test "team_member and client are denied access" do
    [ users(:team_member), users(:client) ].each do |user|
      sign_in user
      get admin_agency_dashboard_path
      assert_redirected_to dashboard_root_path
      sign_out user
    end
  end
end

require "test_helper"

class AgencyTaskCategoriesSmokeTest < ActionDispatch::IntegrationTest
  test "admin can manage task categories" do
    sign_in users(:admin)

    get admin_agency_task_categories_path
    assert_response :success

    assert_difference "AgencyTaskCategory.count", 1 do
      post admin_agency_task_categories_path, params: { agency_task_category: { name: "Smoke Category", color: "blue", position: 1 } }
    end
    assert_response :redirect

    category = AgencyTaskCategory.find_by(name: "Smoke Category")
    get admin_agency_task_category_path(category)
    assert_response :success
  end

  test "team_member and client are denied access" do
    [ users(:team_member), users(:client) ].each do |user|
      sign_in user
      get admin_agency_task_categories_path
      assert_redirected_to dashboard_root_path
      sign_out user
    end
  end
end

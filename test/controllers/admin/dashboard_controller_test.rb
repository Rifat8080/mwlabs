require "test_helper"

module Admin
  class DashboardControllerTest < ActionDispatch::IntegrationTest
    test "redirects guests to sign in" do
      get dashboard_root_url

      assert_redirected_to new_user_session_url
    end

    test "shows dashboard to signed in users" do
      sign_in users(:admin)

      get dashboard_root_url

      assert_response :success
      assert_select "h1", "Agency Operations Dashboard"
    end
  end
end

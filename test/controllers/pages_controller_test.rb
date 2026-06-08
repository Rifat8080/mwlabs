require "test_helper"

class PagesControllerTest < ActionDispatch::IntegrationTest
  test "shows the public landing page" do
    get root_url

    assert_response :success
    assert_select "h1", text: /Build, manage, and grow/
  end
end

require "test_helper"

class MarketingItemsSmokeTest < ActionDispatch::IntegrationTest
  setup do
    sign_in users(:admin)
  end

  test "admin can view table and calendar, and create an item" do
    get admin_marketing_items_path
    assert_response :success

    get calendar_admin_marketing_items_path
    assert_response :success

    assert_difference "MarketingItem.count", 1 do
      post admin_marketing_items_path, params: {
        marketing_item: { title: "Smoke Post", platform: "LinkedIn", status: "Idea", publish_on: Date.current }
      }
    end
    assert_response :redirect
  end

  test "admin can reschedule an item via the drag-drop move endpoint" do
    item = MarketingItem.create!(title: "Reschedule Me", platform: "Instagram", status: "Scheduled", publish_on: Date.current)
    new_date = Date.current + 3.days

    patch move_admin_marketing_item_path(item), params: { publish_on: new_date.iso8601 }, headers: { "Accept" => "text/vnd.turbo-stream.html" }
    assert_response :success
    assert_equal new_date, item.reload.publish_on
  end

  test "team_member and client are denied access" do
    [ users(:team_member), users(:client) ].each do |user|
      sign_in user
      get admin_marketing_items_path
      assert_redirected_to dashboard_root_path
      sign_out user
    end
  end
end

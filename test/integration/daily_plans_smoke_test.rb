require "test_helper"

class DailyPlansSmokeTest < ActionDispatch::IntegrationTest
  setup do
    sign_in users(:admin)
  end

  test "admin can view and update today's daily plan" do
    get admin_daily_plan_path
    assert_response :success

    patch admin_daily_plan_path, params: { daily_plan: { focus: "Ship the module", wins: "Shipped it" } }
    assert_redirected_to admin_daily_plan_path(date: Date.current)

    plan = DailyPlan.for_date(Date.current)
    assert_equal "Ship the module", plan.focus
  end

  test "admin can navigate to a past date and it auto-creates a plan" do
    get admin_daily_plan_path(date: (Date.current - 5.days).iso8601)
    assert_response :success
    assert DailyPlan.exists?(date: Date.current - 5.days)
  end

  test "admin can add and toggle morning/evening checklist items" do
    get admin_daily_plan_path
    plan = DailyPlan.for_date(Date.current)

    assert_difference "ChecklistItem.count", 1 do
      post admin_checklist_items_path, params: {
        checklist_item: { checklistable_type: "DailyPlan", checklistable_id: plan.id, list_type: "morning", title: "Review inbox" }
      }
    end

    item = plan.checklist_items.last
    assert_equal "morning", item.list_type

    patch admin_checklist_item_path(item), params: { checklist_item: { done: true } }
    assert item.reload.done?
  end

  test "team_member and client are denied access" do
    [ users(:team_member), users(:client) ].each do |user|
      sign_in user
      get admin_daily_plan_path
      assert_redirected_to dashboard_root_path
      sign_out user
    end
  end
end

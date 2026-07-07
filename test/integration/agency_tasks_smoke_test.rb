require "test_helper"

class AgencyTasksSmokeTest < ActionDispatch::IntegrationTest
  setup do
    sign_in users(:admin)
    @category = AgencyTaskCategory.create!(name: "Smoke Category", color: "blue", position: 1)
  end

  test "admin can view kanban, table, and list views" do
    get admin_agency_tasks_path
    assert_response :success

    get admin_agency_tasks_path(view: "table")
    assert_response :success

    get admin_agency_tasks_path(view: "list")
    assert_response :success
  end

  test "admin can create a task with checklist items" do
    assert_difference [ "AgencyTask.count", "ChecklistItem.count" ], 1 do
      post admin_agency_tasks_path, params: {
        agency_task: {
          title: "Smoke Task",
          agency_task_category_id: @category.id,
          status: "Todo",
          priority: "High",
          due_date: Date.current,
          checklist_items_attributes: { "0" => { title: "Step one" } }
        }
      }
    end
    assert_response :redirect

    task = AgencyTask.find_by(title: "Smoke Task")
    assert_equal 1, task.checklist_items.count

    get admin_agency_task_path(task)
    assert_response :success
  end

  test "admin can toggle and remove a checklist item from the task detail page" do
    task = AgencyTask.create!(title: "Checklist Task", status: "Todo", priority: "Medium")
    item = task.checklist_items.create!(title: "Draft copy")

    patch admin_checklist_item_path(item), params: { checklist_item: { done: true } }
    assert item.reload.done?

    assert_difference "ChecklistItem.count", -1 do
      delete admin_checklist_item_path(item)
    end
  end

  test "admin can move a task between statuses via the drag-drop endpoint" do
    task = AgencyTask.create!(title: "Move Task", status: "Todo", priority: "Medium")

    patch move_admin_agency_task_path(task), params: { status: "InProgress" }, as: :json, headers: { "Accept" => "text/vnd.turbo-stream.html" }
    assert_response :success
    assert_equal "InProgress", task.reload.status
  end

  test "admin can bulk update and bulk destroy tasks" do
    task_one = AgencyTask.create!(title: "Bulk One", status: "Todo", priority: "Medium")
    task_two = AgencyTask.create!(title: "Bulk Two", status: "Todo", priority: "Medium")

    patch bulk_update_admin_agency_tasks_path, params: { bulk_action: "status", status: "InProgress", agency_task_ids: [ task_one.id, task_two.id ] }
    assert_equal "InProgress", task_one.reload.status
    assert_equal "InProgress", task_two.reload.status

    assert_difference "AgencyTask.count", -2 do
      delete bulk_destroy_admin_agency_tasks_path, params: { agency_task_ids: [ task_one.id, task_two.id ] }
    end
  end

  test "completing a recurring task spawns the next occurrence" do
    task = AgencyTask.create!(title: "Recurring Task", status: "Todo", priority: "Medium", due_date: Date.current, recurrence_rule: "daily")

    assert_difference "AgencyTask.count", 1 do
      patch admin_agency_task_path(task), params: { agency_task: { status: "Completed" } }
    end
  end

  test "team_member and client are denied access" do
    [ users(:team_member), users(:client) ].each do |user|
      sign_in user
      get admin_agency_tasks_path
      assert_redirected_to dashboard_root_path
      sign_out user
    end
  end
end

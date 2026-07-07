require "test_helper"

class ChecklistItemTest < ActiveSupport::TestCase
  test "requires a title" do
    task = AgencyTask.create!(title: "Task", status: "Todo", priority: "Medium")
    item = ChecklistItem.new(checklistable: task)

    assert_not item.valid?
    assert_includes item.errors[:title], "can't be blank"
  end

  test "belongs to any checklistable polymorphic parent" do
    task = AgencyTask.create!(title: "Task", status: "Todo", priority: "Medium")
    plan = DailyPlan.create!(date: Date.new(2026, 6, 1))

    task_item = task.checklist_items.create!(title: "Task item")
    plan_item = plan.checklist_items.create!(title: "Plan item", list_type: "morning")

    assert_equal task, task_item.checklistable
    assert_equal plan, plan_item.checklistable
  end
end

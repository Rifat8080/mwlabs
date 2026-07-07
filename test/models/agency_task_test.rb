require "test_helper"

class AgencyTaskTest < ActiveSupport::TestCase
  test "requires a title, status, and priority" do
    task = AgencyTask.new
    assert_not task.valid?
    assert_includes task.errors[:title], "can't be blank"
  end

  test "overdue scope only includes past-due, non-closed tasks" do
    overdue = AgencyTask.create!(title: "Overdue", status: "Todo", priority: "Medium", due_date: Date.current - 2.days)
    AgencyTask.create!(title: "Completed Overdue", status: "Completed", priority: "Medium", due_date: Date.current - 2.days)
    AgencyTask.create!(title: "Future", status: "Todo", priority: "Medium", due_date: Date.current + 2.days)

    assert_includes AgencyTask.overdue, overdue
    assert_equal 1, AgencyTask.overdue.count
  end

  test "due_today and due_this_week scopes" do
    today = AgencyTask.create!(title: "Today", status: "Todo", priority: "Medium", due_date: Date.current)
    this_week = AgencyTask.create!(title: "This Week", status: "Todo", priority: "Medium", due_date: Date.current.end_of_week)

    assert_includes AgencyTask.due_today, today
    assert_includes AgencyTask.due_this_week, this_week
  end

  test "tag_list splits comma separated tags" do
    task = AgencyTask.new(tags: "urgent, client-x")
    assert_equal [ "urgent", "client-x" ], task.tag_list
  end

  test "completing a recurring task spawns the next occurrence with the same series root" do
    task = AgencyTask.create!(title: "Weekly Post", status: "Todo", priority: "Medium", due_date: Date.new(2026, 7, 6), recurrence_rule: "weekly", recurrence_weekdays: "mon")

    assert_difference "AgencyTask.count", 1 do
      task.update!(status: "Completed")
    end

    child = task.recurring_occurrences.first
    assert_equal Date.new(2026, 7, 13), child.due_date
    assert_equal "Todo", child.status
    assert_equal task, child.parent_recurring_task
  end

  test "completing a non-recurring task does not spawn an occurrence" do
    task = AgencyTask.create!(title: "One-off", status: "Todo", priority: "Medium")

    assert_no_difference "AgencyTask.count" do
      task.update!(status: "Completed")
    end
  end

  test "sets completed_at when status becomes Completed and clears it otherwise" do
    task = AgencyTask.create!(title: "Track completion", status: "Todo", priority: "Medium")
    task.update!(status: "Completed")
    assert task.completed_at.present?

    task.update!(status: "Todo")
    assert_nil task.completed_at
  end
end

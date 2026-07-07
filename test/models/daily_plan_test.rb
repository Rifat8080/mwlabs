require "test_helper"

class DailyPlanTest < ActiveSupport::TestCase
  test "for_date finds or initializes a plan for the given date" do
    date = Date.new(2026, 5, 1)
    plan = DailyPlan.for_date(date)
    assert_not plan.persisted?
    plan.save!

    assert_equal plan, DailyPlan.for_date(date)
  end

  test "morning and evening checklist items are separated by list_type" do
    plan = DailyPlan.create!(date: Date.new(2026, 5, 2))
    plan.checklist_items.create!(title: "Check email", list_type: "morning")
    plan.checklist_items.create!(title: "Plan tomorrow", list_type: "evening")

    assert_equal [ "Check email" ], plan.morning_checklist_items.map(&:title)
    assert_equal [ "Plan tomorrow" ], plan.evening_checklist_items.map(&:title)
  end

  test "requires a unique date" do
    DailyPlan.create!(date: Date.new(2026, 5, 3))
    duplicate = DailyPlan.new(date: Date.new(2026, 5, 3))

    assert_not duplicate.valid?
    assert_includes duplicate.errors[:date], "has already been taken"
  end
end

require "test_helper"

class AgencyTaskCategoryTest < ActiveSupport::TestCase
  test "requires a unique name" do
    AgencyTaskCategory.create!(name: "Unique Category")
    duplicate = AgencyTaskCategory.new(name: "Unique Category")

    assert_not duplicate.valid?
    assert_includes duplicate.errors[:name], "has already been taken"
  end

  test "nullifies agency tasks when destroyed" do
    category = AgencyTaskCategory.create!(name: "Deletable Category")
    task = AgencyTask.create!(title: "Task", status: "Todo", priority: "Medium", agency_task_category: category)

    category.destroy

    assert_nil task.reload.agency_task_category_id
  end
end

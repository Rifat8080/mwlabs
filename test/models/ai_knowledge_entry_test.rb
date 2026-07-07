require "test_helper"

class AiKnowledgeEntryTest < ActiveSupport::TestCase
  test "requires a unique key" do
    AiKnowledgeEntry.create!(key: "unique_key", value: "value")
    duplicate = AiKnowledgeEntry.new(key: "unique_key", value: "other")

    assert_not duplicate.valid?
    assert_includes duplicate.errors[:key], "has already been taken"
  end

  test "active scope excludes inactive entries" do
    active = AiKnowledgeEntry.create!(key: "active_key", value: "value", active: true)
    AiKnowledgeEntry.create!(key: "inactive_key", value: "value", active: false)

    assert_includes AiKnowledgeEntry.active, active
    assert_equal 1, AiKnowledgeEntry.active.where(key: [ "active_key", "inactive_key" ]).count
  end
end

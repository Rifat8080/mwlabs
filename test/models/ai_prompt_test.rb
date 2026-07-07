require "test_helper"

class AiPromptTest < ActiveSupport::TestCase
  test "requires a unique name and a valid category" do
    AiPrompt.create!(name: "Unique Prompt", category: "general", prompt_text: "Be helpful.")
    duplicate = AiPrompt.new(name: "Unique Prompt", category: "general", prompt_text: "Be helpful.")

    assert_not duplicate.valid?
    assert_includes duplicate.errors[:name], "has already been taken"

    invalid_category = AiPrompt.new(name: "Other Prompt", category: "not_a_category", prompt_text: "Be helpful.")
    assert_not invalid_category.valid?
    assert_includes invalid_category.errors[:category], "is not included in the list"
  end

  test "active and for_category scopes" do
    active = AiPrompt.create!(name: "Active Prompt", category: "marketing_ideas", prompt_text: "Plan.", active: true)
    inactive = AiPrompt.create!(name: "Inactive Prompt", category: "marketing_ideas", prompt_text: "Plan.", active: false)

    assert_includes AiPrompt.active.for_category("marketing_ideas"), active
    assert_not_includes AiPrompt.active.for_category("marketing_ideas"), inactive
  end
end

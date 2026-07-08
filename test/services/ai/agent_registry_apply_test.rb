require "test_helper"

module Ai
  class AgentRegistryApplyTest < ActiveSupport::TestCase
    test "daily_operations apply creates reminders and skips duplicates on a second call" do
      agent = Ai::AgentRegistry.find("daily_operations")
      parsed = { "reminders" => [ { "title" => "Call the client", "note" => "Confirm scope" } ] }

      assert_difference "Reminder.count", 1 do
        agent[:apply].call(parsed: parsed, user: users(:admin))
      end

      assert_no_difference "Reminder.count" do
        agent[:apply].call(parsed: parsed, user: users(:admin))
      end
    end

    test "marketing_manager apply creates marketing items and skips duplicates on a second call" do
      agent = Ai::AgentRegistry.find("marketing_manager")
      parsed = { "items" => [ { "title" => "AI automation case study", "platform" => "LinkedIn", "publish_on" => Date.current.to_s, "notes" => "cost savings angle" } ] }

      assert_difference "MarketingItem.count", 1 do
        agent[:apply].call(parsed: parsed, user: users(:admin))
      end

      assert_no_difference "MarketingItem.count" do
        agent[:apply].call(parsed: parsed, user: users(:admin))
      end
    end

    test "task_breakdown apply creates agency tasks and skips duplicates on a second call" do
      agent = Ai::AgentRegistry.find("task_breakdown")
      parsed = { "tasks" => [ { "title" => "Research competitors", "priority" => "High", "checklist" => [ "List 5 competitors" ] } ] }

      assert_difference "AgencyTask.count", 1 do
        agent[:apply].call(parsed: parsed, user: users(:admin))
      end

      assert_no_difference "AgencyTask.count" do
        agent[:apply].call(parsed: parsed, user: users(:admin))
      end
    end
  end
end

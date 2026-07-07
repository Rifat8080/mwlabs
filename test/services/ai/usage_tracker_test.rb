require "test_helper"

module Ai
  class UsageTrackerTest < ActiveSupport::TestCase
    test "logs a success entry and returns the result" do
      result = Ai::UsageTracker.track(feature: "daily_planner", model: "gemini-2.5-flash") do
        { content: "ok", model: "gemini-2.5-flash", prompt_tokens: 10, output_tokens: 5, total_tokens: 15 }
      end

      assert_equal "ok", result[:content]
      log = AiUsageLog.where(feature: "daily_planner").order(:created_at).last
      assert_equal "success", log.status
      assert_equal 15, log.tokens_used
    end

    test "logs an error entry and re-raises" do
      assert_raises(RuntimeError) do
        Ai::UsageTracker.track(feature: "task_creation") { raise "boom" }
      end

      log = AiUsageLog.where(feature: "task_creation").order(:created_at).last
      assert_equal "error", log.status
      assert_equal "boom", log.error_message
    end

    test "rate_limited? is true once the per-minute cap is reached" do
      original = ENV["GEMINI_MAX_RPM"]
      ENV["GEMINI_MAX_RPM"] = "1"

      AiUsageLog.create!(feature: "daily_planner", status: "success")
      assert Ai::UsageTracker.rate_limited?

      assert_raises(Ai::UsageTracker::RateLimitError) do
        Ai::UsageTracker.track(feature: "daily_planner") { { content: "x" } }
      end
    ensure
      ENV["GEMINI_MAX_RPM"] = original
    end
  end
end

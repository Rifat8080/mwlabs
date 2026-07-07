require "test_helper"

class AiUsageLogTest < ActiveSupport::TestCase
  test "requires a feature and a valid status" do
    log = AiUsageLog.new(status: "not_a_status")
    assert_not log.valid?
    assert_includes log.errors[:feature], "can't be blank"
    assert_includes log.errors[:status], "is not included in the list"
  end

  test "for_feature and within scopes" do
    old = AiUsageLog.create!(feature: "weekly_report", status: "success", created_at: 2.days.ago)
    recent = AiUsageLog.create!(feature: "weekly_report", status: "success", created_at: 1.hour.ago)
    AiUsageLog.create!(feature: "productivity_analysis", status: "success")

    assert_includes AiUsageLog.for_feature("weekly_report"), old
    assert_includes AiUsageLog.for_feature("weekly_report"), recent
    assert_includes AiUsageLog.within(6.hours.ago..), recent
    assert_not_includes AiUsageLog.within(6.hours.ago..), old
  end
end

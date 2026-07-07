require "test_helper"

class MarketingItemTest < ActiveSupport::TestCase
  test "requires a title and valid status" do
    item = MarketingItem.new(status: "Not A Status")
    assert_not item.valid?
    assert_includes item.errors[:title], "can't be blank"
    assert_includes item.errors[:status], "is not included in the list"
  end

  test "keyword_list and hashtag_list split comma separated values" do
    item = MarketingItem.new(keywords: "rails, saas", hashtags: "#build, #ship")
    assert_equal [ "rails", "saas" ], item.keyword_list
    assert_equal [ "#build", "#ship" ], item.hashtag_list
  end

  test "scheduled and published_items scopes" do
    scheduled = MarketingItem.create!(title: "Scheduled Post", status: "Scheduled")
    published = MarketingItem.create!(title: "Published Post", status: "Published")

    assert_includes MarketingItem.scheduled, scheduled
    assert_includes MarketingItem.published_items, published
  end
end

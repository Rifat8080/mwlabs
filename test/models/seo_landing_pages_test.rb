require "test_helper"

class SeoLandingPagesTest < ActiveSupport::TestCase
  test "defines one hundred keyword landing pages" do
    assert_equal 100, SeoLandingPages::KEYWORDS.size
    assert_equal 100, SeoLandingPages.all.size
  end

  test "finds pages by slug" do
    page = SeoLandingPages.find("mvp-development-agency")

    assert_equal "MVP development agency", page[:keyword]
    assert_equal "MVP Development Agency", page[:heading]
    assert_equal "mvp-development-agency", page[:slug]
    assert_equal "MVP Development Agency | M&W Labs", page[:title]
    assert_includes page[:description], "MVP development agency"
    assert_includes page[:hero_intro], "MVP development agency"
    assert_includes page[:why_heading], "MVP Development Agency"
    assert_equal "SEO Landing: MVP development agency", page[:lead_source]
  end

  test "returns nil for unknown slug" do
    assert_nil SeoLandingPages.find("does-not-exist")
  end

  test "slugifies keywords consistently" do
    assert_equal "software-development-agency-for-usa-and-europe", SeoLandingPages.slug_for("software development agency for USA and Europe")
  end
end

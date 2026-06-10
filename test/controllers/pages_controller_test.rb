require "test_helper"

class PagesControllerTest < ActionDispatch::IntegrationTest
  test "shows the public landing page" do
    get root_url

    assert_response :success
    assert_select "h1", text: /Build\. Market\. Automate\. Grow\./
    assert_select "img[alt='M&W Labs digital services']"
    assert_select "img[alt='Shopify']"
    assert_select "img[alt='Tech To The Rescue']"
    assert_select "h2", text: /Everything Your Business Needs/
    assert_select "h2", text: /Some Recent Projects/
    assert_select "h2", text: /How We Work/
    assert_select "h2", text: /Real People\. Real Results\./
    assert_select "[data-testimonials-section]"
    assert_select "[data-testimonials-dot]", count: 3
    assert_select "[data-project-filter='Marketing']"
    assert_select "[data-project-card]", minimum: 6
    assert_select "h2", text: /We Don’t Just Deliver Services/
    assert_select "footer", text: /From code to campaigns/
    assert_select "footer", text: /Back to top/
    assert_select ".fa-code"
  end
end

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
    assert_select ".fa-code"
  end
end

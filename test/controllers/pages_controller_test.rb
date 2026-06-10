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
    assert_select "a[href='#{about_path}']"
    assert_select "a[href='#{contact_path}']"
  end

  test "shows visitor pages" do
    pages = {
      about_url => /We Build Digital Growth Systems/,
      work_url => /Projects That Drive Real Results/,
      pricing_url => /Flexible Plans for Every Stage/,
      blog_url => /Insights on Digital Growth/,
      contact_url => /Let's Start Your Next Project/,
      team_url => /Meet the People Behind M&W Labs/,
      careers_url => /Join Our Growing Team/,
      testimonials_url => /Real People\. Real Results\./,
      case_studies_url => /Success Stories from Real Clients/,
      faqs_url => /Frequently Asked Questions/,
      privacy_url => /Your Privacy Matters/,
      terms_url => /Terms of Use/
    }

    pages.each do |url, heading|
      get url

      assert_response :success
      assert_select "h1", text: heading
    end
  end

  test "shows service pages" do
    get service_url("web-development")

    assert_response :success
    assert_select "h1", text: /Web & Software Development/
  end

  test "returns not found for unknown service" do
    get service_url("unknown-service")

    assert_response :not_found
  end
end

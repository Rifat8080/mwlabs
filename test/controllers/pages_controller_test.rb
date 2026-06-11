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
    assert_select "h2", text: /Tell us what you want to build/
    assert_select "form input[name='lead[source]'][value='Landing Page']"
    assert_select "body", text: /Selected founders get MVP builds/
    assert_select "body", text: /Request Growth Report/
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
    assert_select "a[href='#{new_user_session_path}']", text: "Login"
    assert_select "a[href='#{new_user_registration_path}']", count: 0
  end

  test "shows visitor pages" do
    pages = {
      about_url => /We Build Digital Growth Systems/,
      work_url => /Projects That Drive Real Results/,
      pricing_url => /Flexible Plans for Every Stage/,
      blog_url => /Insights on Digital Growth/,
      contact_url => /Let’s turn your idea into a clear growth plan/,
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

  test "contact page shows free MVP and marketing report offers" do
    get contact_url

    assert_response :success
    assert_select "option", text: "Free MVP Build"
    assert_select "option", text: "Free Marketing Report"
    assert_select "body", text: /Apply for an MVP partnership, request a complimentary marketing report/
    assert_select "body", text: /What happens next/
    assert_select "form input[name='lead[source]'][value='Website Contact Form']"
    assert_select "form input[name='lead[country]']", count: 0
    assert_select "form input[name='lead[budget]']", count: 0
    assert_select "form select[name='lead[urgency]']", count: 0
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

  test "contact form captures complete lead information" do
    assert_difference("Lead.count", 1) do
      assert_difference("User.where(role: 'client').count", 1) do
        post leads_url, params: {
          lead: {
            name: "Ahmed Khan",
            phone: "+8801700000000",
            email: "ahmed@example.com",
            company_name: "ABC Ltd",
            source: "Website Contact Form",
            service_interest: "Software & Web Development",
            message: "Need a business website and CRM."
          }
        }
      end
    end

    lead = Lead.order(:created_at).last
    user = User.find_by(email: "ahmed@example.com")
    assert_redirected_to edit_password_setup_url
    assert_equal "Ahmed Khan", lead.name
    assert_equal "+8801700000000", lead.phone
    assert_equal "ahmed@example.com", lead.email
    assert_equal "ABC Ltd", lead.company_name
    assert_equal "Website Contact Form", lead.source
    assert_equal "Software & Web Development", lead.service_interest
    assert_equal "Need a business website and CRM.", lead.message
    assert_equal "New", lead.status
    assert_equal "client", user.role
    assert_equal "Ahmed Khan", user.name
    assert_equal "+8801700000000", user.phone
  end

  test "auto-created client can set password after lead submission" do
    post leads_url, params: {
      lead: {
        name: "Password Client",
        phone: "+8801722222222",
        email: "password-client@example.com",
        source: "Website Contact Form",
        service_interest: "Free MVP Build",
        message: "Need MVP support."
      }
    }

    assert_redirected_to edit_password_setup_url
    follow_redirect!
    assert_response :success
    assert_select "h1", "Set your secure client portal password."

    patch password_setup_url, params: {
      user: {
        password: "newpassword123",
        password_confirmation: "newpassword123"
      }
    }

    assert_redirected_to dashboard_root_url
    user = User.find_by!(email: "password-client@example.com")
    assert user.valid_password?("newpassword123")
  end

  test "landing page enquiry captures source and creates client portal" do
    assert_difference("Lead.count", 1) do
      assert_difference("User.where(role: 'client').count", 1) do
        post leads_url, params: {
          lead: {
            name: "Landing Client",
            phone: "+8801733333333",
            email: "landing-client@example.com",
            company_name: "Landing Co",
            source: "Landing Page",
            service_interest: "Free Marketing Report",
            message: "Need a growth review from the landing page."
          }
        }
      end
    end

    lead = Lead.order(:created_at).last
    assert_redirected_to edit_password_setup_url
    assert_equal "Landing Page", lead.source
    assert_equal "Landing Client", User.find_by!(email: "landing-client@example.com").name
  end

  test "contact form reuses existing client account for repeat enquiries" do
    User.create!(
      name: "Existing Client",
      email: "repeat@example.com",
      password: "password123",
      password_confirmation: "password123",
      role: "client"
    )

    assert_difference("Lead.count", 1) do
      assert_no_difference("User.count") do
        post leads_url, params: {
          lead: {
            name: "Existing Client",
            phone: "+8801711111111",
            email: "repeat@example.com",
            source: "Website Contact Form",
            service_interest: "Digital Marketing",
            message: "Need campaign support."
          }
        }
      end
    end

    assert_redirected_to contact_url
  end

  test "invalid contact form renders errors without creating lead or account" do
    assert_no_difference("Lead.count") do
      assert_no_difference("User.count") do
        post leads_url, params: {
          lead: {
            name: "",
            email: "not-an-email",
            message: "Need help"
          }
        }
      end
    end

    assert_response :unprocessable_entity
    assert_select "form"
    assert_select "li", text: /Name can't be blank/
  end
end

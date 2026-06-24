require "test_helper"

module Admin
  class LeadCustomFieldsControllerTest < ActionDispatch::IntegrationTest
    setup do
      @admin = users(:admin)
      @lead = Lead.create!(name: "Custom Field Lead", email: "lead@example.com")
    end

    test "lead show renders custom fields panel" do
      @lead.update!(custom_fields: [ { "label" => "Industry", "value" => "SaaS" } ])

      sign_in @admin
      get admin_lead_url(@lead)

      assert_response :success
      assert_select "#lead-custom-fields"
      assert_select "body", text: /Industry/
      assert_select "body", text: /SaaS/
      assert_select "input[type='submit'][value='Add field']"
    end

    test "turbo create adds custom field without page redirect" do
      sign_in @admin

      assert_difference -> { @lead.reload.custom_fields.size }, 1 do
        post admin_lead_custom_fields_url(@lead), params: {
          label: "Referral source",
          value: "LinkedIn DM"
        }, as: :turbo_stream
      end

      assert_response :success
      assert_equal "text/vnd.turbo-stream.html", response.media_type
      assert_includes response.body, "target=\"lead-custom-fields\""
      assert_includes response.body, "Referral source"
      assert_includes response.body, "LinkedIn DM"
    end

    test "turbo destroy removes custom field without page redirect" do
      @lead.update!(custom_fields: [
        { "label" => "Industry", "value" => "SaaS" },
        { "label" => "Timeline", "value" => "Q3" }
      ])

      sign_in @admin

      assert_difference -> { @lead.reload.custom_fields.size }, -1 do
        delete admin_lead_custom_field_url(@lead, 0), as: :turbo_stream
      end

      assert_response :success
      assert_includes response.body, "target=\"lead-custom-fields\""
      assert_not_includes response.body, "Industry"
      assert_includes response.body, "Timeline"
    end

    test "lead form renders dynamic custom field controls" do
      sign_in @admin
      get new_admin_lead_url

      assert_response :success
      assert_select "[data-controller='dynamic-fields']"
      assert_select "button", text: /Add custom field/
      assert_select "button", text: /Remove/
    end

    test "admin can save custom fields from lead form" do
      sign_in @admin

      post admin_leads_url, params: {
        lead: {
          name: "Form Custom Fields",
          custom_fields: {
            "0" => { label: "Budget", value: "$10k" },
            "1" => { label: "Timeline", value: "ASAP" }
          }
        }
      }

      lead = Lead.order(:created_at).last
      assert_redirected_to admin_lead_url(lead)
      assert_equal [
        { "label" => "Budget", "value" => "$10k" },
        { "label" => "Timeline", "value" => "ASAP" }
      ], lead.custom_fields
    end
  end
end

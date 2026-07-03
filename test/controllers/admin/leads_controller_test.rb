require "test_helper"

module Admin
  class LeadsControllerTest < ActionDispatch::IntegrationTest
    setup do
      @admin = users(:admin)
      @lead = Lead.create!(name: "Inline Edit Lead", email: "inline@example.com")
    end

    test "lead details can be updated via turbo stream without page reload" do
      sign_in @admin

      patch admin_lead_url(@lead), params: {
        lead: {
          name: "Updated Name",
          company_name: "Updated Company",
          status: "Contacted"
        }
      }, as: :turbo_stream

      assert_response :success
      assert_equal "Updated Name", @lead.reload.name
      assert_equal "Updated Company", @lead.reload.company_name
      assert_equal "Contacted", @lead.reload.status
      assert_includes response.body, "target=\"lead-show-details\""
    end
  end
end

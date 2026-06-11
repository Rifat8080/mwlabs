require "test_helper"

module Admin
  class QuotesControllerTest < ActionDispatch::IntegrationTest
    setup do
      @admin = users(:admin)
      @team_member = users(:team_member)
      @client_user = users(:client)
      @client_record = Client.create!(name: "Portal Client", email: @client_user.email)
      @quote = Quote.create!(
        client: @client_record,
        status: "Draft",
        quote_items_attributes: [
          { name: "MVP build", quantity: 1, unit_price: 2500 }
        ]
      )
    end

    test "admin can send quote and download pdf" do
      sign_in @admin

      patch send_quote_admin_quote_url(@quote)
      assert_redirected_to admin_quote_url(@quote)
      assert_equal "Sent", @quote.reload.status

      get pdf_admin_quote_url(@quote)
      assert_response :success
      assert_equal "application/pdf", response.media_type
      assert_match(/attachment/, response.headers["Content-Disposition"])

      get admin_quote_url(@quote)
      assert_response :success
      assert_select "a[href='#quote-negotiation']", text: "Negotiation"
    end

    test "accepted quote page hides decision and management buttons" do
      @quote.send_to_recipient!(user: @admin)
      @quote.accept!(user: @admin)

      sign_in @admin
      get admin_quote_url(@quote)

      assert_response :success
      assert_match "Accepted quote", response.body
      assert_no_match "Accept quote", response.body
      assert_no_match "Reject quote", response.body
      assert_no_match "Send quote", response.body
      assert_no_match ">Edit<", response.body
      assert_no_match ">Delete<", response.body
    end

    test "accepted quote with stale viewed status renders as closed" do
      @quote.send_to_recipient!(user: @admin)
      @quote.update!(status: "Viewed", accepted_at: Time.current, negotiation_status: "none")

      sign_in @admin
      get admin_quote_url(@quote)

      assert_response :success
      assert_equal "Accepted", @quote.reload.status
      assert_match "Accepted quote", response.body
      assert_match "Portal Client", response.body
      assert_no_match "Accept quote", response.body
      assert_no_match "Reject quote", response.body
    end

    test "rejected quote page hides decision and management buttons" do
      @quote.send_to_recipient!(user: @admin)
      @quote.reject!(user: @admin)

      sign_in @admin
      get admin_quote_url(@quote)

      assert_response :success
      assert_match "Rejected quote", response.body
      assert_no_match "Accept quote", response.body
      assert_no_match "Reject quote", response.body
      assert_no_match "Send quote", response.body
      assert_no_match ">Edit<", response.body
      assert_no_match ">Delete<", response.body
    end

    test "team member can send assigned quote" do
      lead = Lead.create!(name: "Assigned Lead", email: "assigned@example.com", assigned_to: @team_member)
      quote = Quote.create!(
        lead: lead,
        status: "Draft",
        quote_items_attributes: [ { name: "Campaign", quantity: 1, unit_price: 900 } ]
      )

      sign_in @team_member
      patch send_quote_admin_quote_url(quote)

      assert_redirected_to admin_quote_url(quote)
      assert_equal "Sent", quote.reload.status
    end

    test "open negotiation blocks acceptance until staff resolves it" do
      @quote.send_to_recipient!(user: @admin)

      sign_in @client_user
      get admin_quote_url(@quote)
      assert_response :success
      assert_equal "Viewed", @quote.reload.status

      post admin_quote_quote_messages_url(@quote), params: {
        quote_message: {
          message: "Please adjust the timeline.",
          request_type: "timeline",
          priority: "blocking_acceptance",
          target_timeline: "Launch by July 15"
        }
      }
      assert_redirected_to admin_quote_url(@quote)
      assert_equal "Revised", @quote.reload.status
      change_request = @quote.quote_messages.where(kind: "change_request").last
      assert_includes change_request.message, "Request type: Timeline"
      assert_includes change_request.message, "Priority: Blocking acceptance"

      patch accept_admin_quote_url(@quote)
      assert_redirected_to admin_quote_url(@quote)
      assert_equal "Revised", @quote.reload.status
      assert_equal "open", @quote.negotiation_status

      sign_out @client_user
      sign_in @admin
      get admin_quote_url(@quote)
      assert_response :success
      assert_match "Accept locked", response.body

      post admin_quote_quote_messages_url(@quote), params: {
        quote_message: {
          response_type: "revised_terms",
          next_step: "ready_for_acceptance",
          message: "Timeline updated and the quote is ready for acceptance."
        }
      }
      assert_redirected_to admin_quote_url(@quote)
      assert_equal "resolved", @quote.reload.negotiation_status

      patch accept_admin_quote_url(@quote)
      assert_redirected_to admin_quote_url(@quote)
      assert_equal "Accepted", @quote.reload.status
    end

    test "admin cannot bypass open negotiation by changing status to accepted" do
      @quote.send_to_recipient!(user: @admin)
      @quote.request_revision!(user: @client_user, message: "Please revise the scope.")

      sign_in @admin
      patch admin_quote_url(@quote), params: { quote: { status: "Accepted" } }

      assert_response :unprocessable_entity
      assert_equal "Revised", @quote.reload.status
      assert_match "Resolve the open quote negotiation", response.body
    end

    test "staff internal negotiation notes are hidden from client portal" do
      @quote.send_to_recipient!(user: @admin)

      sign_in @admin
      post admin_quote_quote_messages_url(@quote), params: {
        quote_message: {
          response_type: "internal_note",
          next_step: "revise_quote_pricing",
          message: "Do not expose this margin note."
        }
      }
      assert_redirected_to admin_quote_url(@quote)
      assert @quote.reload.quote_messages.order(:created_at).last.internal?
      assert_equal "Sent", @quote.status

      sign_out @admin
      sign_in @client_user
      get admin_quote_url(@quote)

      assert_response :success
      assert_no_match "Do not expose this margin note.", response.body
    end

    test "client cannot access draft quote" do
      sign_in @client_user

      get admin_quote_url(@quote)
      assert_response :not_found
    end

    test "unrelated client cannot access another clients quote" do
      other_user = User.create!(
        name: "Other Client",
        email: "other@example.com",
        password: "password123",
        password_confirmation: "password123",
        role: "client"
      )
      @quote.send_to_recipient!(user: @admin)

      sign_in other_user
      get admin_quote_url(@quote)
      assert_response :not_found
    end
  end
end

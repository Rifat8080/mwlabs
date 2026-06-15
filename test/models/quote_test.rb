require "test_helper"

class QuoteTest < ActiveSupport::TestCase
  setup do
    @admin = users(:admin)
    @client_record = Client.create!(name: "Quote Client", email: "client@example.com")
    @lead = Lead.create!(name: "Lead Prospect", email: "lead@example.com")
    @quote = Quote.create!(
      client: @client_record,
      status: "Draft",
      quote_items_attributes: [
        { name: "Website build", quantity: 1, unit_price: 1200 }
      ]
    )
  end

  test "send_to_recipient publishes quote and creates system message" do
    @quote.send_to_recipient!(user: @admin)

    assert_equal "Sent", @quote.status
    assert_not_nil @quote.sent_at
    assert_equal @admin, @quote.sent_by
    assert @quote.public_token.present?
    assert_equal 1, @quote.quote_messages.where(kind: "system").count
  end

  test "request_revision opens negotiation and updates status" do
    @quote.update!(status: "Sent", sent_at: Time.current, sent_by: @admin)
    client_user = users(:client)

    @quote.request_revision!(user: client_user, message: "Can we reduce the price?")

    assert_equal "Revised", @quote.status
    assert_equal "open", @quote.negotiation_status
    assert_equal "change_request", @quote.quote_messages.last.kind
  end

  test "acceptance is blocked while negotiation is open" do
    @quote.update!(status: "Sent", sent_at: Time.current, sent_by: @admin)
    @quote.request_revision!(user: users(:client), message: "Can we reduce the price?")

    assert_raises(ActiveRecord::RecordInvalid) do
      @quote.accept!(user: @admin)
    end
    assert_not_equal "Accepted", @quote.reload.status
  end

  test "resolved negotiation can be accepted" do
    @quote.update!(status: "Sent", sent_at: Time.current, sent_by: @admin)
    @quote.request_revision!(user: users(:client), message: "Can we reduce the price?")
    @quote.resolve_negotiation!(user: @admin)

    @quote.accept!(user: @admin)

    assert_equal "Accepted", @quote.reload.status
    assert_equal "resolved", @quote.negotiation_status
  end

  test "accepted timestamp closes stale viewed quote state" do
    @quote.update!(status: "Viewed", accepted_at: Time.current)

    assert @quote.accepted?
    assert @quote.decision_closed?

    @quote.normalize_decision_state!

    assert_equal "Accepted", @quote.reload.status
    assert_equal "resolved", @quote.negotiation_status
  end

  test "mark_viewed updates sent quote to viewed" do
    @quote.update!(status: "Sent", sent_at: Time.current, sent_by: @admin)

    @quote.mark_viewed!(user: users(:client))

    assert_equal "Viewed", @quote.status
  end

  test "accessible_to_client only allows linked client on visible statuses" do
    client_user = users(:client)

    assert_not @quote.accessible_to_client?(client_user)

    @quote.update!(status: "Sent", sent_at: Time.current, sent_by: @admin)

    assert @quote.accessible_to_client?(client_user)
  end
end

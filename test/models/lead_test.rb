require "test_helper"

class LeadTest < ActiveSupport::TestCase
  test "won lead automatically creates and links client" do
    lead = Lead.create!(
      name: "Ahmed Khan",
      email: "ahmed@example.com",
      phone: "+8801700000000",
      company_name: "ABC Ltd",
      country: "Bangladesh",
      source: "Website Contact Form",
      service_interest: "Software & Web Development",
      status: "New"
    )

    assert_difference("Client.count", 1) do
      lead.update!(status: "Won")
    end

    lead.reload
    assert_equal "Won", lead.status
    assert_not_nil lead.client
    assert_equal "Ahmed Khan", lead.client.name
    assert_equal "ABC Ltd", lead.client.company_name
  end

  test "lost lead removes linked client when no business history exists" do
    lead = Lead.create!(name: "Lost Lead", email: "lost@example.com", status: "Won")
    client = lead.reload.client

    assert_difference("Client.count", -1) do
      lead.update!(status: "Lost")
    end

    assert_nil lead.reload.client
    assert_not Client.exists?(client.id)
  end
end

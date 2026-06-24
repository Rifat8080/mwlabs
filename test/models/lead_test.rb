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

  test "normalizes blank custom fields on save" do
    skip "custom_fields column not present" unless Lead.custom_fields_supported?

    lead = Lead.create!(
      name: "Custom Field Lead",
      custom_fields: [
        { "label" => " Industry ", "value" => " SaaS " },
        { "label" => "", "value" => "" }
      ]
    )

    assert_equal [ { "label" => "Industry", "value" => "SaaS" } ], lead.custom_fields
  end

  test "adds and removes custom fields" do
    skip "custom_fields column not present" unless Lead.custom_fields_supported?

    lead = Lead.create!(name: "Field Ops")

    assert lead.add_custom_field!(label: "Budget", value: "$5k")
    assert_equal 1, lead.reload.custom_fields.size

    assert lead.remove_custom_field_at!(0)
    assert_equal [], lead.reload.custom_fields
  end

  test "custom_fields_supported reflects the database schema" do
    assert_equal Lead.column_names.include?("custom_fields"), Lead.custom_fields_supported?
  end
end

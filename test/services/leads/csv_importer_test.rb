require "test_helper"

class Leads::CsvImporterTest < ActiveSupport::TestCase
  setup do
    @admin = users(:admin)
  end

  test "maps standard columns and stores unknown columns as custom fields" do
    csv = <<~CSV
      Full Name,Email,Phone,Company,Status,Twitter Handle,Deal Stage Label
      Jane Doe,jane@example.com,+8801700000001,Acme Ltd,New,@janedoe,Discovery
    CSV

    result = import_csv(csv)

    assert result.success?
    assert_equal 1, result.imported_count
    assert_includes result.custom_columns, "Twitter Handle"
    assert_includes result.custom_columns, "Deal Stage Label"

    lead = Lead.order(:created_at).last
    assert_equal "Jane Doe", lead.name
    assert_equal "jane@example.com", lead.email
    assert_equal "+8801700000001", lead.phone
    assert_equal "Acme Ltd", lead.company_name
    assert_equal "New", lead.status
    assert_equal "CSV Import", lead.source
    assert_equal [
      { "label" => "Twitter Handle", "value" => "@janedoe" },
      { "label" => "Deal Stage Label", "value" => "Discovery" }
    ], lead.custom_fields
  end

  test "preserves invalid enum values in custom fields instead of dropping them" do
    csv = <<~CSV
      name,status,source,urgency
      Alex Lee,Hot Pipeline,Partner Summit,Immediate
    CSV

    import_csv(csv)

    lead = Lead.order(:created_at).last
    assert_equal "New", lead.status
    assert_equal "CSV Import", lead.source
    assert_equal [
      { "label" => "status", "value" => "Hot Pipeline" },
      { "label" => "source", "value" => "Partner Summit" },
      { "label" => "urgency", "value" => "Immediate" }
    ], lead.custom_fields
  end

  test "maps aliases and duplicate target columns keep extra data as custom fields" do
    csv = <<~CSV
      contact_name,e_mail,secondary_email
      Sam Taylor,sam@example.com,backup@example.com
    CSV

    import_csv(csv)

    lead = Lead.order(:created_at).last
    assert_equal "Sam Taylor", lead.name
    assert_equal "sam@example.com", lead.email
    assert_equal [ { "label" => "secondary_email", "value" => "backup@example.com" } ], lead.custom_fields
  end

  test "infers a lead name when the csv does not include one" do
    csv = <<~CSV
      email,company
      founder@startup.io,Startup IO
    CSV

    import_csv(csv)

    lead = Lead.order(:created_at).last
    assert_equal "Startup IO", lead.name
    assert_equal "founder@startup.io", lead.email
  end

  test "imports budget and follow up dates when values are valid" do
    csv = <<~CSV
      name,budget,follow_up_date
      Budget Lead,12500.50,2026-07-15
    CSV

    import_csv(csv)

    lead = Lead.order(:created_at).last
    assert_equal BigDecimal("12500.50"), lead.budget
    assert_equal Date.new(2026, 7, 15), lead.follow_up_date
  end

  test "stores unparseable budget and date values as custom fields" do
    csv = <<~CSV
      name,budget,follow_up_date
      Flexible Lead,Five thousand,Soon
    CSV

    import_csv(csv)

    lead = Lead.order(:created_at).last
    assert_nil lead.budget
    assert_nil lead.follow_up_date
    assert_equal [
      { "label" => "budget", "value" => "Five thousand" },
      { "label" => "follow_up_date", "value" => "Soon" }
    ], lead.custom_fields
  end

  test "assigns imported leads to users and clients when values match existing records" do
    client = Client.create!(name: "Mapped Client", email: "mapped@client.com")

    csv = <<~CSV
      name,assigned_to,client
      Routed Lead,#{@admin.email},Mapped Client
    CSV

    import_csv(csv)

    lead = Lead.order(:created_at).last
    assert_equal @admin, lead.assigned_to
    assert_equal client, lead.client
  end

  test "records row errors without stopping the rest of the import" do
    csv = <<~CSV
      name,email
      Good Lead,good@example.com
      ,bad-email
    CSV

    result = import_csv(csv)

    assert_equal 1, result.imported_count
    assert_equal 1, result.failed_count
    assert_equal 1, result.row_errors.size
    assert Lead.exists?(email: "good@example.com")
  end

  test "returns a fatal error for malformed csv" do
    result = import_csv("name,email\n\"broken")

    assert_not result.success?
    assert_match(/could not be read/i, result.fatal_error)
  end

  private

  def import_csv(content)
    file = StringIO.new(content)
    Leads::CsvImporter.new(file: file, importer: @admin).call
  end
end

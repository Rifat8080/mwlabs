require "test_helper"

module Admin
  class LeadsImportControllerTest < ActionDispatch::IntegrationTest
    setup do
      @admin = users(:admin)
    end

    test "import page is available from leads workspace" do
      sign_in @admin
      get import_admin_leads_url

      assert_response :success
      assert_select "h1", text: /Import leads from CSV/
      assert_select "form[action=?]", import_admin_leads_path
    end

    test "leads index shows import csv action" do
      sign_in @admin
      get admin_leads_url

      assert_response :success
      assert_select "a[href=?]", import_admin_leads_path, text: /Import CSV/
    end

    test "admin can import leads from uploaded csv" do
      sign_in @admin

      csv = fixture_file_upload(csv_fixture("leads_import_sample.csv"), "text/csv")

      assert_difference -> { Lead.count }, 2 do
        post import_admin_leads_url, params: { file: csv }
      end

      assert_redirected_to admin_leads_url
      follow_redirect!
      assert_match(/2 leads imported/, flash[:notice])

      lead = Lead.find_by!(email: "alpha@example.com")
      assert_equal "Alpha User", lead.name
      assert_includes lead.custom_fields, { "label" => "LinkedIn URL", "value" => "https://linkedin.com/in/alpha" }
      assert_includes lead.custom_fields, { "label" => "Campaign ID", "value" => "CMP-1001" }

      second = Lead.find_by!(email: "beta@example.com")
      assert_equal "Beta User", second.name
      assert_equal [ { "label" => "Campaign ID", "value" => "CMP-7788" } ], second.custom_fields
    end

    test "import renders summary when some rows fail" do
      sign_in @admin

      csv = fixture_file_upload(csv_fixture("leads_import_with_errors.csv"), "text/csv")

      assert_difference -> { Lead.count }, 1 do
        post import_admin_leads_url, params: { file: csv }
      end

      assert_response :unprocessable_entity
      assert_select "h2", text: /Processing results/
      assert_select "body", text: /Failed rows/
      assert Lead.exists?(email: "valid@example.com")
    end

    private

    def csv_fixture(name)
      Rails.root.join("test/fixtures/files", name)
    end
  end
end

require "test_helper"

module Admin
  class DashboardControllerTest < ActionDispatch::IntegrationTest
    test "redirects guests to sign in" do
      get dashboard_root_url

      assert_redirected_to new_user_session_url
    end

    test "shows dashboard to signed in users" do
      sign_in users(:admin)

      get dashboard_root_url

      assert_response :success
      assert_select "h1", "Agency Operations Dashboard"
      assert_select "body", text: /Users/
      assert_select "body", text: /Money Overview/
    end

    test "team members see assigned workspace without finance or user management" do
      team_member = users(:team_member)
      client = Client.create!(name: "Team Client", email: "team-client@example.com")
      project = Project.create!(name: "Assigned Build", client: client, assigned_to: team_member)
      Task.create!(title: "Assigned task", project: project, assigned_to: team_member, due_date: Date.current)
      Lead.create!(name: "Assigned Lead", email: "lead@example.com", assigned_to: team_member)

      sign_in team_member
      get dashboard_root_url

      assert_response :success
      assert_select "h1", "Assigned Work Dashboard"
      assert_select "body", text: /Assigned leads/
      assert_select "body", text: /Assigned Build/
      assert_select "body", { text: /Money Overview/, count: 0 }
      assert_select "a[href='#{admin_users_path}']", count: 0
      assert_select "a[href='#{admin_invoices_path}']", count: 0
    end

    test "clients see read only portal data only" do
      client_user = users(:client)
      client = Client.create!(name: "Portal Client", email: client_user.email)
      project = Project.create!(name: "Client Website", client: client)
      Task.create!(title: "Visible milestone", project: project, client_visible: true, due_date: Date.current)
      Task.create!(title: "Internal checklist", project: project, client_visible: false, due_date: Date.current)
      Invoice.create!(client: client, project: project, subtotal: 100, total: 100, due_date: 1.week.from_now)
      Lead.create!(name: "Portal enquiry", email: client_user.email, status: "Need Requirement", service_interest: "Website")

      sign_in client_user
      get dashboard_root_url

      assert_response :success
      assert_select "h1", "Client Project Dashboard"
      assert_select "body", text: /My Enquiry Statuses/
      assert_select "body", text: /Need Requirement/
      assert_select "body", text: /Client Website/
      assert_select "body", text: /Visible milestone/
      assert_select "body", { text: /Internal checklist/, count: 0 }
      assert_select "body", { text: /Money Overview/, count: 0 }
      assert_select "a[href='#{new_admin_project_path}']", count: 0
    end

    test "role permissions scope direct resource urls" do
      client_user = users(:client)
      client = Client.create!(name: "Protected Client", email: client_user.email)
      project = Project.create!(name: "Protected Project", client: client)
      own_lead = Lead.create!(name: "Own Enquiry", email: client_user.email, status: "Contacted")
      Lead.create!(name: "Other Enquiry", email: "other@example.com", status: "Quote Preparing")

      sign_in client_user

      get admin_leads_url
      assert_response :success
      assert_select "body", text: /Own Enquiry/
      assert_select "body", text: /Contacted/
      assert_select "body", { text: /Other Enquiry/, count: 0 }

      get admin_lead_url(own_lead)
      assert_response :success
      assert_select "body", text: /Contacted/
      assert_select "body", { text: /Assigned person/, count: 0 }

      get admin_projects_url
      assert_response :success
      assert_select "body", text: /Protected Project/

      get edit_admin_project_url(project)
      assert_redirected_to admin_projects_url
    end

    test "team member resource lists are scoped to assigned records" do
      team_member = users(:team_member)
      client = Client.create!(name: "Scoped Client", email: "scoped@example.com")
      assigned_project = Project.create!(name: "Assigned Project", client: client, assigned_to: team_member)
      Project.create!(name: "Other Project", client: client)

      sign_in team_member

      get admin_projects_url
      assert_response :success
      assert_select "body", text: /Assigned Project/
      assert_select "body", { text: /Other Project/, count: 0 }

      get admin_invoices_url
      assert_redirected_to dashboard_root_url
    end
  end
end

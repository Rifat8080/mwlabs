require "test_helper"

class PortfolioAdminSmokeTest < ActionDispatch::IntegrationTest
  setup do
    sign_in users(:admin)
    @project = PortfolioProject.create!(
      title: "Smoke Test Project",
      client_name: "Acme",
      category: "Web Development",
      summary: "Smoke test summary",
      status: "Published"
    )
  end

  test "admin can view portfolio index" do
    get admin_portfolio_projects_path
    assert_response :success
  end

  test "admin can view new portfolio form" do
    get new_admin_portfolio_project_path
    assert_response :success
  end

  test "admin can view and edit existing portfolio project" do
    get admin_portfolio_project_path(@project)
    assert_response :success
    get edit_admin_portfolio_project_path(@project)
    assert_response :success
  end

  test "admin can create a portfolio project" do
    assert_difference "PortfolioProject.count", 1 do
      post admin_portfolio_projects_path, params: {
        portfolio_project: {
          title: "Test Project Create",
          client_name: "Acme",
          category: "Web Development",
          summary: "Smoke test summary",
          status: "Published"
        }
      }
    end
    assert_response :redirect
  end

  test "public work index and case study pages render" do
    get work_path
    assert_response :success

    get portfolio_project_path(@project.slug)
    assert_response :success
  end
end

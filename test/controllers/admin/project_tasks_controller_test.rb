require "test_helper"

module Admin
  class ProjectTasksControllerTest < ActionDispatch::IntegrationTest
    setup do
      @admin = users(:admin)
      @team_member = users(:team_member)
      @client_user = users(:client)
      @client = Client.create!(name: "Project Client", email: @client_user.email)
      @project = Project.create!(name: "Project Task Board", client: @client, assigned_to: @team_member)
    end

    test "project show renders professional task board" do
      Task.create!(project: @project, title: "Design landing page", status: "In Progress", client_visible: true)

      sign_in @admin
      get admin_project_url(@project)

      assert_response :success
      assert_select "#project-tasks"
      assert_select "a[href='#project-tasks']", text: "Project Tasks"
      assert_select "body", text: /Design landing page/
      assert_select "body", text: /Add project task/
    end

    test "admin creates task under project" do
      sign_in @admin

      assert_difference -> { @project.tasks.count }, 1 do
        post admin_project_tasks_url(@project), params: {
          task: {
            title: "Prepare homepage copy",
            assigned_to_id: @team_member.id,
            due_date: Date.current + 2.days,
            priority: "High",
            status: "To Do",
            description: "Draft the first version.",
            client_visible: "1"
          }
        }
      end

      assert_redirected_to admin_project_url(@project, anchor: "project-tasks")
      task = @project.tasks.last
      assert_equal "Prepare homepage copy", task.title
      assert_equal @team_member, task.assigned_to
      assert task.client_visible?
    end

    test "turbo create updates task board without page redirect" do
      sign_in @admin

      assert_difference -> { @project.tasks.count }, 1 do
        post admin_project_tasks_url(@project), params: {
          task: { title: "Turbo task", priority: "Medium", status: "To Do" }
        }, as: :turbo_stream
      end

      assert_response :success
      assert_equal "text/vnd.turbo-stream.html", response.media_type
      assert_includes response.body, "target=\"project-tasks\""
      assert_includes response.body, "Turbo task"
    end

    test "team member updates assigned project task from project" do
      task = Task.create!(project: @project, title: "Build hero section", assigned_to: @team_member)

      sign_in @team_member
      patch admin_project_task_url(@project, task), params: { task: { status: "Done" } }

      assert_redirected_to admin_project_url(@project, anchor: "project-tasks")
      assert_equal "Done", task.reload.status
      assert_equal 100, @project.reload.progress
    end

    test "turbo update moves task on board without page redirect" do
      task = Task.create!(project: @project, title: "Move with Turbo", status: "To Do")

      sign_in @admin
      patch admin_project_task_url(@project, task), params: { task: { status: "Review" } }, as: :turbo_stream

      assert_response :success
      assert_equal "Review", task.reload.status
      assert_includes response.body, "target=\"project-tasks\""
      assert_includes response.body, "Move with Turbo"
    end

    test "turbo destroy removes task from board without page redirect" do
      task = Task.create!(project: @project, title: "Remove with Turbo")

      sign_in @admin
      assert_difference -> { @project.tasks.count }, -1 do
        delete admin_project_task_url(@project, task), as: :turbo_stream
      end

      assert_response :success
      assert_includes response.body, "target=\"project-tasks\""
      assert_not_includes response.body, "Remove with Turbo"
    end

    test "client sees only client visible tasks and cannot create tasks" do
      Task.create!(project: @project, title: "Visible milestone", client_visible: true)
      Task.create!(project: @project, title: "Internal QA checklist", client_visible: false)

      sign_in @client_user
      get admin_project_url(@project)

      assert_response :success
      assert_select "#project-tasks"
      assert_select "body", text: /Visible milestone/
      assert_select "body", { text: /Internal QA checklist/, count: 0 }
      assert_select "body", { text: /Add project task/, count: 0 }

      assert_no_difference -> { @project.tasks.count } do
        post admin_project_tasks_url(@project), params: { task: { title: "Client-created task" } }
      end
      assert_redirected_to admin_project_url(@project)
    end
  end
end

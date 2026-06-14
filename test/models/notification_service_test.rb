require "test_helper"

class NotificationServiceTest < ActiveSupport::TestCase
  setup do
    Notification.delete_all
  end

  test "creates notifications for uuid user recipients" do
    admin = users(:admin)
    team_member = users(:team_member)
    client_user = users(:client)
    client = Client.create!(name: "Notify Client", email: client_user.email)
    project = Project.create!(name: "Notify Project", client: client, assigned_to: team_member)

    assert_difference -> { Notification.count }, 2 do
      NotificationService.notify(notifiable: project, action: "Project updated", actor: admin, details: "Kickoff moved.")
    end

    assert_equal 0, admin.notifications.count
    assert_equal 1, team_member.notifications.count
    assert_equal 1, client_user.notifications.count
    assert_equal project, team_member.notifications.last.notifiable
    assert_equal admin, team_member.notifications.last.actor
  end

  test "client users are notified only for client visible tasks" do
    admin = users(:admin)
    client_user = users(:client)
    client = Client.create!(name: "Task Client", email: client_user.email)
    project = Project.create!(name: "Task Notification Project", client: client)
    internal_task = Task.create!(project: project, title: "Internal QA", client_visible: false)
    visible_task = Task.create!(project: project, title: "Client Milestone", client_visible: true)
    Notification.delete_all

    assert_no_difference -> { client_user.notifications.count } do
      NotificationService.notify(notifiable: internal_task, action: "Task updated", actor: admin)
    end

    assert_difference -> { client_user.notifications.count }, 1 do
      NotificationService.notify(notifiable: visible_task, action: "Task updated", actor: admin)
    end

    assert_equal Rails.application.routes.url_helpers.admin_project_path(project, anchor: "project-tasks"), client_user.notifications.last.url
  end
end

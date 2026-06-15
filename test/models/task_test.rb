require "test_helper"

class TaskTest < ActiveSupport::TestCase
  test "internal task activity does not notify client portal users" do
    Notification.delete_all
    client_user = users(:client)
    client = Client.create!(name: "Task Activity Client", email: client_user.email)
    project = Project.create!(name: "Task Activity Project", client: client)

    assert_no_difference -> { client_user.notifications.count } do
      Task.create!(project: project, title: "Internal QA", client_visible: false)
    end
  end

  test "client visible task activity notifies client portal users" do
    Notification.delete_all
    client_user = users(:client)
    client = Client.create!(name: "Visible Task Client", email: client_user.email)
    project = Project.create!(name: "Visible Task Project", client: client)

    assert_difference -> { client_user.notifications.count }, 1 do
      Task.create!(project: project, title: "Client Milestone", client_visible: true)
    end
  end
end

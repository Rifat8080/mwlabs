require "test_helper"

module Admin
  class NotificationsControllerTest < ActionDispatch::IntegrationTest
    setup do
      @admin = users(:admin)
      @client = Client.create!(name: "Notification Client", email: "notification-client@example.com")
      @project = Project.create!(name: "Notification Project", client: @client)
      @notification = Notification.create!(
        recipient: @admin,
        notifiable: @project,
        action: "Project updated",
        params: { details: "Timeline changed." },
        url: admin_project_path(@project),
        level: "info",
        icon: "fa-diagram-project"
      )
    end

    test "index shows notifications and dropdown markup" do
      sign_in @admin

      get admin_notifications_url

      assert_response :success
      assert_select "#admin-notifications-list"
      assert_select "#notifications-menu[data-controller='notification-menu']"
      assert_select "button[data-action='click->notification-menu#toggle']"
      assert_select "#admin_notification_#{@notification.id}"
      assert_select "body", text: /Timeline changed/
    end

    test "turbo mark as read updates dropdown and index list" do
      sign_in @admin

      patch admin_notification_url(@notification), as: :turbo_stream

      assert_response :success
      assert_equal "text/vnd.turbo-stream.html", response.media_type
      assert_not_nil @notification.reload.read_at
      assert_includes response.body, "target=\"notifications-menu\""
      assert_includes response.body, "target=\"admin-notifications-list\""
    end

    test "json mark as read returns no content" do
      sign_in @admin

      patch admin_notification_url(@notification), as: :json

      assert_response :no_content
      assert_not_nil @notification.reload.read_at
    end

    test "mark all clears unread notifications with turbo update" do
      Notification.create!(
        recipient: @admin,
        notifiable: @project,
        action: "Another update",
        url: admin_project_path(@project),
        level: "warning"
      )

      sign_in @admin

      patch mark_all_admin_notifications_url, as: :turbo_stream

      assert_response :success
      assert_equal 0, @admin.notifications.unread.count
      assert_includes response.body, "target=\"notifications-menu\""
      assert_includes response.body, "target=\"admin-notifications-list\""
    end

    test "return_to redirects only to admin paths" do
      sign_in @admin

      patch admin_notification_url(@notification, return_to: "https://example.com/phish")

      assert_redirected_to admin_notifications_url
      assert_not_nil @notification.reload.read_at
    end
  end
end

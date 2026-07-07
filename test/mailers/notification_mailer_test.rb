require "test_helper"

class NotificationMailerTest < ActionMailer::TestCase
  test "renders the recipient's name without relying on current_user" do
    user = users(:admin)

    mail = NotificationMailer.with(
      user: user, action: "Test notification", notifiable: nil, actor: nil, details: "Some details"
    ).notify

    assert_equal [ user.email ], mail.to
    assert_match user.display_name, mail.html_part.body.to_s
    assert_match user.display_name, mail.text_part.body.to_s
  end

  test "renders safely when actor, notifiable, and details are all nil" do
    user = users(:admin)

    mail = NotificationMailer.with(user: user, action: "Test", notifiable: nil, actor: nil, details: nil).notify

    assert_match "there", mail.html_part.body.to_s if user.display_name.blank?
    assert mail.html_part.body.to_s.present?
  end

  test "does not send mail when there is no recipient" do
    mail = NotificationMailer.with(user: nil, client: nil, action: "Test").notify

    assert_nil mail.message.perform_deliveries
  end
end

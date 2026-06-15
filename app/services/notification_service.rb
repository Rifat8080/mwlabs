class NotificationService
  def self.notify(notifiable:, action:, actor: nil, details: nil)
    recipients = determine_recipients(notifiable, actor: actor)
    return if recipients.blank?

    recipients.each do |recipient|
      notification = Notification.create!(
        recipient: recipient,
        notifiable: notifiable,
        actor: actor,
        action: action,
        params: { details: normalize_details(details) },
        url: notification_url_for(notifiable),
        level: notification_level_for(notifiable, action),
        icon: notification_icon_for(notifiable)
      )

      deliver_email(notification, details)
    rescue StandardError => e
      Rails.logger.error("Notification delivery failed for #{recipient.class.name} #{recipient.id}: #{e.message}")
    end
  end

  def self.notification_url_for(notifiable)
    case notifiable
    when Project
      Rails.application.routes.url_helpers.admin_project_path(notifiable)
    when Task
      Rails.application.routes.url_helpers.admin_project_path(notifiable.project, anchor: "project-tasks")
    when Invoice
      Rails.application.routes.url_helpers.admin_invoice_path(notifiable)
    when Lead
      Rails.application.routes.url_helpers.admin_lead_path(notifiable)
    when Quote
      Rails.application.routes.url_helpers.admin_quote_path(notifiable)
    when Client
      Rails.application.routes.url_helpers.admin_client_path(notifiable)
    when Payment
      Rails.application.routes.url_helpers.admin_payment_path(notifiable)
    when Expense
      Rails.application.routes.url_helpers.admin_expense_path(notifiable)
    else
      nil
    end
  end

  def self.notification_level_for(_notifiable, action)
    action_str = action.to_s.downcase

    return "danger" if action_str.include?("overdue") || action_str.include?("unpaid") ||
                       action_str.include?("lost") || action_str.include?("rejected") ||
                       action_str.include?("cancelled") || action_str.include?("error")

    return "success" if action_str.include?("paid") || action_str.include?("won") ||
                        action_str.include?("accepted") || action_str.include?("delivered") ||
                        action_str.include?("completed") || action_str.include?("approved")

    return "warning" if action_str.include?("requires action") || action_str.include?("pending") ||
                        action_str.include?("follow up") || action_str.include?("waiting")

    "info"
  end

  def self.notification_icon_for(notifiable)
    case notifiable
    when Task
      "fa-list-check"
    when Invoice
      "fa-file-invoice-dollar"
    when Lead
      "fa-user-plus"
    when Project
      "fa-diagram-project"
    when Quote
      "fa-file-signature"
    when Payment
      "fa-credit-card"
    when Expense
      "fa-receipt"
    when Client
      "fa-address-book"
    else
      "fa-bell"
    end
  end

  def self.determine_recipients(subject, actor: nil)
    recipients = []

    if subject.respond_to?(:assigned_to) && subject.assigned_to.present?
      recipients << subject.assigned_to
    end

    if subject.respond_to?(:project) && subject.project.present? && subject.project.assigned_to.present?
      recipients << subject.project.assigned_to
    end

    recipients.concat(client_portal_users_for(subject))
    recipients.concat(User.where(role: "admin").to_a)
    recipients = recipients.compact.uniq { |recipient| [ recipient.class.name, recipient.id ] }
    recipients.reject { |recipient| actor.present? && recipient.is_a?(User) && actor.is_a?(User) && recipient.id == actor.id }
  end

  def self.client_portal_users_for(subject)
    case subject
    when Project
      users_for_client(subject.client)
    when Invoice
      users_for_client(subject.client)
    when Quote
      users_for_client(subject.client) + users_for_email(subject.lead&.email)
    when Task
      subject.client_visible? ? users_for_client(subject.project.client) : []
    when Lead
      users_for_email(subject.email)
    else
      []
    end
  end

  def self.users_for_client(client)
    return [] if client&.email.blank?

    users_for_email(client.email)
  end

  def self.users_for_email(email)
    return [] if email.blank?

    User.where(role: "client").where("LOWER(email) = ?", email.downcase).to_a
  end

  def self.normalize_details(details)
    return if details.blank?
    return details.to_json if details.is_a?(Hash)

    details.to_s
  end

  def self.deliver_email(notification, details)
    return unless notification.recipient.is_a?(User) && notification.recipient.email.present?

    NotificationMailer.with(
      user: notification.recipient,
      action: notification.action,
      notifiable: notification.notifiable,
      actor: notification.actor,
      details: details
    ).notify.deliver_later
  end
end

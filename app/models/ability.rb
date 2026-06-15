class Ability
  include CanCan::Ability

  STAFF_MODELS = [ Lead, Quote, Project, Task, FileUpload, Reminder, BlogPost ].freeze
  CLIENT_PORTAL_MODELS = [ Lead, Quote, Project, Task, Invoice, FileUpload ].freeze

  attr_reader :user

  def initialize(user)
    @user = user || User.new(role: "guest")

    can :create, Lead
    can :manage, Notification, recipient: @user
    can :update, User, id: @user.id
    can :read, BlogPost do |post|
      post.published?
    end

    case @user.role
    when "admin"
      can :manage, :all
    when "team_member"
      team_member_rules
    when "client"
      client_rules
    end
  end

  def resource_scope(model)
    return model.all if admin?
    return team_member_scope(model) if team_member?
    return client_scope(model) if client?

    model.none
  end

  def manageable_resource?(model)
    return true if admin?
    return false if client?

    team_member? && model.in?(STAFF_MODELS)
  end

  def accessible_resource?(model)
    return true if admin?
    return model.in?(STAFF_MODELS) if team_member?
    return model.in?(CLIENT_PORTAL_MODELS) if client?

    false
  end

  def can_send_quote?(quote)
    manageable_resource?(Quote) && quote.is_a?(Quote) && !quote.accepted? && quote.status.in?(%w[Draft Sent Viewed Revised])
  end

  def can_negotiate_quote?(quote)
    return false unless quote.is_a?(Quote) && quote.negotiable?

    admin? || team_member? || quote.accessible_to_client?(user)
  end

  def can_decide_quote?(quote)
    can_negotiate_quote?(quote)
  end

  private

  def admin?
    user.role == "admin"
  end

  def team_member?
    user.role == "team_member"
  end

  def client?
    user.role == "client"
  end

  def current_client
    return @current_client if defined?(@current_client)
    return @current_client = nil if user.email.blank?

    @current_client = Client.find_by("LOWER(email) = ?", user.email.downcase)
  end

  def team_member_rules
    can :manage, Lead, assigned_to_id: user.id
    can :manage, Project, assigned_to_id: user.id
    can :manage, Task, assigned_to_id: user.id
    can :manage, Task do |task|
      task.project&.assigned_to_id == user.id
    end
    can :manage, Reminder, user_id: user.id
    can :manage, BlogPost

    can :manage, Quote do |quote|
      team_member_quote_scope.exists?(quote.id)
    end

    can :manage, FileUpload do |file_upload|
      team_member_file_scope.exists?(file_upload.id)
    end
  end

  def client_rules
    can :read, Lead do |lead|
      client_lead_scope.exists?(lead.id)
    end

    can :read, Quote do |quote|
      quote.accessible_to_client?(user)
    end

    can :read, Project do |project|
      current_client.present? && project.client_id == current_client.id
    end

    can :read, Task do |task|
      client_task_scope.exists?(task.id)
    end

    can :read, Invoice do |invoice|
      current_client.present? && invoice.client_id == current_client.id
    end

    can :read, FileUpload do |file_upload|
      client_file_scope.exists?(file_upload.id)
    end
  end

  def team_member_scope(model)
    case model.name
    when "Lead"
      Lead.where(assigned_to: user)
    when "Quote"
      team_member_quote_scope
    when "Project"
      Project.where(assigned_to: user)
    when "Task"
      Task.left_outer_joins(:project).where(assigned_to: user).or(
        Task.left_outer_joins(:project).where(projects: { assigned_to_id: user.id })
      ).distinct
    when "FileUpload"
      team_member_file_scope
    when "Reminder"
      Reminder.where(user: user)
    when "BlogPost"
      BlogPost.all
    else
      model.none
    end
  end

  def client_scope(model)
    case model.name
    when "Lead"
      client_lead_scope
    when "Quote"
      client_quote_scope
    when "Project"
      current_client.present? ? Project.where(client: current_client) : Project.none
    when "Task"
      client_task_scope
    when "Invoice"
      current_client.present? ? Invoice.where(client: current_client) : Invoice.none
    when "FileUpload"
      client_file_scope
    else
      model.none
    end
  end

  def team_member_quote_scope
    Quote.left_outer_joins(:lead, :projects).where(leads: { assigned_to_id: user.id }).or(
      Quote.left_outer_joins(:lead, :projects).where(projects: { assigned_to_id: user.id })
    ).distinct
  end

  def team_member_file_scope
    FileUpload.left_outer_joins(:project, :task).where(projects: { assigned_to_id: user.id }).or(
      FileUpload.left_outer_joins(:project, :task).where(tasks: { assigned_to_id: user.id })
    ).distinct
  end

  def client_lead_scope
    email_scope = Lead.where("LOWER(email) = ?", user.email.to_s.downcase)
    return email_scope if current_client.blank?

    Lead.where(client: current_client).or(email_scope)
  end

  def client_quote_scope
    return Quote.none if current_client.blank?

    Quote.left_outer_joins(:lead).where(status: Quote::CLIENT_VISIBLE_STATUSES, client: current_client).or(
      Quote.left_outer_joins(:lead).where(status: Quote::CLIENT_VISIBLE_STATUSES, leads: { email: user.email })
    )
  end

  def client_task_scope
    return Task.none if current_client.blank?

    Task.joins(:project).where(projects: { client_id: current_client.id }, client_visible: true)
  end

  def client_file_scope
    return FileUpload.none if current_client.blank?

    FileUpload.left_outer_joins(:project).where(client: current_client, visibility: "Client Visible").or(
      FileUpload.left_outer_joins(:project).where(projects: { client_id: current_client.id }, visibility: "Client Visible")
    )
  end
end

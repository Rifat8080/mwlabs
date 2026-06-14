module Admin
  class BaseController < ApplicationController
    before_action :authenticate_user!

    layout "admin"

    helper_method :admin_user?, :team_member?, :client_user?, :current_client,
      :allowed_nav_sections, :can_access_resource?, :can_manage_resource?,
      :can_send_quote?, :can_negotiate_quote?, :can_decide_quote?,
      :client_quote_scope

    private

    def admin_user?
      current_user&.admin?
    end

    def team_member?
      current_user&.role == "team_member"
    end

    def client_user?
      current_user&.role == "client"
    end

    def current_client
      return @current_client if defined?(@current_client)
      return @current_client = nil if current_user.email.blank?

      @current_client = Client.find_by("LOWER(email) = ?", current_user.email.downcase)
    end

    def client_quote_scope
      return Quote.none if current_client.blank?

      Quote.left_outer_joins(:lead).where(status: Quote::CLIENT_VISIBLE_STATUSES, client: current_client).or(
        Quote.left_outer_joins(:lead).where(status: Quote::CLIENT_VISIBLE_STATUSES, leads: { email: current_user.email })
      )
    end

    def can_access_resource?(model)
      return true if admin_user?

      if team_member?
        model.in?([ Lead, Quote, Project, Task, FileUpload, Reminder ])
      elsif client_user?
        model.in?([ Lead, Quote, Project, Task, Invoice, FileUpload ])
      else
        false
      end
    end

    def can_manage_resource?(model)
      return true if admin_user?
      return false if client_user?

      team_member? && model.in?([ Lead, Quote, Project, Task, FileUpload, Reminder ])
    end

    def allowed_nav_sections
      {
        "Overview" => [ nav_item("Dashboard", helpers.dashboard_root_path, "fa-gauge-high") ],
        "CRM" => [
          nav_item("Leads", helpers.admin_leads_path, "fa-user-plus", Lead),
          nav_item("Clients", helpers.admin_clients_path, "fa-address-book", Client),
          nav_item("Follow-ups", helpers.admin_reminders_path, "fa-bell", Reminder)
        ],
        "Sales" => [
          nav_item("Services", helpers.admin_services_path, "fa-layer-group", Service),
          nav_item("Quotes", helpers.admin_quotes_path, "fa-file-signature", Quote)
        ],
        "Projects" => [
          nav_item("Projects", helpers.admin_projects_path, "fa-diagram-project", Project),
          nav_item("Files", helpers.admin_file_uploads_path, "fa-folder-open", FileUpload)
        ],
        "Finance" => [
          nav_item("Invoices", helpers.admin_invoices_path, "fa-file-invoice-dollar", Invoice),
          nav_item("Payments", helpers.admin_payments_path, "fa-credit-card", Payment),
          nav_item("Expenses", helpers.admin_expenses_path, "fa-receipt", Expense)
        ],
        "Team" => [ nav_item("Users", helpers.admin_users_path, "fa-users", User) ]
      }.transform_values(&:compact).reject { |_section, links| links.empty? }
    end

    def nav_item(label, path, icon, model = nil)
      [ label, path, icon ] if model.blank? || can_access_resource?(model)
    end

    def can_send_quote?(quote)
      can_manage_resource?(Quote) && quote.is_a?(Quote) && !quote.accepted? && quote.status.in?(%w[Draft Sent Viewed Revised])
    end

    def can_negotiate_quote?(quote)
      return false unless quote.is_a?(Quote) && quote.negotiable?

      admin_user? || team_member? || quote.accessible_to_client?(current_user)
    end

    def can_decide_quote?(quote)
      return false unless quote.is_a?(Quote) && quote.negotiable?

      admin_user? || team_member? || quote.accessible_to_client?(current_user)
    end
  end
end

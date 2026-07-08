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
      current_ability.resource_scope(Quote)
    end

    def can_access_resource?(model)
      current_ability.accessible_resource?(model)
    end

    def can_manage_resource?(model)
      current_ability.manageable_resource?(model)
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
        "Content" => [
          nav_item("Portfolio", helpers.admin_portfolio_projects_path, "fa-briefcase", PortfolioProject),
          nav_item("Blog", helpers.admin_blog_posts_path, "fa-newspaper", BlogPost),
          nav_item("Blog Categories", helpers.admin_blog_categories_path, "fa-tags", BlogCategory)
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
        "Team" => [ nav_item("Users", helpers.admin_users_path, "fa-users", User) ],
        "Agency OS" => [
          nav_item("Dashboard", helpers.admin_agency_dashboard_path, "fa-chart-line", AgencyTask),
          nav_item("Tasks", helpers.admin_agency_tasks_path, "fa-list-check", AgencyTask),
          nav_item("Task Categories", helpers.admin_agency_task_categories_path, "fa-tags", AgencyTaskCategory),
          nav_item("Marketing Planner", helpers.admin_marketing_items_path, "fa-bullhorn", MarketingItem),
          nav_item("Daily Planner", helpers.admin_daily_plan_path, "fa-calendar-day", DailyPlan),
          nav_item("AI Employees", helpers.admin_ai_employees_path, "fa-users-gear", AgencyTask),
          nav_item("AI Assistant", helpers.admin_ai_assistant_path, "fa-robot", AgencyTask),
          nav_item("AI Prompts", helpers.admin_ai_prompts_path, "fa-comment-dots", AiPrompt),
          nav_item("AI Knowledge", helpers.admin_ai_knowledge_entries_path, "fa-brain", AiKnowledgeEntry),
          nav_item("AI Usage Logs", helpers.admin_ai_usage_logs_path, "fa-chart-simple", AiUsageLog)
        ]
      }.transform_values(&:compact).reject { |_section, links| links.empty? }
    end

    def nav_item(label, path, icon, model = nil)
      [ label, path, icon ] if model.blank? || can_access_resource?(model)
    end

    def can_send_quote?(quote)
      current_ability.can_send_quote?(quote)
    end

    def can_negotiate_quote?(quote)
      current_ability.can_negotiate_quote?(quote)
    end

    def can_decide_quote?(quote)
      current_ability.can_decide_quote?(quote)
    end
  end
end

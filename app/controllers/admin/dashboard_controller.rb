module Admin
  class DashboardController < BaseController
    def show
      Invoice.mark_overdue!
      return client_dashboard if client_user?
      return team_dashboard if team_member?

      admin_dashboard
    end

    private

    def admin_dashboard
      month = Time.current.all_month

      @dashboard_label = "M&W Labs Control Center"
      @dashboard_title = "Agency Operations Dashboard"
      @dashboard_description = "Manage clients, leads, quotes, projects, tasks, invoices, payments, expenses, and follow-ups from one internal control center."
      @cards = [
        [ "Total leads", Lead.count ],
        [ "New leads this month", Lead.where(created_at: month).count ],
        [ "Active clients", Client.where(status: "Active").count ],
        [ "Active projects", Project.active.count ],
        [ "Pending quotes", Quote.where(status: [ "Draft", "Sent", "Viewed", "Revised" ]).count ],
        [ "Unpaid invoices", Invoice.unpaid.count ],
        [ "Monthly revenue", helpers.number_to_currency(Payment.where(payment_date: Date.current.all_month).sum(:amount)) ],
        [ "Monthly expenses", helpers.number_to_currency(Expense.where(date: Date.current.all_month).sum(:amount)) ],
        [ "Estimated profit", helpers.number_to_currency(monthly_profit) ],
        [ "Overdue tasks", Task.overdue.count ],
        [ "Follow-ups due today", followups_due_count ]
      ]

      @pipeline = Lead::STATUSES.index_with { |status| Lead.where(status: status).count }
      @workflow_lanes = [
        {
          title: "Lead Intake",
          icon: "fa-user-plus",
          count: Lead.where(status: [ "New", "Contacted", "Need Requirement" ]).count,
          action: "Qualify and collect requirements",
          path: helpers.admin_leads_path
        },
        {
          title: "Sales Closing",
          icon: "fa-file-signature",
          count: Quote.where(status: [ "Draft", "Sent", "Viewed", "Revised" ]).count,
          action: "Send, follow up, and close quotes",
          path: helpers.admin_quotes_path
        },
        {
          title: "Delivery",
          icon: "fa-diagram-project",
          count: Project.where(status: [ "Requirement Collection", "In Progress", "Waiting for Client", "Revision" ]).count,
          action: "Move projects through production",
          path: helpers.admin_projects_path
        },
        {
          title: "Cash Collection",
          icon: "fa-sack-dollar",
          count: Invoice.unpaid.count,
          action: "Chase unpaid and overdue invoices",
          path: helpers.admin_invoices_path
        }
      ]
      @today_tasks = Task.where(due_date: ..Date.current).where.not(status: "Done").includes(:project).order(:due_date).limit(6)
      @today_leads = Lead.followups_due.order(:follow_up_date).limit(6)
      @reminders = Reminder.due_today.includes(:user).order(:due_date).limit(6)
      @active_projects = Project.active.includes(:client).order(:deadline).limit(8)
      @money = {
        income: Payment.where(payment_date: Date.current.all_month).sum(:amount),
        expenses: Expense.where(date: Date.current.all_month).sum(:amount),
        pending: Invoice.unpaid.sum("total - paid_amount")
      }
    end

    def team_dashboard
      @dashboard_label = "Team Workspace"
      @dashboard_title = "Assigned Work Dashboard"
      @dashboard_description = "Focus on the leads, quotes, projects, tasks, files, and follow-ups assigned to you."

      assigned_leads = Lead.where(assigned_to: current_user)
      assigned_projects = Project.where(assigned_to: current_user)
      assigned_tasks = Task.where(assigned_to: current_user)
      assigned_quotes = Quote.left_outer_joins(:lead, :projects).where(leads: { assigned_to_id: current_user.id }).or(
        Quote.left_outer_joins(:lead, :projects).where(projects: { assigned_to_id: current_user.id })
      ).distinct

      @cards = [
        [ "Assigned leads", assigned_leads.count ],
        [ "Active projects", assigned_projects.active.count ],
        [ "Open tasks", assigned_tasks.where.not(status: "Done").count ],
        [ "Due tasks", assigned_tasks.where(due_date: ..Date.current).where.not(status: "Done").count ],
        [ "Pending quotes", assigned_quotes.where(status: [ "Draft", "Sent", "Viewed", "Revised" ]).count ],
        [ "Follow-ups due today", Reminder.due_today.where(user: current_user).count ]
      ]

      @pipeline = Lead::STATUSES.index_with { |status| assigned_leads.where(status: status).count }
      @workflow_lanes = [
        {
          title: "Assigned Leads",
          icon: "fa-user-plus",
          count: assigned_leads.where(status: [ "New", "Contacted", "Need Requirement" ]).count,
          action: "Qualify prospects assigned to you",
          path: helpers.admin_leads_path
        },
        {
          title: "Quote Follow-up",
          icon: "fa-file-signature",
          count: assigned_quotes.where(status: [ "Draft", "Sent", "Viewed", "Revised" ]).count,
          action: "Move assigned quotes toward decision",
          path: helpers.admin_quotes_path
        },
        {
          title: "Delivery Work",
          icon: "fa-diagram-project",
          count: assigned_projects.active.count,
          action: "Progress your assigned projects",
          path: helpers.admin_projects_path
        },
        {
          title: "My Tasks",
          icon: "fa-list-check",
          count: assigned_tasks.where.not(status: "Done").count,
          action: "Complete tasks and update status",
          path: helpers.admin_tasks_path
        }
      ]
      @today_tasks = assigned_tasks.where(due_date: ..Date.current).where.not(status: "Done").includes(:project).order(:due_date).limit(6)
      @today_leads = assigned_leads.followups_due.order(:follow_up_date).limit(6)
      @reminders = Reminder.due_today.where(user: current_user).order(:due_date).limit(6)
      @active_projects = assigned_projects.active.includes(:client).order(:deadline).limit(8)
      @money = nil
    end

    def client_dashboard
      client = current_client
      client_projects = client.present? ? Project.where(client: client) : Project.none
      client_tasks = Task.joins(:project).where(projects: { client_id: client&.id }, client_visible: true)
      client_files = if client.present?
        FileUpload.left_outer_joins(:project).where(client: client, visibility: "Client Visible").or(
          FileUpload.left_outer_joins(:project).where(projects: { client_id: client.id }, visibility: "Client Visible")
        )
      else
        FileUpload.none
      end
      client_invoices = client.present? ? Invoice.where(client: client) : Invoice.none
      client_quotes = client.present? ? Quote.left_outer_joins(:lead).where(client: client).or(Quote.left_outer_joins(:lead).where(leads: { email: current_user.email })) : Quote.none
      client_enquiries = client_lead_scope

      @dashboard_label = "M&W Labs Client Portal"
      @dashboard_title = "Client Project Dashboard"
      @dashboard_description = "View your enquiry statuses, project progress, shared files, quotes, invoices, and client-visible tasks from one portal."
      @cards = [
        [ "Enquiries", client_enquiries.count ],
        [ "Active projects", client_projects.active.count ],
        [ "Visible tasks", client_tasks.where.not(status: "Done").count ],
        [ "Shared files", client_files.count ],
        [ "Quotes", client_quotes.count ],
        [ "Unpaid invoices", client_invoices.unpaid.count ],
        [ "Pending balance", helpers.number_to_currency(client_invoices.unpaid.sum("total - paid_amount")) ]
      ]

      @pipeline = Lead::STATUSES.index_with { |status| client_enquiries.where(status: status).count }
      @workflow_lanes = [
        {
          title: "My Enquiries",
          icon: "fa-user-plus",
          count: client_enquiries.count,
          action: "Track each enquiry status from intake to quote",
          path: helpers.admin_leads_path
        },
        {
          title: "My Projects",
          icon: "fa-diagram-project",
          count: client_projects.active.count,
          action: "Review current delivery progress",
          path: helpers.admin_projects_path
        },
        {
          title: "Shared Tasks",
          icon: "fa-list-check",
          count: client_tasks.where.not(status: "Done").count,
          action: "See tasks visible to your team",
          path: helpers.admin_tasks_path
        },
        {
          title: "Shared Files",
          icon: "fa-folder-open",
          count: client_files.count,
          action: "Access client-visible assets and deliverables",
          path: helpers.admin_file_uploads_path
        },
        {
          title: "Billing",
          icon: "fa-file-invoice-dollar",
          count: client_invoices.unpaid.count,
          action: "Review invoices and balances",
          path: helpers.admin_invoices_path
        }
      ]
      @today_tasks = client_tasks.where(due_date: ..Date.current).where.not(status: "Done").includes(:project).order(:due_date).limit(6)
      @today_leads = Lead.none
      @reminders = Reminder.none
      @active_projects = client_projects.active.includes(:client).order(:deadline).limit(8)
      @money = nil
    end

    def monthly_profit
      Payment.where(payment_date: Date.current.all_month).sum(:amount) -
        Expense.where(date: Date.current.all_month).sum(:amount)
    end

    def followups_due_count
      Lead.followups_due.count + Reminder.due_today.count
    end

    def client_lead_scope
      email_scope = Lead.where("LOWER(email) = ?", current_user.email.downcase)
      return email_scope if current_client.blank?

      Lead.where(client: current_client).or(email_scope)
    end
  end
end

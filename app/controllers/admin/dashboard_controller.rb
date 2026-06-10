module Admin
  class DashboardController < BaseController
    def show
      Invoice.mark_overdue!
      month = Time.current.all_month

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

    private

    def monthly_profit
      Payment.where(payment_date: Date.current.all_month).sum(:amount) -
        Expense.where(date: Date.current.all_month).sum(:amount)
    end

    def followups_due_count
      Lead.followups_due.count + Reminder.due_today.count
    end
  end
end

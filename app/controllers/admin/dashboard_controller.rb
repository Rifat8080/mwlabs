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

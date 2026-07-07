module Admin
  class AgencyDashboardController < BaseController
    before_action :require_admin!

    def show
      @cards = [
        [ "Today's tasks", AgencyTask.due_today.count ],
        [ "Overdue", AgencyTask.overdue.count ],
        [ "Upcoming (7 days)", AgencyTask.upcoming.where(due_date: ..(Date.current + 7.days)).count ],
        [ "Due this week", AgencyTask.due_this_week.count ],
        [ "Completed today", AgencyTask.completed_today.count ],
        [ "Marketing scheduled", MarketingItem.scheduled.count ],
        [ "Marketing published", MarketingItem.published_items.count ]
      ]

      @today_tasks = AgencyTask.due_today.includes(:agency_task_category).ordered.limit(6)
      @overdue_tasks = AgencyTask.overdue.includes(:agency_task_category).ordered.limit(6)
      @upcoming_tasks = AgencyTask.upcoming.includes(:agency_task_category).ordered.limit(6)

      week_tasks = AgencyTask.where(created_at: Time.current.all_week)
      @weekly_progress = { completed: week_tasks.where(status: "Completed").count, total: week_tasks.count }

      month_tasks = AgencyTask.where(created_at: Time.current.all_month)
      @monthly_progress = { completed: month_tasks.where(status: "Completed").count, total: month_tasks.count }

      @recent_activity = ActivityLog.where(subject_type: %w[AgencyTask MarketingItem]).order(created_at: :desc).limit(15)

      @mini_calendar = build_mini_calendar
      @agency_task_categories = AgencyTaskCategory.ordered
      @new_task = AgencyTask.new
    end

    private

    def require_admin!
      return if admin_user?

      redirect_to dashboard_root_path, alert: "You do not have access to that area."
    end

    def build_mini_calendar
      range = Date.current.beginning_of_month..Date.current.end_of_month
      tasks = AgencyTask.where(due_date: range).group(:due_date).count
      items = MarketingItem.where(publish_on: range).group(:publish_on).count

      range.index_with { |date| { tasks: tasks[date].to_i, marketing: items[date].to_i } }
    end
  end
end

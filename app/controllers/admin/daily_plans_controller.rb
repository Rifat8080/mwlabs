module Admin
  class DailyPlansController < BaseController
    before_action :require_admin!
    before_action :set_daily_plan

    def show
    end

    def update
      @daily_plan.update(daily_plan_params)
      redirect_to admin_daily_plan_path(date: @daily_plan.date), notice: "Daily plan saved."
    end

    private

    def require_admin!
      return if admin_user?

      redirect_to dashboard_root_path, alert: "You do not have access to that area."
    end

    def set_daily_plan
      @date = params[:date].present? ? Date.parse(params[:date]) : Date.current
      @daily_plan = DailyPlan.for_date(@date)
      @daily_plan.save! unless @daily_plan.persisted?
    rescue ArgumentError
      @date = Date.current
      @daily_plan = DailyPlan.for_date(@date)
      @daily_plan.save! unless @daily_plan.persisted?
    end

    def daily_plan_params
      params.require(:daily_plan).permit(:focus, :top_priorities, :notes, :wins, :tomorrow_plan)
    end
  end
end

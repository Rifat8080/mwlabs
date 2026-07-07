module Admin
  class ChecklistItemsController < BaseController
    CHECKLISTABLE_TYPES = %w[AgencyTask DailyPlan].freeze

    before_action :require_admin!
    before_action :set_checklistable, only: :create
    before_action :set_checklist_item, only: %i[ update destroy ]

    def create
      @checklistable.checklist_items.create(checklist_item_params)
      respond_to_change(@checklistable)
    end

    def update
      @checklist_item.update(checklist_item_params)
      respond_to_change(@checklist_item.checklistable)
    end

    def destroy
      checklistable = @checklist_item.checklistable
      @checklist_item.destroy
      respond_to_change(checklistable)
    end

    private

    def require_admin!
      return if admin_user?

      redirect_to dashboard_root_path, alert: "You do not have access to that area."
    end

    def set_checklistable
      type = params.dig(:checklist_item, :checklistable_type)
      id = params.dig(:checklist_item, :checklistable_id)
      raise ActionController::RoutingError, "Not Found" unless type.in?(CHECKLISTABLE_TYPES)

      @checklistable = type.constantize.find(id)
    end

    def set_checklist_item
      @checklist_item = ChecklistItem.find(params[:id])
      raise ActionController::RoutingError, "Not Found" unless @checklist_item.checklistable_type.in?(CHECKLISTABLE_TYPES)
    end

    def checklist_item_params
      params.require(:checklist_item).permit(:title, :done, :position, :list_type)
    end

    def respond_to_change(checklistable)
      stream, fallback_path = stream_and_path_for(checklistable)

      respond_to do |format|
        format.turbo_stream { render turbo_stream: stream }
        format.html { redirect_to fallback_path }
      end
    end

    def stream_and_path_for(checklistable)
      case checklistable
      when AgencyTask
        [
          turbo_stream.replace("agency-task-checklist", partial: "admin/agency_tasks/checklist", locals: { agency_task: checklistable.reload }),
          admin_agency_task_path(checklistable)
        ]
      when DailyPlan
        [
          turbo_stream.replace("daily-plan-checklists", partial: "admin/daily_plans/checklists", locals: { daily_plan: checklistable.reload }),
          admin_daily_plan_path
        ]
      end
    end
  end
end

module Admin
  class AgencyTasksController < ResourceController
    VIEWS = %w[kanban table list].freeze

    before_action :set_resource, only: %i[ show edit update destroy move ai_improve ]

    configure(
      model: AgencyTask,
      title: "Tasks",
      description: "Track every piece of agency work — daily tasks, marketing to-dos, recurring work — in one board.",
      columns: %i[ title agency_task_category status priority due_date ],
      fields: [
        { name: :title, type: :text },
        { name: :agency_task_category_id, label: "Category", type: :select, collection: -> { AgencyTaskCategory.ordered.pluck(:name, :id) } },
        { name: :status, type: :select, collection: AgencyTask::STATUSES },
        { name: :priority, type: :select, collection: AgencyTask::PRIORITIES },
        { name: :due_date, type: :date },
        { name: :start_date, type: :date },
        { name: :estimated_minutes, label: "Estimated time (minutes)", type: :number },
        { name: :description, type: :textarea },
        { name: :notes, type: :textarea },
        { name: :tags, type: :text, hint: "Comma-separated, e.g. urgent, client-x" },
        { name: :recurrence_rule, label: "Repeats", type: :select, collection: AgencyTask::RECURRENCE_RULES },
        { name: :recurrence_interval, label: "Repeat every N", type: :number },
        { name: :recurrence_weekdays, label: "Repeat on weekdays", type: :text, hint: "Comma list for weekly, e.g. mon,thu" },
        { name: :attachment, type: :file },
        { name: :checklist_items, type: :checklist_items, permit: { checklist_items_attributes: %i[ id title done position _destroy ] } }
      ],
      includes: %i[ agency_task_category checklist_items ]
    )

    def index
      @view = params[:view].presence_in(VIEWS) || "kanban"
      @agency_task_categories = AgencyTaskCategory.ordered
      @resources = filtered_scope.includes(resource_includes)
      @resources = @view == "kanban" ? @resources.ordered : @resources.ordered.to_a
      @tasks_by_status = AgencyTask::STATUSES.index_with { |status| @resources.select { |task| task.status == status } } if @view == "kanban"
      render "admin/agency_tasks/index"
    end

    def move
      if @resource.update(status: params[:status].presence || @resource.status, position: params[:position] || @resource.position)
        record_activity("Moved")
      end

      respond_to do |format|
        format.turbo_stream do
          @agency_task_categories = AgencyTaskCategory.ordered
          @resources = filtered_scope.includes(resource_includes).ordered
          @tasks_by_status = AgencyTask::STATUSES.index_with { |status| @resources.select { |task| task.status == status } }
          render turbo_stream: turbo_stream.replace("agency-task-board", partial: "admin/agency_tasks/kanban_board", locals: { tasks_by_status: @tasks_by_status })
        end
        format.html { redirect_to admin_agency_tasks_path(view: "kanban") }
      end
    end

    def bulk_update
      tasks = resource_scope.where(id: bulk_task_ids)
      count = tasks.count

      if count.zero?
        redirect_to admin_agency_tasks_path, alert: "Select at least one task first." and return
      end

      case params[:bulk_action]
      when "status"
        if AgencyTask::STATUSES.include?(params[:status])
          tasks.find_each { |task| task.update(status: params[:status]) }
          redirect_to admin_agency_tasks_path, notice: "#{count} #{'task'.pluralize(count)} moved to #{params[:status]}."
        else
          redirect_to admin_agency_tasks_path, alert: "Choose a valid status."
        end
      when "category"
        category = AgencyTaskCategory.find_by(id: params[:agency_task_category_id])
        tasks.find_each { |task| task.update(agency_task_category: category) }
        redirect_to admin_agency_tasks_path, notice: "#{count} #{'task'.pluralize(count)} moved to #{category&.name || 'Uncategorized'}."
      else
        redirect_to admin_agency_tasks_path, alert: "Choose a bulk action."
      end
    end

    def bulk_destroy
      tasks = resource_scope.where(id: bulk_task_ids)
      count = tasks.count

      if count.zero?
        redirect_to admin_agency_tasks_path, alert: "Select at least one task first." and return
      end

      tasks.destroy_all
      redirect_to admin_agency_tasks_path, notice: "#{count} #{'task'.pluralize(count)} deleted."
    end

    def ai_create
      description = params[:description].to_s.strip

      if description.blank?
        redirect_to new_admin_agency_task_path, alert: "Describe the task first." and return
      end

      suggestion = Ai::TaskAssistant.new.create_from_description(description)
      category = AgencyTaskCategory.find_by("LOWER(name) = ?", suggestion[:category].to_s.downcase)

      task = AgencyTask.new(
        title: suggestion[:title],
        description: suggestion[:description],
        agency_task_category: category,
        priority: AgencyTask::PRIORITIES.include?(suggestion[:priority]) ? suggestion[:priority] : "Medium",
        due_date: parse_ai_date(suggestion[:due_date]),
        status: "Todo"
      )
      Array(suggestion[:checklist]).each { |item| task.checklist_items.build(title: item) }
      task.save!

      redirect_to edit_admin_agency_task_path(task), notice: "AI drafted this task from your description. Review and save."
    rescue Ai::GeminiClient::Error, Ai::UsageTracker::RateLimitError => e
      redirect_to new_admin_agency_task_path, alert: "AI couldn't create a task: #{e.message}"
    end

    def ai_improve
      suggestion = Ai::TaskAssistant.new.improve(@resource)

      respond_to do |format|
        format.turbo_stream do
          render turbo_stream: turbo_stream.replace("agency-task-ai-suggestions", partial: "admin/agency_tasks/ai_suggestions", locals: { agency_task: @resource, suggestion: suggestion })
        end
        format.html { redirect_to admin_agency_task_path(@resource) }
      end
    rescue Ai::GeminiClient::Error, Ai::UsageTracker::RateLimitError => e
      respond_to do |format|
        format.turbo_stream { render turbo_stream: turbo_stream.replace("agency-task-ai-suggestions", partial: "admin/agency_tasks/ai_error", locals: { message: e.message }) }
        format.html { redirect_to admin_agency_task_path(@resource), alert: e.message }
      end
    end

    private

    def parse_ai_date(value)
      Date.parse(value.to_s)
    rescue ArgumentError, TypeError
      nil
    end

    def filtered_scope
      scope = resource_scope
      scope = scope.where(status: params[:status]) if params[:status].present?
      scope = scope.where(agency_task_category_id: params[:category]) if params[:category].present?
      scope = scope.where(priority: params[:priority]) if params[:priority].present?
      scope = scope.where("tags ILIKE ?", "%#{params[:tag]}%") if params[:tag].present?
      scope = scope.where("title ILIKE ? OR description ILIKE ?", "%#{params[:q]}%", "%#{params[:q]}%") if params[:q].present?
      scope
    end

    def bulk_task_ids
      Array(params[:agency_task_ids]).reject(&:blank?)
    end
  end
end

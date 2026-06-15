module Admin
  class ProjectTasksController < BaseController
    before_action :set_project
    before_action :authorize_project_task_management!
    before_action :set_task, only: %i[ update destroy ]

    def create
      task = @project.tasks.new(task_params)
      authorize! :manage, task

      if task.save
        respond_to_task_change("Task added to #{@project.display_name}.")
      else
        respond_to_task_error(task.errors.full_messages.to_sentence)
      end
    end

    def update
      authorize! :manage, @task

      if @task.update(task_params)
        respond_to_task_change("Task updated.")
      else
        respond_to_task_error(@task.errors.full_messages.to_sentence)
      end
    end

    def destroy
      authorize! :manage, @task
      @task.destroy
      respond_to_task_change("Task removed from #{@project.display_name}.")
    end

    private

    def set_project
      @project = project_scope.find(params[:project_id])
    end

    def set_task
      @task = @project.tasks.find(params[:id])
    end

    def project_scope
      current_ability.resource_scope(Project)
    end

    def authorize_project_task_management!
      return if can_manage_resource?(Task) && can?(:manage, @project)

      redirect_to admin_project_path(@project), alert: "You can view project tasks, but you cannot make changes."
    end

    def task_params
      params.require(:task).permit(:assigned_to_id, :title, :due_date, :priority, :status, :description, :checklist, :client_visible)
    end

    def respond_to_task_change(message)
      respond_to do |format|
        format.turbo_stream do
          flash.now[:notice] = message
          render turbo_stream: task_board_streams
        end
        format.html { redirect_to admin_project_path(@project, anchor: "project-tasks"), notice: message }
      end
    end

    def respond_to_task_error(message)
      respond_to do |format|
        format.turbo_stream do
          flash.now[:alert] = message
          render turbo_stream: task_board_streams, status: :unprocessable_entity
        end
        format.html { redirect_to admin_project_path(@project, anchor: "project-tasks"), alert: message }
      end
    end

    def task_board_streams
      [
        turbo_stream.update("flash", partial: "shared/flash"),
        turbo_stream.replace("project-tasks", partial: "admin/projects/tasks", locals: { project: @project.reload })
      ]
    end
  end
end

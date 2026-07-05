module Admin
  class LeadsController < ResourceController
    configure(
      model: Lead,
      title: "Leads",
      description: "Track prospects from first contact through quote and conversion.",
      columns: %i[ display_name source service_interest status follow_up_date assigned_to ],
      fields: [
        { name: :name, type: :text },
        { name: :phone, type: :text },
        { name: :email, type: :email },
        { name: :company_name, type: :text },
        { name: :country, type: :text },
        { name: :source, type: :select, collection: Lead::SOURCES },
        { name: :service_interest, type: :text },
        { name: :budget, type: :decimal },
        { name: :urgency, type: :select, collection: Lead::URGENCIES },
        { name: :message, type: :textarea },
        { name: :status, type: :select, collection: Lead::STATUSES },
        { name: :assigned_to_id, label: "Assigned person", type: :select, collection: -> { User.order(:email).map { |user| [ user.display_name, user.id ] } } },
        { name: :client_id, label: "Linked client", type: :select, collection: -> { Client.order(:name).map { |client| [ client.display_name, client.id ] } } },
        { name: :follow_up_date, type: :date },
        { name: :notes, type: :textarea }
      ],
      includes: %i[ assigned_to client ]
    )

    def index
      @resources = resource_scope.includes(resource_includes).order(created_at: :desc)
      @lead_stats = {
        total: @resources.size,
        new_this_month: @resources.count { |lead| lead.created_at >= Time.current.beginning_of_month },
        follow_ups_due: @resources.count { |lead| lead.follow_up_date.present? && lead.follow_up_date <= Date.current },
        won: @resources.count { |lead| lead.status == "Won" }
      }
      render "admin/leads/index"
    end

    def show
      @activity_logs = client_user? ? [] : @resource.activity_logs.order(created_at: :desc).limit(20)
      render "admin/leads/show"
    end

    def bulk_update
      leads = resource_scope.where(id: bulk_lead_ids)
      count = leads.count

      if count.zero?
        redirect_to admin_leads_path, alert: "Select at least one lead first." and return
      end

      case params[:bulk_action]
      when "assign"
        assignee = User.find_by(id: params[:assigned_to_id])
        leads.find_each { |lead| lead.update(assigned_to: assignee) }
        redirect_to admin_leads_path, notice: "#{count} #{'lead'.pluralize(count)} assigned to #{assignee&.display_name || 'Unassigned'}."
      when "status"
        if Lead::STATUSES.include?(params[:status])
          leads.find_each { |lead| lead.update(status: params[:status]) }
          redirect_to admin_leads_path, notice: "#{count} #{'lead'.pluralize(count)} moved to #{params[:status]}."
        else
          redirect_to admin_leads_path, alert: "Choose a valid status."
        end
      else
        redirect_to admin_leads_path, alert: "Choose a bulk action."
      end
    end

    def bulk_destroy
      leads = resource_scope.where(id: bulk_lead_ids)
      count = leads.count

      if count.zero?
        redirect_to admin_leads_path, alert: "Select at least one lead first." and return
      end

      leads.destroy_all
      redirect_to admin_leads_path, notice: "#{count} #{'lead'.pluralize(count)} deleted."
    end

    def import
      @import_result = nil
      render "admin/leads/import"
    end

    def process_import
      @import_result = Leads::CsvImporter.new(file: params[:file], importer: current_user).call

      if @import_result.success? && @import_result.failed_count.zero?
        redirect_to admin_leads_path, notice: @import_result.summary_message
      else
        flash.now[:alert] = @import_result.fatal_error if @import_result.fatal_error.present?
        flash.now[:notice] = @import_result.summary_message unless @import_result.fatal_error.present?
        render "admin/leads/import", status: :unprocessable_entity
      end
    end

    def update
      @resource = resource_scope.find(params[:id])
      authorize! :manage, @resource

      if params.dig(:lead, :client_answers).present? || params.dig(:lead, :caller_notes).present? || params.dig(:lead, :question_answers).present?
        safe_question_answers = params.require(:lead).permit(question_answers: {}).dig(:question_answers) || {}

        @resource.append_cold_call_feedback!(
          client_answers: params.dig(:lead, :client_answers),
          caller_notes: params.dig(:lead, :caller_notes),
          question_answers: safe_question_answers
        )

        respond_to do |format|
          format.html { redirect_to polymorphic_path([ :admin, @resource ]), notice: "Call notes saved." }
          format.turbo_stream do
            render turbo_stream: turbo_stream.replace("lead-show-details", partial: "admin/leads/show_details", locals: { lead: @resource.reload, resource_fields: visible_resource_fields })
          end
          format.any { render partial: "admin/leads/cold_calling_panel", locals: { lead: @resource.reload } }
        end
      elsif @resource.update(resource_params)
        respond_to do |format|
          format.html { redirect_to polymorphic_path([ :admin, @resource ]), notice: "Lead updated." }
          format.turbo_stream do
            render turbo_stream: turbo_stream.replace("lead-show-details", partial: "admin/leads/show_details", locals: { lead: @resource.reload, resource_fields: visible_resource_fields })
          end
          format.any { render partial: "admin/leads/show_details", locals: { lead: @resource.reload, resource_fields: visible_resource_fields } }
        end
      else
        respond_to do |format|
          format.html { render "admin/leads/show", status: :unprocessable_entity }
          format.turbo_stream do
            render turbo_stream: turbo_stream.replace("lead-show-details", partial: "admin/leads/show_details", locals: { lead: @resource, resource_fields: visible_resource_fields }), status: :unprocessable_entity
          end
          format.any { render plain: "Unable to save lead", status: :unprocessable_entity }
        end
      end
    end

    def visible_resource_columns
      super.reject { |column| column == :source }
    end

    private

    def bulk_lead_ids
      Array(params[:lead_ids]).reject(&:blank?)
    end

    def resource_params
      if Lead.custom_fields_supported?
        params.require(:lead).permit(*permitted_fields, :client_answers, :caller_notes, question_answers: {}, custom_fields: [ :label, :value ])
      else
        params.require(:lead).permit(*permitted_fields, :client_answers, :caller_notes, question_answers: {})
      end
    end
  end
end

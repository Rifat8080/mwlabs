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
          format.html { render "admin/resources/show", status: :unprocessable_entity }
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

    def resource_params
      if Lead.custom_fields_supported?
        params.require(:lead).permit(*permitted_fields, :client_answers, :caller_notes, question_answers: {}, custom_fields: [ :label, :value ])
      else
        params.require(:lead).permit(*permitted_fields, :client_answers, :caller_notes, question_answers: {})
      end
    end
  end
end

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

    private

    def resource_params
      params.require(:lead).permit(*permitted_fields, custom_fields: [ :label, :value ])
    end
  end
end

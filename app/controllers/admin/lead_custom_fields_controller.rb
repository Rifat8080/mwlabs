module Admin
  class LeadCustomFieldsController < BaseController
    before_action :set_lead
    before_action :authorize_lead_management!

    def create
      if @lead.add_custom_field!(label: custom_field_params[:label], value: custom_field_params[:value])
        respond_to_change("Custom field added.")
      else
        respond_to_error("Add a label or value for the custom field.")
      end
    end

    def destroy
      if @lead.remove_custom_field_at!(params[:index].to_i)
        respond_to_change("Custom field removed.")
      else
        respond_to_error("Could not remove that custom field.")
      end
    end

    private

    def set_lead
      @lead = current_ability.resource_scope(Lead).find(params[:lead_id])
      authorize! :manage, @lead
    end

    def authorize_lead_management!
      return if can_manage_resource?(Lead)

      redirect_to admin_lead_path(@lead), alert: "You cannot change custom fields for this lead."
    end

    def custom_field_params
      params.permit(:label, :value)
    end

    def respond_to_change(message)
      respond_to do |format|
        format.turbo_stream do
          flash.now[:notice] = message
          render turbo_stream: custom_field_streams
        end
        format.html { redirect_to admin_lead_path(@lead), notice: message }
      end
    end

    def respond_to_error(message)
      respond_to do |format|
        format.turbo_stream do
          flash.now[:alert] = message
          render turbo_stream: custom_field_streams, status: :unprocessable_entity
        end
        format.html { redirect_to admin_lead_path(@lead), alert: message }
      end
    end

    def custom_field_streams
      [
        turbo_stream.update("flash", partial: "shared/flash"),
        turbo_stream.replace("lead-custom-fields", partial: "admin/leads/custom_fields_panel", locals: { lead: @lead.reload })
      ]
    end
  end
end

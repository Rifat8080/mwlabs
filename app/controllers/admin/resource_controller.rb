module Admin
  class ResourceController < BaseController
    class_attribute :resource_model, :resource_title, :resource_description,
      :resource_columns, :resource_fields, :resource_includes

    before_action :set_resource, only: %i[ show edit update destroy ]

    helper_method :resource_model, :resource_title, :resource_description,
      :resource_columns, :resource_fields, :field_options, :field_value

    def self.configure(model:, title:, description:, columns:, fields:, includes: [])
      self.resource_model = model
      self.resource_title = title
      self.resource_description = description
      self.resource_columns = columns
      self.resource_fields = fields
      self.resource_includes = includes
    end

    def index
      @resources = resource_model.includes(resource_includes).order(created_at: :desc)
      render "admin/resources/index"
    end

    def show
      @activity_logs = @resource.try(:activity_logs)&.order(created_at: :desc)&.limit(20)
      render "admin/resources/show"
    end

    def new
      @resource = resource_model.new
      prepare_resource
      render "admin/resources/new"
    end

    def create
      @resource = resource_model.new(resource_params)

      if @resource.save
        record_activity("Created")
        redirect_to polymorphic_path([ :admin, @resource ]), notice: "#{resource_title.singularize} created."
      else
        prepare_resource
        render "admin/resources/new", status: :unprocessable_entity
      end
    end

    def edit
      prepare_resource
      render "admin/resources/edit"
    end

    def update
      if @resource.update(resource_params)
        record_activity("Updated")
        redirect_to polymorphic_path([ :admin, @resource ]), notice: "#{resource_title.singularize} updated."
      else
        prepare_resource
        render "admin/resources/edit", status: :unprocessable_entity
      end
    end

    def destroy
      @resource.destroy
      redirect_to polymorphic_path([ :admin, resource_model ]), notice: "#{resource_title.singularize} deleted."
    end

    private

    def set_resource
      @resource = resource_model.find(params[:id])
    end

    def prepare_resource
    end

    def resource_params
      params.require(resource_model.model_name.param_key).permit(*permitted_fields)
    end

    def permitted_fields
      resource_fields.filter_map { |field| field[:permit] || field[:name] }
    end

    def field_options(field)
      collection = field[:collection]
      collection.respond_to?(:call) ? instance_exec(&collection) : collection
    end

    def field_value(resource, field)
      name = field[:name]
      return resource.public_send(name).attached? ? resource.public_send(name).filename.to_s : "No file" if field[:type] == :file
      if name.to_s.end_with?("_id")
        association_name = name.to_s.delete_suffix("_id")
        return resource.public_send(association_name) if resource.respond_to?(association_name)
      end

      value = resource.public_send(name)
      return value.display_name if value.respond_to?(:display_name)

      value
    end

    def record_activity(action)
      return unless @resource.respond_to?(:activity_logs)

      ActivityLog.record!(subject: @resource, user: current_user, action: action)
    end
  end
end

module Admin
  class FileUploadsController < ResourceController
    skip_before_action :set_resource
    before_action :set_resource, only: %i[ show edit update destroy download ]
    skip_before_action :authorize_resource_management!, only: :download

    configure(
      model: FileUpload,
      title: "Files",
      description: "Store project assets, invoices, contracts, design files, and final delivery files.",
      columns: %i[ display_name category visibility status project task client ],
      fields: [
        { name: :client_id, label: "Client", type: :select, collection: -> { Client.order(:name).map { |client| [ client.display_name, client.id ] } } },
        { name: :project_id, label: "Project", type: :select, collection: -> { Project.order(:name).map { |project| [ project.display_name, project.id ] } } },
        { name: :task_id, label: "Task", type: :select, collection: -> { Task.includes(:project).order(:title).map { |task| [ "#{task.project.display_name} - #{task.display_name}", task.id ] } } },
        { name: :category, type: :select, collection: FileUpload::CATEGORIES },
        { name: :visibility, type: :select, collection: FileUpload::VISIBILITIES },
        { name: :downloadable, type: :checkbox },
        { name: :needs_approval, type: :checkbox },
        { name: :status, type: :select, collection: FileUpload::STATUSES },
        { name: :file, type: :file },
        { name: :note, type: :textarea }
      ],
      includes: %i[ client project task ]
    )

    def download
      if @resource.file.blank? || !@resource.file.attached?
        redirect_to admin_file_upload_path(@resource), alert: "No file is attached to this record."
      elsif client_user? && !@resource.downloadable?
        redirect_to admin_file_upload_path(@resource), alert: "This file is view-only and cannot be downloaded."
      else
        redirect_to rails_blob_path(@resource.file, disposition: "attachment"), allow_other_host: true
      end
    end

    private

    def prepare_resource
      return unless @resource.new_record?

      @resource.project_id = params[:project_id] if params[:project_id].present?
      @resource.task_id = params[:task_id] if params[:task_id].present?
      @resource.client_id = @resource.project&.client_id if @resource.project.present?
    end
  end
end

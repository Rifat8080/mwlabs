module Admin
  class FileUploadsController < ResourceController
    configure(
      model: FileUpload,
      title: "Files",
      description: "Store project assets, invoices, contracts, design files, and final delivery files.",
      columns: %i[ display_name category visibility status project client ],
      fields: [
        { name: :client_id, label: "Client", type: :select, collection: -> { Client.order(:name).map { |client| [ client.display_name, client.id ] } } },
        { name: :project_id, label: "Project", type: :select, collection: -> { Project.order(:name).map { |project| [ project.display_name, project.id ] } } },
        { name: :task_id, label: "Task", type: :select, collection: -> { Task.order(:title).map { |task| [ task.display_name, task.id ] } } },
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
  end
end

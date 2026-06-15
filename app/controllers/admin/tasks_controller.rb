module Admin
  class TasksController < ResourceController
    configure(
      model: Task,
      title: "Tasks",
      description: "Assign delivery work, track due dates, and separate internal/client-visible tasks.",
      columns: %i[ title project assigned_to due_date priority status ],
      fields: [
        { name: :project_id, label: "Project", type: :select, collection: -> { Project.order(:name).map { |project| [ project.display_name, project.id ] } } },
        { name: :assigned_to_id, label: "Assigned person", type: :select, collection: -> { User.order(:email).map { |user| [ user.display_name, user.id ] } } },
        { name: :title, type: :text },
        { name: :due_date, type: :date },
        { name: :priority, type: :select, collection: Task::PRIORITIES },
        { name: :status, type: :select, collection: Task::STATUSES },
        { name: :description, type: :textarea },
        { name: :checklist, type: :textarea },
        { name: :client_visible, type: :checkbox },
        { name: :attachment, type: :file }
      ],
      includes: %i[ project assigned_to ]
    )
  end
end

module Admin
  class ProjectsController < ResourceController
    configure(
      model: Project,
      title: "Projects",
      description: "Manage delivery status, deadlines, assignments, and project profitability.",
      columns: %i[ name client status priority deadline progress ],
      fields: [
        { name: :client_id, label: "Client", type: :select, collection: -> { Client.order(:name).map { |client| [ client.display_name, client.id ] } } },
        { name: :quote_id, label: "Quote", type: :select, collection: -> { Quote.order(created_at: :desc).map { |quote| [ quote.display_name, quote.id ] } } },
        { name: :name, type: :text },
        { name: :service_category, type: :select, collection: Service::CATEGORIES },
        { name: :project_value, type: :decimal },
        { name: :start_date, type: :date },
        { name: :deadline, type: :date },
        { name: :status, type: :select, collection: Project::STATUSES },
        { name: :priority, type: :select, collection: Project::PRIORITIES },
        { name: :assigned_to_id, label: "Assigned person", type: :select, collection: -> { User.order(:email).map { |user| [ user.display_name, user.id ] } } },
        { name: :progress, type: :number },
        { name: :internal_notes, type: :textarea },
        { name: :client_notes, type: :textarea }
      ],
      includes: %i[ client quote assigned_to ]
    )
  end
end

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
  end
end

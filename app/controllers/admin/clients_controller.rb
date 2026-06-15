module Admin
  class ClientsController < ResourceController
    configure(
      model: Client,
      title: "Clients",
      description: "Manage active, past, and prospect client records.",
      columns: %i[ display_name email phone status follow_up_date ],
      fields: [
        { name: :name, type: :text },
        { name: :company_name, type: :text },
        { name: :email, type: :email },
        { name: :phone, type: :text },
        { name: :country, type: :text },
        { name: :status, type: :select, collection: Client::STATUSES },
        { name: :source, type: :text },
        { name: :follow_up_date, type: :date },
        { name: :next_action, type: :text },
        { name: :notes, type: :textarea }
      ]
    )
  end
end

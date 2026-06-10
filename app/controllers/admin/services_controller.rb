module Admin
  class ServicesController < ResourceController
    configure(
      model: Service,
      title: "Services",
      description: "Catalog agency services with pricing and default delivery checklists.",
      columns: %i[ name category base_price estimated_delivery_time status ],
      fields: [
        { name: :name, type: :text },
        { name: :category, type: :select, collection: Service::CATEGORIES },
        { name: :description, type: :textarea },
        { name: :base_price, type: :decimal },
        { name: :estimated_delivery_time, type: :text },
        { name: :required_inputs, type: :textarea },
        { name: :default_task_checklist, label: "Default task checklist", type: :textarea, hint: "One task per line. These become project tasks when a quote is accepted." },
        { name: :status, type: :select, collection: Service::STATUSES }
      ]
    )
  end
end

module Admin
  class InvoicesController < ResourceController
    configure(
      model: Invoice,
      title: "Invoices",
      description: "Track sent, unpaid, overdue, and paid invoices.",
      columns: %i[ invoice_number client project due_date total paid_amount status ],
      fields: [
        { name: :client_id, label: "Client", type: :select, collection: -> { Client.order(:name).map { |client| [ client.display_name, client.id ] } } },
        { name: :project_id, label: "Project", type: :select, collection: -> { Project.order(:name).map { |project| [ project.display_name, project.id ] } } },
        { name: :quote_id, label: "Quote", type: :select, collection: -> { Quote.order(created_at: :desc).map { |quote| [ quote.display_name, quote.id ] } } },
        { name: :invoice_number, type: :text },
        { name: :issue_date, type: :date },
        { name: :due_date, type: :date },
        { name: :subtotal, type: :decimal },
        { name: :discount, type: :decimal },
        { name: :tax, type: :decimal },
        { name: :paid_amount, type: :decimal },
        { name: :status, type: :select, collection: Invoice::STATUSES },
        { name: :notes, type: :textarea }
      ],
      includes: %i[ client project quote ]
    )
  end
end

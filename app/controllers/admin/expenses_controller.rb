module Admin
  class ExpensesController < ResourceController
    configure(
      model: Expense,
      title: "Expenses",
      description: "Capture operating and project expenses for profit/loss reporting.",
      columns: %i[ date category amount payment_method project client ],
      fields: [
        { name: :date, type: :date },
        { name: :category, type: :select, collection: Expense::CATEGORIES },
        { name: :amount, type: :decimal },
        { name: :payment_method, type: :select, collection: Expense::METHODS },
        { name: :project_id, label: "Project", type: :select, collection: -> { Project.order(:name).map { |project| [ project.display_name, project.id ] } } },
        { name: :client_id, label: "Client", type: :select, collection: -> { Client.order(:name).map { |client| [ client.display_name, client.id ] } } },
        { name: :receipt, type: :file },
        { name: :note, type: :textarea }
      ],
      includes: %i[ project client ]
    )
  end
end

module Admin
  class PaymentsController < ResourceController
    configure(
      model: Payment,
      title: "Payments",
      description: "Record manual payments from bank transfer, cash, mobile wallet, or international gateways.",
      columns: %i[ invoice amount payment_method transaction_reference payment_date ],
      fields: [
        { name: :invoice_id, label: "Invoice", type: :select, collection: -> { Invoice.order(created_at: :desc).map { |invoice| [ "#{invoice.invoice_number} - #{invoice.client.display_name}", invoice.id ] } } },
        { name: :amount, type: :decimal },
        { name: :payment_method, type: :select, collection: Payment::METHODS },
        { name: :transaction_reference, type: :text },
        { name: :payment_date, type: :date },
        { name: :note, type: :textarea }
      ],
      includes: { invoice: :client }
    )
  end
end

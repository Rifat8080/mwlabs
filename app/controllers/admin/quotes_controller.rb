module Admin
  class QuotesController < ResourceController
    configure(
      model: Quote,
      title: "Quotes",
      description: "Build proposals, track quote status, and convert accepted quotes into delivery work.",
      columns: %i[ display_name client lead status total_amount validity_date ],
      fields: [
        { name: :client_id, label: "Client", type: :select, collection: -> { Client.order(:name).map { |client| [ client.display_name, client.id ] } } },
        { name: :lead_id, label: "Lead", type: :select, collection: -> { Lead.order(:name).map { |lead| [ lead.display_name, lead.id ] } } },
        { name: :status, type: :select, collection: Quote::STATUSES },
        { name: :discount, type: :decimal },
        { name: :tax, type: :decimal },
        { name: :payment_terms, type: :textarea },
        { name: :delivery_timeline, type: :text },
        { name: :validity_date, type: :date },
        { name: :notes, type: :textarea },
        { name: :quote_items, label: "Quote line items", type: :quote_items, permit: { quote_items_attributes: %i[ id item_type name description quantity unit_price _destroy ] } }
      ],
      includes: %i[ client lead ]
    )

    def accept
      @resource = Quote.find(params[:id])
      @resource.accept!(user: current_user)
      redirect_to admin_quote_path(@resource), notice: "Quote accepted. Client, project, tasks, and draft invoice are ready."
    rescue ActiveRecord::RecordInvalid => error
      redirect_to admin_quote_path(@resource), alert: error.record.errors.full_messages.to_sentence
    end

    def update
      @resource = Quote.find(params[:id])
      accepting_quote = resource_params[:status] == "Accepted" && @resource.accepted_at.blank?

      if @resource.update(resource_params)
        accepting_quote ? @resource.accept!(user: current_user) : record_activity("Updated")
        redirect_to admin_quote_path(@resource), notice: accepting_quote ? "Quote accepted. Workflow automation created the project, tasks, and draft invoice." : "Quote updated."
      else
        prepare_resource
        render "admin/resources/edit", status: :unprocessable_entity
      end
    rescue ActiveRecord::RecordInvalid => error
      prepare_resource
      @resource.errors.add(:base, error.record.errors.full_messages.to_sentence)
      render "admin/resources/edit", status: :unprocessable_entity
    end

    private

    def prepare_resource
      (3 - @resource.quote_items.size).times { @resource.quote_items.build(item_type: "Service") }
    end
  end
end

module Admin
  class QuotesController < ResourceController
    skip_before_action :authorize_resource_management!, only: %i[ accept reject send_quote pdf ]

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
      includes: %i[ client lead sent_by quote_items ]
    )

    def show
      @resource = resource_scope.find(params[:id])
      @resource.normalize_decision_state!
      @activity_logs = client_user? ? [] : @resource.try(:activity_logs)&.order(created_at: :desc)&.limit(20)
      prepare_quote_portal
      render "admin/resources/show"
    end

    def send_quote
      authorize_resource_management!
      @resource = resource_scope.find(params[:id])
      authorize! :manage, @resource

      if @resource.quote_items.empty?
        redirect_to admin_quote_path(@resource), alert: "Add at least one line item before sending the quote."
        return
      end

      @resource.send_to_recipient!(user: current_user)
      redirect_to admin_quote_path(@resource), notice: "Quote sent to #{@resource.recipient_name} and published in the portal."
    rescue ActiveRecord::RecordInvalid => error
      redirect_to admin_quote_path(@resource), alert: error.record.errors.full_messages.to_sentence
    end

    def pdf
      @resource = resource_scope.find(params[:id])
      authorize! :read, @resource
      pdf_data = ::Quotes::PdfRenderer.new(@resource).render

      send_data pdf_data,
        filename: "mwlabs-quote-#{@resource.quote_reference}.pdf",
        type: "application/pdf",
        disposition: "attachment"
    end

    def accept
      @resource = resource_scope.find(params[:id])
      authorize! :read, @resource
      unless can_decide_quote?(@resource)
        redirect_to admin_quote_path(@resource), alert: "You cannot accept this quote."
        return
      end

      @resource.accept!(user: current_user)
      redirect_to admin_quote_path(@resource), notice: "Quote accepted. Client, project, tasks, and draft invoice are ready."
    rescue ActiveRecord::RecordInvalid => error
      redirect_to admin_quote_path(@resource), alert: error.record.errors.full_messages.to_sentence
    end

    def reject
      @resource = resource_scope.find(params[:id])
      authorize! :read, @resource
      unless can_decide_quote?(@resource)
        redirect_to admin_quote_path(@resource), alert: "You cannot reject this quote."
        return
      end

      @resource.reject!(user: current_user, message: params[:rejection_reason])
      redirect_to admin_quote_path(@resource), notice: "Quote marked as rejected."
    rescue ActiveRecord::RecordInvalid => error
      redirect_to admin_quote_path(@resource), alert: error.record.errors.full_messages.to_sentence
    end

    def update
      @resource = resource_scope.find(params[:id])
      accepting_quote = resource_params[:status] == "Accepted" && @resource.accepted_at.blank?

      if accepting_quote && @resource.acceptance_blocked_by_negotiation?
        prepare_resource
        @resource.errors.add(:base, "Resolve the open quote negotiation before accepting this quote.")
        render "admin/resources/edit", status: :unprocessable_entity
        return
      end

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

    def prepare_quote_portal
      return unless @resource.is_a?(Quote)

      @resource.mark_viewed!(user: current_user) if client_user? && @resource.status == "Sent"
      @quote_messages = visible_quote_messages
    end

    def visible_quote_messages
      messages = @resource.quote_messages.chronological.includes(:user)
      client_user? ? messages.visible_to_client : messages
    end

    def prepare_resource
      (3 - @resource.quote_items.size).times { @resource.quote_items.build(item_type: "Service") }
    end
  end
end

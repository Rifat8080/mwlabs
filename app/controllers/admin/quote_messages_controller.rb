module Admin
  class QuoteMessagesController < BaseController
    before_action :set_quote
    before_action :authorize_negotiation!

    def create
      message = composed_message
      if message.blank?
        redirect_to admin_quote_path(@quote), alert: "Please enter a message."
        return
      end

      kind = message_kind
      internal = internal_message?(kind)

      @quote.request_revision!(user: current_user, message: message, kind: kind, internal: internal)
      @quote.resolve_negotiation!(user: current_user) if resolves_negotiation?(kind, internal)
      redirect_to admin_quote_path(@quote), notice: notice_for(kind)
    rescue ActiveRecord::RecordInvalid => error
      redirect_to admin_quote_path(@quote), alert: error.record.errors.full_messages.to_sentence
    end

    private

    def set_quote
      @quote = quote_scope.find(params[:quote_id])
    end

    def authorize_negotiation!
      authorize! :read, @quote
      return if can_negotiate_quote?(@quote)

      redirect_to admin_quote_path(@quote), alert: "This quote is not open for negotiation."
    end

    def quote_scope
      current_ability.resource_scope(Quote)
    end

    def message_kind
      if client_user?
        "change_request"
      elsif staff_internal_note?
        "message"
      else
        "staff_reply"
      end
    end

    def composed_message
      base_message = quote_message_params[:message].to_s.strip
      details = structured_details
      return base_message if details.empty?

      ([ details.join("\n"), base_message.presence ].compact).join("\n\n")
    end

    def structured_details
      if client_user?
        client_request_details
      elsif admin_user? || team_member?
        staff_response_details
      else
        []
      end
    end

    def client_request_details
      [
        labeled_detail("Request type", quote_message_params[:request_type]),
        labeled_detail("Priority", quote_message_params[:priority]),
        labeled_detail("Target budget", quote_message_params[:target_budget]),
        labeled_detail("Ideal timeline", quote_message_params[:target_timeline])
      ].compact
    end

    def staff_response_details
      [
        labeled_detail("Response type", quote_message_params[:response_type]),
        labeled_detail("Next step", quote_message_params[:next_step])
      ].compact
    end

    def labeled_detail(label, value)
      value = value.to_s.strip
      return if value.blank?

      "#{label}: #{value.tr('_', ' ').capitalize}"
    end

    def staff_internal_note?
      (admin_user? || team_member?) && quote_message_params[:response_type] == "internal_note"
    end

    def internal_message?(kind)
      return false if client_user?

      staff_internal_note? || kind == "message" || quote_message_params[:internal] == "1"
    end

    def resolves_negotiation?(kind, internal)
      (admin_user? || team_member?) &&
        kind == "staff_reply" &&
        !internal &&
        quote_message_params[:next_step] == "ready_for_acceptance"
    end

    def notice_for(kind)
      case kind
      when "change_request" then "Your change request was sent to the M&W Labs team."
      when "staff_reply" then "Your reply was posted to the negotiation thread."
      else "Message posted."
      end
    end

    def quote_message_params
      params.require(:quote_message).permit(:message, :internal, :request_type, :priority, :target_budget, :target_timeline, :response_type, :next_step)
    end
  end
end

module AiReceptionist
  class MessagesController < ApplicationController
    def create
      message = params[:message].to_s.squish
      return render json: { error: "Message cannot be blank" }, status: :unprocessable_entity if message.blank?

      result = ConversationHandler.call(
        message: message,
        channel: "website",
        visitor_token: visitor_token,
        metadata: request_metadata
      )

      cookies.permanent.signed[:ai_receptionist_visitor_token] = {
        value: result.conversation.visitor_token,
        httponly: true,
        same_site: :lax
      }

      render json: {
        reply: result.reply,
        visitor_token: result.conversation.visitor_token,
        conversation_id: result.conversation.id,
        lead_id: result.lead&.id,
        fallback: result.fallback?,
        started_new: result.started_new?
      }
    rescue ArgumentError
      render json: { error: "Message cannot be blank" }, status: :unprocessable_entity
    end

    private

    def visitor_token
      params[:visitor_token].presence || cookies.signed[:ai_receptionist_visitor_token].presence || SecureRandom.uuid
    end

    def request_metadata
      {
        source: "website_widget",
        ip: request.remote_ip,
        user_agent: request.user_agent
      }.compact
    end
  end
end

module AiReceptionist
  class ConversationHandler
    Result = Struct.new(
      :conversation,
      :visitor_message,
      :assistant_message,
      :reply,
      :lead,
      :fallback,
      :started_new,
      keyword_init: true
    ) do
      def fallback?
        fallback
      end

      def started_new?
        started_new == true
      end
    end

    def self.call(...)
      new(...).call
    end

    def initialize(
      message:,
      channel: "website",
      visitor_token: nil,
      external_id: nil,
      metadata: {},
      model_client: LocalModelClient.new
    )
      @message = message.to_s.squish
      @channel = channel
      @visitor_token = visitor_token.presence || SecureRandom.uuid
      @external_id = external_id.presence
      @metadata = metadata
      @model_client = model_client
    end

    def call
      raise ArgumentError, "Message cannot be blank" if message.blank?

      conversation = find_or_create_conversation
      started_new = false
      if restart_requested_for?(conversation)
        conversation = start_new_conversation_from(conversation)
        started_new = true
      end

      complete_before_message = conversation.missing_lead_fields.none?
      visitor_message = conversation.ai_receptionist_messages.create!(
        role: "visitor",
        content: message,
        metadata: metadata
      )

      updates = LeadExtractor.new(conversation: conversation, message: message).call
      conversation_attributes = conversation_updates(conversation, updates)
      conversation.update!(conversation_attributes) if conversation_attributes.any?
      append_extra_detail(conversation) if complete_before_message && extra_detail_message?

      lead = LeadSync.new(conversation: conversation, latest_message: message, updates: updates).call
      response = Responder.new(conversation: conversation.reload, model_client: model_client).call
      assistant_message = conversation.ai_receptionist_messages.create!(
        role: "assistant",
        content: response.content,
        llm_model: response.llm_model,
        metadata: { fallback: response.fallback? }
      )

      Result.new(
        conversation: conversation,
        visitor_message: visitor_message,
        assistant_message: assistant_message,
        reply: response.content,
        lead: lead || conversation.lead,
        fallback: response.fallback?,
        started_new: started_new
      )
    end

    private

    attr_reader :message, :channel, :visitor_token, :external_id, :metadata, :model_client

    def find_or_create_conversation
      scope = AiReceptionistConversation.where(channel: channel)
      conversation = if external_id.present?
        scope.find_or_initialize_by(external_id: external_id)
      else
        AiReceptionistConversation.find_or_initialize_by(visitor_token: visitor_token)
      end

      conversation.assign_attributes(channel: channel, visitor_token: conversation.visitor_token.presence || visitor_token)
      conversation.metadata = conversation.metadata.merge(conversation_metadata)
      conversation.save!
      conversation
    end

    def conversation_updates(conversation, updates)
      updates.slice(:name, :email, :phone, :country, :company_name, :service_interest, :budget, :urgency).filter_map do |key, value|
        next if value.blank?
        next if conversation.public_send(key).present?

        [ key, value ]
      end.to_h
    end

    def restart_requested_for?(conversation)
      ConversationIntent.restart?(message) && conversation.persisted? && conversation.captured_details.present?
    end

    def start_new_conversation_from(conversation)
      if external_id.present?
        conversation.update!(reset_attributes)
        return conversation
      end

      conversation.update!(status: "closed")
      AiReceptionistConversation.create!(
        channel: channel,
        visitor_token: SecureRandom.uuid,
        metadata: conversation.metadata.merge(conversation_metadata)
      )
    end

    def reset_attributes
      {
        lead: nil,
        status: "open",
        name: nil,
        email: nil,
        phone: nil,
        country: nil,
        company_name: nil,
        service_interest: nil,
        budget: nil,
        urgency: nil,
        summary: nil,
        metadata: conversation_metadata
      }
    end

    def append_extra_detail(conversation)
      detail = message.truncate(300)
      summary = [ conversation.summary, detail ].compact_blank.join("\n")
      conversation.update!(summary: summary)
    end

    def extra_detail_message?
      ConversationIntent.detail?(message)
    end

    def conversation_metadata
      metadata.slice(:source, :user_agent, :ip).compact
    end
  end
end

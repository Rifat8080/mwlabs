module AiReceptionist
  class LeadSync
    def initialize(conversation:, latest_message:, updates:)
      @conversation = conversation
      @latest_message = latest_message.to_s.squish
      @updates = updates
    end

    def call
      return conversation.lead if skip_control_message?
      return unless should_sync_lead?

      lead = conversation.lead || lead_for_email || Lead.new
      was_new_record = lead.new_record?

      lead.assign_attributes(attributes_for(lead))
      lead.save!

      conversation.update!(lead: lead, status: "qualified") if conversation.lead_id != lead.id
      record_activity(lead, was_new_record)
      lead
    end

    private

    attr_reader :conversation, :latest_message, :updates

    def should_sync_lead?
      contact_detail_present? || project_signal_present?
    end

    def skip_control_message?
      updates.blank? && conversation.lead.present? && ConversationIntent.control?(latest_message)
    end

    def contact_detail_present?
      updates[:email].present? || updates[:phone].present? || conversation.email.present? || conversation.phone.present?
    end

    def project_signal_present?
      updates[:service_interest].present? ||
        conversation.service_interest.present? ||
        latest_message.match?(/\b(project|quote|build|website|marketing|automation|design|business|service)\b/i)
    end

    def attributes_for(lead)
      {
        name: updates[:name].presence || conversation.name.presence || lead.name.presence || fallback_name,
        phone: updates[:phone].presence || conversation.phone.presence || lead.phone,
        email: updates[:email].presence || conversation.email.presence || lead.email,
        company_name: updates[:company_name].presence || conversation.company_name.presence || lead.company_name,
        country: updates[:country].presence || conversation.country.presence || lead.country,
        source: lead.source.presence || source,
        service_interest: updates[:service_interest].presence || conversation.service_interest.presence || lead.service_interest,
        budget: updates[:budget].presence || conversation.budget.presence || lead.budget,
        urgency: updates[:urgency].presence || conversation.urgency.presence || lead.urgency || "Normal",
        message: lead.message.presence || first_visitor_message,
        status: lead.status.presence || "Need Requirement",
        notes: notes_for(lead)
      }.compact
    end

    def lead_for_email
      email = updates[:email].presence || conversation.email
      return if email.blank?

      Lead.where("LOWER(email) = ?", email.downcase).order(created_at: :desc).first
    end

    def first_visitor_message
      conversation.ai_receptionist_messages.chronological.find(&:from_visitor?)&.content || latest_message
    end

    def notes_for(lead)
      note = [
        "AI receptionist conversation",
        "Channel: #{conversation.channel}",
        "Conversation ID: #{conversation.id}",
        "Latest message: #{latest_message}"
      ].join("\n")

      [ lead.notes, note ].compact_blank.join("\n\n")
    end

    def fallback_name
      email = updates[:email].presence || conversation.email
      return email.split("@").first.titleize if email.present?

      phone = updates[:phone].presence || conversation.phone
      return "WhatsApp Visitor #{phone.last(4)}" if phone.present?

      "Website Chat Visitor"
    end

    def source
      case conversation.channel
      when "whatsapp"
        "WhatsApp"
      when "messenger"
        "Messenger"
      else
        "AI Receptionist"
      end
    end

    def record_activity(lead, was_new_record)
      return unless was_new_record

      ActivityLog.record!(
        subject: lead,
        action: "AI receptionist captured lead",
        details: "Conversation #{conversation.id} started from #{conversation.channel}."
      )
    end
  end
end

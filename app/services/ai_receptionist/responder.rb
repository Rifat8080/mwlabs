module AiReceptionist
  class Responder
    Response = Struct.new(:content, :llm_model, :fallback, keyword_init: true) do
      def fallback?
        fallback
      end
    end

    def initialize(conversation:, model_client: LocalModelClient.new, complete_before_message: false)
      @conversation = conversation
      @model_client = model_client
      @complete_before_message = complete_before_message
    end

    def call
      result = model_client.chat(messages: prompt_messages)
      Response.new(content: result[:content], llm_model: result[:model], fallback: false)
    rescue LocalModelClient::Error => e
      Rails.logger.warn("AI receptionist local model fallback: #{e.message}")
      Response.new(content: fallback_reply, llm_model: "fallback", fallback: true)
    end

    private

    attr_reader :conversation, :model_client, :complete_before_message

    def prompt_messages
      [
        { role: "system", content: system_prompt },
        *conversation.recent_messages(limit: 12).map { |message| prompt_message_for(message) }
      ]
    end

    def prompt_message_for(message)
      {
        role: message.role == "assistant" ? "assistant" : "user",
        content: message.content
      }
    end

    def system_prompt
      <<~PROMPT.squish
        You are the AI receptionist for M&W Labs, a digital growth studio in Dhaka serving local and international clients.
        Services: web and software development, digital marketing, branding and design, video editing and content, AI automation, growth strategy.
        Your job is to greet visitors, answer briefly, qualify the request, and collect missing details for a human follow-up.
        Ask at most two questions per reply. Keep replies under 90 words. Be warm, specific, and professional.
        Do not invent exact pricing, guarantees, or delivery dates. If asked for pricing, say the team can quote after scope is clear.
        If the visitor wants urgent help, ask for their WhatsApp number or email and mention that the team can follow up.
        If the visitor asks to start a new request, treat it as a fresh conversation and do not reuse prior project details.
        Captured details so far: #{conversation.captured_details.presence || "none"}.
        Missing details: #{conversation.missing_lead_fields.join(", ").presence || "none"}.
      PROMPT
    end

    def fallback_reply
      return fresh_start_reply if restart_message? && conversation.captured_details.blank?
      return greeting_reply if greeting_message? && conversation.captured_details.blank?
      return returning_visitor_reply if greeting_message?
      return affirmation_reply if affirmation_message?
      return closing_reply if closing_message? && conversation.missing_lead_fields.none?
      return additional_detail_reply if complete_before_message && conversation.missing_lead_fields.none? && detail_message?
      return completion_reply if conversation.missing_lead_fields.none?

      acknowledgement = captured_acknowledgement
      question = next_question
      [ acknowledgement, question ].compact_blank.join(" ")
    end

    def greeting_reply
      "Hi! I’m here for M&W Labs. Share your name and WhatsApp or email, then tell me what you want help with — website, marketing, branding, video, or automation."
    end

    def returning_visitor_reply
      "Welcome back#{conversation.name.present? ? ", #{conversation.name}" : ""}. I still have #{captured_summary}. Do you want to add details to this request or start a new one?"
    end

    def fresh_start_reply
      "Sure, let’s start fresh. What are you looking to build or grow this time? Share the service need, budget, timeline, and best WhatsApp or email."
    end

    def affirmation_reply
      if conversation.missing_lead_fields.none?
        "Sure. Send the extra detail you want the team to know — preferred deadline, example links, pages/features, or the best time to call."
      else
        "Sure — #{next_question}"
      end
    end

    def completion_reply
      "Perfect#{conversation.name.present? ? ", #{conversation.name}" : ""}. I have the key details: #{captured_summary}. The M&W Labs team can follow up with the next step. Anything else you want to add?"
    end

    def additional_detail_reply
      "Got it, I added that detail to the request. The M&W Labs team will review it before following up. Anything else you want to add?"
    end

    def closing_reply
      "All set#{conversation.name.present? ? ", #{conversation.name}" : ""}. The M&W Labs team has the request and can follow up with the next step."
    end

    def captured_acknowledgement
      return if conversation.captured_details.blank?

      "Got it#{conversation.name.present? ? ", #{conversation.name}" : ""} — #{captured_summary}."
    end

    def captured_summary
      parts = []
      parts << conversation.service_interest.to_s.downcase if conversation.service_interest.present?
      parts << "budget #{formatted_budget}" if conversation.budget.present?
      parts << "#{conversation.urgency.to_s.downcase} timeline" if conversation.urgency.present?
      parts << "WhatsApp/phone #{conversation.phone}" if conversation.phone.present?
      parts << "country #{conversation.country}" if conversation.country.present?
      parts << conversation.email if conversation.email.present?
      parts << "extra notes saved" if conversation.summary.present?
      parts.presence&.to_sentence || "your request"
    end

    def next_question
      missing = conversation.missing_lead_fields
      return "Which country should I use for that phone number?" if missing.include?("country for phone code")
      return "What service do you need help with — website, marketing, branding, video, or automation?" if missing.include?("service need")
      return "What budget range should we keep in mind?" if missing.include?("budget")
      return "Is this urgent, this month, or flexible?" if missing.include?("timeline or urgency")
      return "What is your name?" if missing.include?("name")
      return "What is the best WhatsApp number or email for follow-up?" if missing.include?("email or WhatsApp number")

      "What else should the team know?"
    end

    def formatted_budget
      number = conversation.budget
      return if number.blank?

      number.frac.zero? ? number.to_i.to_s : number.to_s("F")
    end

    def greeting_message?
      ConversationIntent.greeting?(latest_visitor_message)
    end

    def affirmation_message?
      ConversationIntent.affirmation?(latest_visitor_message)
    end

    def closing_message?
      ConversationIntent.closing?(latest_visitor_message)
    end

    def restart_message?
      ConversationIntent.restart?(latest_visitor_message)
    end

    def detail_message?
      ConversationIntent.detail?(latest_visitor_message)
    end

    def latest_visitor_message
      conversation.recent_messages.reverse.find(&:from_visitor?)&.content.to_s.squish.downcase
    end
  end
end

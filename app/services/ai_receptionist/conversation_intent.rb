module AiReceptionist
  class ConversationIntent
    GREETING_PATTERN = /\A(?:hi|hello|hey|salam|assalamu alaikum|assalamualaikum|are you there\??)\z/i
    AFFIRMATION_PATTERN = /\A(?:yes|yeah|yep|sure|ok|okay|add more|i want to add)\z/i
    CLOSING_PATTERN = /\A(?:no|nope|nothing else|that's all|thats all|done|thanks|thank you|thank you so much)\.?\z/i
    RESTART_PATTERN = /\A(?:
      start(?:\s+a)?\s+new(?:\s+(?:one|request|project|conversation))? |
      start\s+over |
      start\s+fresh |
      fresh\s+start |
      new\s+(?:one|request|project|conversation) |
      reset(?:\s+chat)? |
      another\s+(?:request|project)
    )\b/ix

    class << self
      def greeting?(message)
        normalized(message).match?(GREETING_PATTERN)
      end

      def affirmation?(message)
        normalized(message).match?(AFFIRMATION_PATTERN)
      end

      def closing?(message)
        normalized(message).match?(CLOSING_PATTERN)
      end

      def restart?(message)
        normalized(message).match?(RESTART_PATTERN)
      end

      def control?(message)
        greeting?(message) || affirmation?(message) || closing?(message) || restart?(message)
      end

      def detail?(message)
        normalized(message).present? && !control?(message)
      end

      private

      def normalized(message)
        message.to_s.squish
      end
    end
  end
end

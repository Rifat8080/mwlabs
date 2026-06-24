require "bigdecimal/util"

module AiReceptionist
  class LeadExtractor
    SERVICE_KEYWORDS = {
      "Web & Software Development" => %w[website web app software saas dashboard ecommerce e-commerce portal crm],
      "Digital Marketing" => %w[marketing seo ads advertising campaign funnel leads google facebook meta],
      "Branding & Design" => %w[brand branding logo identity design brochure creative],
      "Video Editing & Content" => %w[video reel reels youtube editing content motion],
      "AI & Automation" => %w[ai automation chatbot bot workflow whatsapp messenger receptionist],
      "Growth Strategy" => %w[strategy growth research competitor scaling plan]
    }.freeze

    def self.normalize_phone(phone, country: nil)
      PhoneNumberNormalizer.normalize(phone, country: country)
    end

    URGENCY_KEYWORDS = {
      "Urgent" => %w[urgent asap immediately emergency today tomorrow],
      "High" => [ "soon", "this week", "this month", "next week", "fast", "quickly" ],
      "Low" => [ "no rush", "not urgent", "later", "future", "flexible", "flex" ],
      "Normal" => [ "normal", "standard", "not sure" ]
    }.freeze

    def initialize(conversation:, message:)
      @conversation = conversation
      @message = message.to_s.squish
      @downcased_message = @message.downcase
    end

    def call
      country = extract_country
      phone = extract_phone(country: country || conversation.country)
      {
        name: extract_name,
        email: extract_email,
        phone: phone,
        country: country,
        company_name: extract_company_name,
        service_interest: extract_service_interest,
        budget: extract_budget(phone: phone),
        urgency: extract_urgency
      }.compact_blank
    end

    private

    attr_reader :conversation, :message, :downcased_message

    def extract_email
      message[/[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}/i]
    end

    def extract_phone(country:)
      candidate = message.scan(/(?:\+?\d[\d\s().-]{6,}\d)/).find do |candidate|
        digits = candidate.gsub(/\D/, "")
        digits.length.between?(7, 15)
      end&.squish

      self.class.normalize_phone(candidate, country: country)
    end

    def extract_country
      PhoneNumberNormalizer.extract_country(message)
    end

    def extract_name
      return if ConversationIntent.control?(message)

      candidate = message[/\b(?:my name is|i am|i'm|this is)\s+([a-z][a-z\s.'-]{1,60})/i, 1]
      clean_person_name(candidate) || contextual_name
    end

    def extract_company_name
      candidate = message[/\b(?:company(?: name)? is|from|at)\s+([a-z0-9][a-z0-9&.'\-\s]{1,80})/i, 1]
      return if candidate.blank?

      company_name = candidate.split(/[,.;]|\b(?:and|with|for|looking|need|want|my phone|phone|whatsapp|email|budget)\b/i).first.to_s.strip
      return if PhoneNumberNormalizer.canonical_country_for(company_name).present?

      company_name.presence
    end

    def extract_service_interest
      SERVICE_KEYWORDS.find do |_service, keywords|
        keywords.any? { |keyword| keyword_present?(keyword) }
      end&.first
    end

    def extract_budget(phone: nil)
      match = message.match(/\b(?:budget|around|approximately|about|under|within|৳|bdt|\$|usd)\s*(?:is|of|around|about)?\s*[:\-]?\s*([৳$]?\s*[0-9][0-9,]*(?:\.\d{1,2})?)\s*(k|thousand|lac|lakh|bdt|taka|usd)?/i)
      match ||= contextual_budget_match(phone: phone)
      return if match.blank?

      amount_text = match.is_a?(MatchData) ? match[1] : match[0]
      multiplier_text = match.is_a?(MatchData) ? match[2] : match[1]

      amount = amount_text.gsub(/[^\d.]/, "").to_d
      multiplier = multiplier_text.to_s.downcase
      amount *= 1_000 if multiplier.in?(%w[k thousand])
      amount *= 100_000 if multiplier.in?(%w[lac lakh])
      amount if amount.positive?
    end

    def extract_urgency
      URGENCY_KEYWORDS.find do |_urgency, keywords|
        keywords.any? { |keyword| urgency_keyword_present?(keyword) }
      end&.first
    end

    def urgency_keyword_present?(keyword)
      return true if downcased_message.match?(/\b#{Regexp.escape(keyword)}\b/)
      return false if keyword.include?(" ")

      downcased_message.scan(/\b[[:alpha:]]+\b/).any? do |token|
        token[0] == keyword[0] && one_edit_distance?(token, keyword)
      end
    end

    def clean_person_name(candidate)
      return if candidate.blank?

      cleaned = candidate.split(/\b(?:from|and|for|looking|need|want|with)\b|[,.;]/i).first.to_s.strip
      return if cleaned.blank?
      return if cleaned.downcase.in?(%w[i me we us])
      return if cleaned.split.size > 4
      return if SERVICE_KEYWORDS.values.flatten.any? { |keyword| cleaned.downcase.include?(keyword) }
      return if urgency_keyword?(cleaned)

      cleaned.titleize
    end

    def urgency_keyword?(phrase)
      normalized = phrase.to_s.downcase
      URGENCY_KEYWORDS.values.flatten.any? do |keyword|
        keyword = keyword.downcase
        next true if normalized == keyword
        next false if normalized[0] != keyword[0]

        one_edit_distance?(normalized, keyword)
      end
    end

    def one_edit_distance?(a, b)
      return false if a == b
      return false if a[0] != b[0]
      return false if (a.length - b.length).abs > 1

      if a.length == b.length
        diffs = a.chars.zip(b.chars).count { |x, y| x != y }
        return true if diffs == 1
        return transposition?(a, b) if diffs == 2
        return false
      end

      shorter, longer = a.length < b.length ? [ a, b ] : [ b, a ]
      i = 0
      j = 0
      diffs = 0

      while i < shorter.length && j < longer.length
        if shorter[i] == longer[j]
          i += 1
          j += 1
        else
          diffs += 1
          return false if diffs > 1
          j += 1
        end
      end

      diffs + (j < longer.length ? 1 : 0) == 1
    end

    def transposition?(a, b)
      return false if a.length != b.length

      diffs = a.chars.zip(b.chars).each_with_index.filter_map do |(x, y), index|
        index if x != y
      end
      return false unless diffs.size == 2

      i, j = diffs
      a[i] == b[j] && a[j] == b[i]
    end

    def contextual_name
      return if conversation.name.present?
      return if greeting_only?
      return if ConversationIntent.control?(message)

      candidate = message.split(/[,،]|(?:\s+and\s+)/i).find do |part|
        cleaned = part.gsub(/[+৳$]?\d[\d\s().-]*/, "").squish
        clean_person_name(cleaned).present?
      end

      clean_person_name(candidate&.gsub(/[+৳$]?\d[\d\s().-]*/, ""))
    end

    def contextual_budget_match(phone:)
      return if conversation.budget.present?

      normalized_phone = phone.to_s.gsub(/\D/, "")
      message.scan(/([৳$]?\s*\d[\d,]*(?:\.\d{1,2})?)\s*(k|thousand|lac|lakh|bdt|taka|usd)?/i).find do |amount, multiplier|
        digits = amount.gsub(/\D/, "")
        next if digits.blank?
        next if normalized_phone.present? && normalized_phone.include?(digits)
        next if digits.length > 7 && multiplier.blank? && !amount.include?("$") && !amount.include?("৳")

        true
      end
    end

    def greeting_only?
      downcased_message.match?(/\A(?:hi|hello|hey|salam|assalamu alaikum|assalamualaikum|are you there\??)\z/)
    end

    def keyword_present?(keyword)
      downcased_message.match?(/\b#{Regexp.escape(keyword.downcase)}\b/)
    end
  end
end

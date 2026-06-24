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
      "High" => [ "soon", "this week", "next week", "fast", "quickly" ],
      "Low" => [ "no rush", "not urgent", "later", "future" ],
      "Normal" => %w[normal standard]
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
        keywords.any? { |keyword| downcased_message.include?(keyword) }
      end&.first
    end

    def clean_person_name(candidate)
      return if candidate.blank?

      cleaned = candidate.split(/\b(?:from|and|for|looking|need|want|with)\b|[,.;]/i).first.to_s.strip
      return if cleaned.blank?
      return if cleaned.downcase.in?(%w[i me we us])
      return if cleaned.split.size > 4
      return if SERVICE_KEYWORDS.values.flatten.any? { |keyword| cleaned.downcase.include?(keyword) }

      cleaned.titleize
    end

    def contextual_name
      return if conversation.name.present?
      return if greeting_only?

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

module Ai
  class AgencyContext
    CACHE_KEY = "ai/agency_context".freeze

    def self.build
      Rails.cache.fetch(CACHE_KEY, expires_in: 10.minutes) do
        entries = AiKnowledgeEntry.active.order(:key)
        entries.any? ? entries.map { |entry| "#{entry.key.humanize}: #{entry.value}" }.join("\n") : default_context
      end
    end

    def self.default_context
      "Agency name: MW Labs\nServices: Web development, SaaS development, AI automation, AI agents, Marketing, SEO, Branding"
    end
  end
end

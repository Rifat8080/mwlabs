module Ai
  class MarketingSyncJob < ApplicationJob
    queue_as :default

    AGENT_KEY = "marketing_manager".freeze

    def perform
      return if AiAgentRun.for_agent(AGENT_KEY).where(created_at: Date.current.all_week).exists?

      result = Ai::AgentRunner.call(agent_key: AGENT_KEY, params: {}, user: nil)

      NotificationService.notify(
        notifiable: result[:run],
        action: "Weekly marketing plan ready for review",
        details: "This week's content suggestions are ready. Review and apply on the Marketing Manager page."
      )
    rescue Ai::GeminiClient::Error, Ai::UsageTracker::RateLimitError => e
      Rails.logger.error("Ai::MarketingSyncJob failed: #{e.message}")
    end
  end
end

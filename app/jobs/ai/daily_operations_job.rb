module Ai
  class DailyOperationsJob < ApplicationJob
    queue_as :default

    AGENT_KEY = "daily_operations".freeze

    def perform
      return if AiAgentRun.for_agent(AGENT_KEY).where(created_at: Date.current.all_day).exists?

      result = Ai::AgentRunner.call(agent_key: AGENT_KEY, params: {}, user: nil)

      NotificationService.notify(
        notifiable: result[:run],
        action: "Daily plan ready for review",
        details: "Today's priorities and reminders are ready. Review and apply on the Daily Operations Manager page."
      )
    rescue Ai::GeminiClient::Error, Ai::UsageTracker::RateLimitError => e
      Rails.logger.error("Ai::DailyOperationsJob failed: #{e.message}")
    end
  end
end

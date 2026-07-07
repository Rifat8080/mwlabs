module Ai
  class UsageTracker
    class RateLimitError < StandardError; end

    def self.track(feature:, model: nil)
      raise RateLimitError, "AI request limit reached. Please try again shortly." if rate_limited?

      result = yield

      AiUsageLog.create!(
        feature: feature,
        model: result[:model] || model,
        prompt_tokens: result[:prompt_tokens],
        output_tokens: result[:output_tokens],
        tokens_used: result[:total_tokens],
        status: "success"
      )

      result
    rescue RateLimitError
      raise
    rescue StandardError => e
      AiUsageLog.create!(feature: feature, model: model, status: "error", error_message: e.message.to_s.truncate(500))
      raise
    end

    def self.rate_limited?
      max_per_minute = ENV.fetch("GEMINI_MAX_RPM", 10).to_i
      max_per_day = ENV.fetch("GEMINI_MAX_RPD", 200).to_i

      AiUsageLog.where(created_at: 1.minute.ago..).count >= max_per_minute ||
        AiUsageLog.where(created_at: 1.day.ago..).count >= max_per_day
    end
  end
end

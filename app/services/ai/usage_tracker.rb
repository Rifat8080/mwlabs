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
      AiUsageLog.where(created_at: 1.minute.ago..).count >= max_per_minute ||
        AiUsageLog.where(created_at: 1.day.ago..).count >= max_per_day
    end

    def self.max_per_minute
      ENV.fetch("GEMINI_MAX_RPM", 10).to_i
    end

    def self.max_per_day
      ENV.fetch("GEMINI_MAX_RPD", 200).to_i
    end

    def self.summary
      requests_today = AiUsageLog.where(created_at: Date.current.all_day).count

      {
        requests_today: requests_today,
        requests_this_month: AiUsageLog.where(created_at: Date.current.all_month).count,
        failed_requests_today: AiUsageLog.where(created_at: Date.current.all_day, status: "error").count,
        most_used_feature: AiUsageLog.group(:feature).order(Arel.sql("count_all DESC")).count.first&.first,
        avg_duration_ms: AiAgentRun.where(created_at: Date.current.all_day).average(:duration_ms)&.round,
        requests_today_pct: max_per_day.positive? ? ((requests_today.to_f / max_per_day) * 100).round : 0,
        near_daily_limit: requests_today >= (max_per_day * 0.8)
      }
    end
  end
end

require "benchmark"

module Ai
  class AgentRunner
    class UnknownAgentError < StandardError; end

    def self.call(agent_key:, params: {}, user: nil)
      agent = Ai::AgentRegistry.find(agent_key)
      raise UnknownAgentError, "Unknown AI agent: #{agent_key}" if agent.blank?

      result = nil
      duration_ms = Benchmark.realtime {
        result = agent[:runner].call(params: params, user: user)
      } * 1000

      run = AiAgentRun.create!(
        agent_key: agent[:key],
        feature: agent[:key],
        user: user,
        input: params.to_h.transform_keys(&:to_s),
        output: result[:content],
        parsed: result[:parsed],
        status: "success",
        model: result[:model],
        prompt_tokens: result[:prompt_tokens],
        output_tokens: result[:output_tokens],
        tokens_used: result[:total_tokens],
        duration_ms: duration_ms.round
      )

      { run: run, content: result[:content], parsed: result[:parsed] }
    rescue UnknownAgentError
      raise
    rescue StandardError => e
      AiAgentRun.create!(
        agent_key: agent_key.to_s,
        feature: agent_key.to_s,
        user: user,
        input: params.to_h.transform_keys(&:to_s),
        status: "error",
        error_message: e.message.to_s.truncate(500)
      )
      raise
    end
  end
end

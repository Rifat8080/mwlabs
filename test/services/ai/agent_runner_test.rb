require "test_helper"

module Ai
  class AgentRunnerTest < ActiveSupport::TestCase
    test "runs a registered agent and persists a successful AiAgentRun" do
      response = { content: "Weekly summary text", model: "gemini-2.5-flash", prompt_tokens: 10, output_tokens: 5, total_tokens: 15 }

      assert_difference "AiAgentRun.count", 1 do
        stub_gemini_client(response) do
          result = Ai::AgentRunner.call(agent_key: "weekly_report", params: {}, user: users(:admin))
          assert_equal "Weekly summary text", result[:content]
        end
      end

      run = AiAgentRun.last
      assert_equal "weekly_report", run.agent_key
      assert_equal "success", run.status
      assert_equal 15, run.tokens_used
      assert run.duration_ms.present?
    end

    test "persists an error AiAgentRun and re-raises when the agent fails" do
      assert_difference "AiAgentRun.count", 1 do
        stub_gemini_client(Ai::GeminiClient::Error.new("quota exceeded")) do
          assert_raises(Ai::GeminiClient::Error) do
            Ai::AgentRunner.call(agent_key: "weekly_report", params: {}, user: users(:admin))
          end
        end
      end

      run = AiAgentRun.last
      assert_equal "error", run.status
      assert_match(/quota exceeded/, run.error_message)
    end

    test "raises UnknownAgentError for an unregistered agent key" do
      assert_raises(Ai::AgentRunner::UnknownAgentError) do
        Ai::AgentRunner.call(agent_key: "not_a_real_agent", params: {}, user: users(:admin))
      end
    end
  end
end

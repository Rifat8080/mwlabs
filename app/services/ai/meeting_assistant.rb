module Ai
  class MeetingAssistant
    def initialize(gemini_client: Ai::GeminiClient.new)
      @gemini_client = gemini_client
    end

    def summarize(notes:)
      prompt = <<~PROMPT
        Meeting notes:
        #{notes}

        Summarize this meeting: a short summary, key decisions, action items (each with a task, assignee if mentioned, and deadline if mentioned), and follow-ups.
      PROMPT

      schema = {
        type: "OBJECT",
        properties: {
          summary: { type: "STRING" },
          key_decisions: { type: "ARRAY", items: { type: "STRING" } },
          action_items: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                task: { type: "STRING" },
                assignee: { type: "STRING" },
                deadline: { type: "STRING" }
              },
              required: %w[task]
            }
          },
          follow_ups: { type: "ARRAY", items: { type: "STRING" } }
        },
        required: %w[summary action_items]
      }

      result = Ai::UsageTracker.track(feature: "meeting_summary") do
        gemini_client.generate(prompt: prompt, system_instruction: system_instruction, json_schema: schema)
      end

      result.merge(parsed: parse_json(result))
    end

    private

    attr_reader :gemini_client

    def system_instruction
      "#{Ai::AgencyContext.build}\n\n#{Ai::PromptTemplate.for("meeting_summary")}"
    end

    def parse_json(result)
      JSON.parse(result[:content]).symbolize_keys
    rescue JSON::ParserError => e
      raise Ai::GeminiClient::Error, "Gemini returned invalid JSON: #{e.message}"
    end
  end
end

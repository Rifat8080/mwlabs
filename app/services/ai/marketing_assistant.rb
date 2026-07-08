module Ai
  class MarketingAssistant
    def initialize(gemini_client: Ai::GeminiClient.new, content_generator: nil)
      @gemini_client = gemini_client
      @content_generator = content_generator || Ai::ContentGenerator.new(gemini_client: gemini_client)
    end

    def content_ideas(service:, audience:, platform:, goal:)
      prompt = <<~PROMPT
        Service: #{service}
        Target audience: #{audience}
        Platform: #{platform}
        Goal: #{goal}

        Generate 5-8 specific, actionable content ideas for this platform that support the stated goal. For each idea, give a short title and a one-sentence angle.
      PROMPT

      Ai::UsageTracker.track(feature: "marketing_ideas") do
        gemini_client.generate(prompt: prompt, system_instruction: system_instruction("marketing_ideas"))
      end
    end

    def generate_post(platform:, topic:, instruction: "draft", previous_content: nil)
      content_generator.write(platform: platform, topic: topic, instruction: instruction, previous_content: previous_content)
    end

    def weekly_content_plan(week: Date.current.all_week)
      scheduled = MarketingItem.where(publish_on: week)

      prompt = <<~PROMPT
        Week: #{week.first} to #{week.last}

        Already scheduled this week:
        #{format_marketing(scheduled)}

        Suggest additional marketing content to fill gaps this week: for each idea give a title, the best platform, a suggested publish date (YYYY-MM-DD, within the week above), and a one-sentence note on the angle. Avoid duplicating what's already scheduled. Also write a short narrative summarizing the week's marketing plan and any content gaps.
      PROMPT

      schema = {
        type: "OBJECT",
        properties: {
          narrative: { type: "STRING" },
          items: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                title: { type: "STRING" },
                platform: { type: "STRING" },
                publish_on: { type: "STRING", description: "YYYY-MM-DD" },
                notes: { type: "STRING" }
              },
              required: %w[title platform publish_on]
            }
          }
        },
        required: %w[narrative items]
      }

      result = Ai::UsageTracker.track(feature: "marketing_ideas") do
        gemini_client.generate(prompt: prompt, system_instruction: system_instruction("marketing_ideas"), json_schema: schema)
      end

      parsed = JSON.parse(result[:content])
      result.merge(content: parsed["narrative"], parsed: parsed)
    rescue JSON::ParserError => e
      raise Ai::GeminiClient::Error, "Gemini returned invalid JSON: #{e.message}"
    end

    private

    attr_reader :gemini_client, :content_generator

    def system_instruction(category)
      "#{Ai::AgencyContext.build}\n\n#{Ai::PromptTemplate.for(category)}"
    end

    def format_marketing(items)
      return "None" if items.none?

      items.map { |item| "- #{item.title} (#{item.platform}, #{item.status}, #{item.publish_on || "no date"})" }.join("\n")
    end
  end
end

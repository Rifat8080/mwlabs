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

    private

    attr_reader :gemini_client, :content_generator

    def system_instruction(category)
      "#{Ai::AgencyContext.build}\n\n#{Ai::PromptTemplate.for(category)}"
    end
  end
end

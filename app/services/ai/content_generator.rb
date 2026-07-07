module Ai
  class ContentGenerator
    INSTRUCTIONS = {
      "draft" => "Write a first draft.",
      "regenerate" => "Write a completely different take on the same topic.",
      "improve" => "Improve the clarity and impact of the previous content.",
      "shorten" => "Make the previous content significantly shorter.",
      "professional" => "Rewrite the previous content in a more professional tone.",
      "engaging" => "Rewrite the previous content to be more engaging and attention-grabbing."
    }.freeze

    def initialize(gemini_client: Ai::GeminiClient.new)
      @gemini_client = gemini_client
    end

    def write(platform:, topic:, instruction: "draft", previous_content: nil)
      prompt = <<~PROMPT
        Platform: #{platform}
        Topic: #{topic}
        Instruction: #{INSTRUCTIONS.fetch(instruction.to_s, INSTRUCTIONS["draft"])}
        #{"Previous content to revise:\n#{previous_content}" if previous_content.present?}

        Format the output appropriately for #{platform} (LinkedIn: professional post; Twitter/X: short numbered thread; Instagram: caption + hashtags; YouTube: title + description + script outline; Blog: outline with headings; Newsletter: subject line + body).
      PROMPT

      Ai::UsageTracker.track(feature: "social_post") do
        gemini_client.generate(prompt: prompt, system_instruction: system_instruction)
      end
    end

    private

    attr_reader :gemini_client

    def system_instruction
      "#{Ai::AgencyContext.build}\n\n#{Ai::PromptTemplate.for("social_post")}"
    end
  end
end

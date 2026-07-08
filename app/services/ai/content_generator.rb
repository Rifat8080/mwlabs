module Ai
  class ContentGenerator
    INSTRUCTIONS = {
      "draft" => "Write a first draft.",
      "regenerate" => "Write a completely different take on the same topic.",
      "improve" => "Improve the clarity and impact of the previous content.",
      "rewrite" => "Rewrite the previous content with a fresh structure while keeping the same message.",
      "shorten" => "Make the previous content significantly shorter.",
      "expand" => "Expand the previous content with more detail and supporting points.",
      "professional" => "Rewrite the previous content in a more professional tone.",
      "friendly" => "Rewrite the previous content in a warmer, more friendly and conversational tone.",
      "engaging" => "Rewrite the previous content to be more engaging and attention-grabbing."
    }.freeze

    CONTENT_TYPE_FORMATS = {
      "post" => "Format appropriately for the platform (LinkedIn: professional post; Twitter/X: short numbered thread; Facebook: casual post; Instagram: caption + hashtags; YouTube: title + description + script outline; Blog: outline with headings; Newsletter: subject line + body).",
      "case_study" => "Write a short case study: challenge, solution, results, with a client-friendly narrative.",
      "cta" => "Write 5 short, punchy call-to-action variations.",
      "hashtags" => "Suggest 10-15 relevant hashtags, most specific first.",
      "seo_title" => "Write 3 SEO-optimized title variations, each under 60 characters.",
      "meta_description" => "Write 3 meta description variations, each under 160 characters, including the main keyword.",
      "video_idea" => "Suggest 5 video ideas with a working title and a one-sentence concept for each."
    }.freeze

    def initialize(gemini_client: Ai::GeminiClient.new)
      @gemini_client = gemini_client
    end

    def write(platform:, topic:, instruction: "draft", content_type: "post", previous_content: nil)
      prompt = <<~PROMPT
        Platform: #{platform}
        Content type: #{content_type}
        Topic: #{topic}
        Instruction: #{INSTRUCTIONS.fetch(instruction.to_s, INSTRUCTIONS["draft"])}
        #{"Previous content to revise:\n#{previous_content}" if previous_content.present?}

        #{CONTENT_TYPE_FORMATS.fetch(content_type.to_s, CONTENT_TYPE_FORMATS["post"])}
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

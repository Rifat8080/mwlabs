module Ai
  class SeoAssistant
    def initialize(gemini_client: Ai::GeminiClient.new)
      @gemini_client = gemini_client
    end

    def optimize(topic:, target_keyword: nil, page_url: nil, existing_content: nil)
      prompt = <<~PROMPT
        Topic: #{topic}
        #{"Target keyword: #{target_keyword}" if target_keyword.present?}
        #{"Page URL: #{page_url}" if page_url.present?}
        #{"Existing content to improve:\n#{existing_content}" if existing_content.present?}

        Provide: 8-12 relevant keywords, 2-3 meta title options (under 60 characters), 2-3 meta description options (under 160 characters), a content outline (headings), and internal linking suggestions.
        #{"Also critique the existing content and suggest specific improvements." if existing_content.present?}
      PROMPT

      Ai::UsageTracker.track(feature: "seo") do
        gemini_client.generate(prompt: prompt, system_instruction: system_instruction)
      end
    end

    private

    attr_reader :gemini_client

    def system_instruction
      "#{Ai::AgencyContext.build}\n\n#{Ai::PromptTemplate.for("seo")}"
    end
  end
end

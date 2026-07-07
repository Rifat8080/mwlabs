module Ai
  class Chat
    def initialize(gemini_client: Ai::GeminiClient.new)
      @gemini_client = gemini_client
    end

    def respond(message:, history: [])
      transcript = history.map { |entry| "#{entry[:role] == "user" ? "User" : "Assistant"}: #{entry[:content]}" }.join("\n")
      prompt = transcript.present? ? "#{transcript}\nUser: #{message}" : message

      Ai::UsageTracker.track(feature: "general") do
        gemini_client.generate(prompt: prompt, system_instruction: system_instruction)
      end
    end

    private

    attr_reader :gemini_client

    def system_instruction
      "#{Ai::AgencyContext.build}\n\n#{Ai::PromptTemplate.for("general")}"
    end
  end
end

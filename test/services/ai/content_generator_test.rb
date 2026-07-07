require "test_helper"

module Ai
  class ContentGeneratorTest < ActiveSupport::TestCase
    test "write generates content for the given platform and instruction" do
      fake = fake_client("LinkedIn post about AI automation.")

      result = Ai::ContentGenerator.new(gemini_client: fake).write(platform: "LinkedIn", topic: "AI automation", instruction: "shorten", previous_content: "Old content")
      assert_equal "LinkedIn post about AI automation.", result[:content]
    end

    test "unknown instruction falls back to draft" do
      assert_equal Ai::ContentGenerator::INSTRUCTIONS["draft"], Ai::ContentGenerator::INSTRUCTIONS.fetch("bogus", Ai::ContentGenerator::INSTRUCTIONS["draft"])
    end

    private

    def fake_client(content)
      client = Object.new
      client.define_singleton_method(:generate) do |**|
        { content: content, model: "gemini-2.5-flash", prompt_tokens: 1, output_tokens: 1, total_tokens: 2 }
      end
      client
    end
  end
end

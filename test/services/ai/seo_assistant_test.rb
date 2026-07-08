require "test_helper"

module Ai
  class SeoAssistantTest < ActiveSupport::TestCase
    test "optimize returns Gemini's content" do
      fake = fake_client("SEO recommendations")

      result = Ai::SeoAssistant.new(gemini_client: fake).optimize(topic: "AI automation for agencies")
      assert_equal "SEO recommendations", result[:content]
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

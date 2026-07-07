require "test_helper"

module Ai
  class ChatTest < ActiveSupport::TestCase
    test "respond includes prior history in the prompt and returns Gemini's reply" do
      fake = Object.new
      captured_prompt = nil
      fake.define_singleton_method(:generate) do |prompt:, **|
        captured_prompt = prompt
        { content: "reply", model: "gemini-2.5-flash", prompt_tokens: 1, output_tokens: 1, total_tokens: 2 }
      end

      result = Ai::Chat.new(gemini_client: fake).respond(
        message: "and now?",
        history: [ { role: "user", content: "hello" }, { role: "assistant", content: "hi there" } ]
      )

      assert_equal "reply", result[:content]
      assert_includes captured_prompt, "hello"
      assert_includes captured_prompt, "and now?"
    end
  end
end

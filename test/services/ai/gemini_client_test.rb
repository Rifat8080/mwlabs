require "test_helper"

module Ai
  class GeminiClientTest < ActiveSupport::TestCase
    test "raises a clear error when the API key is not configured" do
      client = Ai::GeminiClient.new(api_key: nil)

      error = assert_raises(Ai::GeminiClient::Error) { client.generate(prompt: "hello") }
      assert_match(/not configured/, error.message)
    end
  end
end

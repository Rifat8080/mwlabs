require "test_helper"

module Ai
  class GeminiClientTest < ActiveSupport::TestCase
    test "raises a clear error when the API key is not configured" do
      client = Ai::GeminiClient.new(api_key: nil)

      error = assert_raises(Ai::GeminiClient::Error) { client.generate(prompt: "hello") }
      assert_match(/not configured/, error.message)
    end

    test "retries temporary Gemini overloads and returns content when retry succeeds" do
      http_client = FakeHttpClient.new(gemini_overload_response, gemini_success_response("Recovered reply"))
      client = Ai::GeminiClient.new(api_key: "test-key", http_client: http_client, max_retries: 1, retry_base_delay: 0)

      result = client.generate(prompt: "hello")

      assert_equal "Recovered reply", result[:content]
      assert_equal 2, http_client.requests.size
    end

    test "raises a friendly error when Gemini stays overloaded" do
      http_client = FakeHttpClient.new(gemini_overload_response, gemini_overload_response)
      client = Ai::GeminiClient.new(api_key: "test-key", http_client: http_client, max_retries: 1, retry_base_delay: 0)

      error = assert_raises(Ai::GeminiClient::Error) { client.generate(prompt: "hello") }

      assert_equal "The Gemini model is temporarily overloaded. Please try again in a few minutes.", error.message
      assert_not_includes error.message, "\"error\""
      assert_equal 2, http_client.requests.size
    end

    private

    class FakeHttpClient
      attr_reader :requests

      def initialize(*responses)
        @responses = responses
        @requests = []
      end

      def request(request)
        requests << request
        @responses.shift
      end
    end

    def gemini_overload_response
      http_response(
        Net::HTTPServiceUnavailable,
        503,
        "Service Unavailable",
        {
          error: {
            code: 503,
            message: "This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.",
            status: "UNAVAILABLE"
          }
        }.to_json
      )
    end

    def gemini_success_response(content)
      http_response(
        Net::HTTPOK,
        200,
        "OK",
        {
          candidates: [
            {
              content: {
                parts: [ { text: content } ]
              }
            }
          ],
          usageMetadata: {
            promptTokenCount: 1,
            candidatesTokenCount: 2,
            totalTokenCount: 3
          }
        }.to_json
      )
    end

    def http_response(klass, code, message, body)
      response = klass.new("1.1", code.to_s, message)
      response.instance_variable_set(:@body, body)
      response.instance_variable_set(:@read, true)
      response
    end
  end
end

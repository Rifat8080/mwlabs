require "json"
require "net/http"
require "uri"

module AiReceptionist
  class LocalModelClient
    class Error < StandardError; end

    DEFAULT_BASE_URL = "http://127.0.0.1:11434".freeze
    DEFAULT_MODEL = "llama3.2".freeze

    attr_reader :base_url, :model

    def initialize(
      base_url: ENV.fetch("OLLAMA_BASE_URL", DEFAULT_BASE_URL),
      model: ENV.fetch("AI_RECEPTIONIST_MODEL", ENV.fetch("OLLAMA_MODEL", DEFAULT_MODEL)),
      timeout: ENV.fetch("AI_RECEPTIONIST_TIMEOUT", 20).to_i
    )
      @base_url = base_url
      @model = model
      @timeout = timeout
    end

    def chat(messages:)
      response = http_client.request(request(messages))
      raise Error, "Local model returned HTTP #{response.code}" unless response.is_a?(Net::HTTPSuccess)

      payload = JSON.parse(response.body)
      content = payload.dig("message", "content").to_s.strip
      raise Error, "Local model returned an empty response" if content.blank?

      {
        content: content,
        model: payload["model"].presence || model,
        raw: payload
      }
    rescue Error
      raise
    rescue JSON::ParserError, SystemCallError, SocketError, Timeout::Error, Net::OpenTimeout, Net::ReadTimeout => e
      raise Error, "Local model unavailable: #{e.message}"
    end

    private

    def http_client
      Net::HTTP.new(chat_uri.host, chat_uri.port).tap do |http|
        http.use_ssl = chat_uri.scheme == "https"
        http.open_timeout = @timeout
        http.read_timeout = @timeout
      end
    end

    def request(messages)
      Net::HTTP::Post.new(chat_uri).tap do |request|
        request["Content-Type"] = "application/json"
        request.body = JSON.generate(
          model: model,
          stream: false,
          messages: messages,
          options: {
            temperature: 0.4,
            top_p: 0.9
          }
        )
      end
    end

    def chat_uri
      @chat_uri ||= URI.join(base_url.end_with?("/") ? base_url : "#{base_url}/", "api/chat")
    end
  end
end

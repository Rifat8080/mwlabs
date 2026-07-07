require "json"
require "net/http"
require "uri"

module Ai
  class GeminiClient
    class Error < StandardError; end

    DEFAULT_MODEL = "gemini-2.5-flash".freeze
    DEFAULT_TIMEOUT = 30
    API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models".freeze

    def initialize(
      api_key: ENV.fetch("GEMINI_API_KEY") { Rails.application.credentials.dig(:gemini, :api_key) },
      model: ENV.fetch("GEMINI_MODEL", DEFAULT_MODEL),
      timeout: ENV.fetch("GEMINI_TIMEOUT", DEFAULT_TIMEOUT).to_i
    )
      @api_key = api_key
      @model = model
      @timeout = timeout
    end

    def generate(prompt:, system_instruction: nil, json_schema: nil, temperature: 0.7, max_output_tokens: 2048)
      raise Error, "GEMINI_API_KEY is not configured" if api_key.blank?

      response = http_client.request(build_request(
        prompt: prompt,
        system_instruction: system_instruction,
        json_schema: json_schema,
        temperature: temperature,
        max_output_tokens: max_output_tokens
      ))

      unless response.is_a?(Net::HTTPSuccess)
        raise Error, "Gemini returned HTTP #{response.code}: #{response.body}"
      end

      payload = JSON.parse(response.body)
      candidate = payload.dig("candidates", 0)
      if candidate.blank?
        block_reason = payload.dig("promptFeedback", "blockReason")
        raise Error, "Gemini returned no candidates#{" (blocked: #{block_reason})" if block_reason}"
      end

      content = candidate.dig("content", "parts", 0, "text").to_s.strip
      raise Error, "Gemini returned an empty response" if content.blank?

      usage = payload["usageMetadata"] || {}

      {
        content: content,
        model: model,
        prompt_tokens: usage["promptTokenCount"],
        output_tokens: usage["candidatesTokenCount"],
        total_tokens: usage["totalTokenCount"]
      }
    rescue Error
      raise
    rescue JSON::ParserError, SystemCallError, SocketError, Timeout::Error, Net::OpenTimeout, Net::ReadTimeout, OpenSSL::SSL::SSLError => e
      raise Error, "Gemini request failed: #{e.message}"
    end

    private

    attr_reader :api_key, :model, :timeout

    def build_request(prompt:, system_instruction:, json_schema:, temperature:, max_output_tokens:)
      uri = URI("#{API_BASE_URL}/#{model}:generateContent?key=#{api_key}")
      request = Net::HTTP::Post.new(uri)
      request["Content-Type"] = "application/json"
      request.body = build_body(
        prompt: prompt,
        system_instruction: system_instruction,
        json_schema: json_schema,
        temperature: temperature,
        max_output_tokens: max_output_tokens
      ).to_json
      request
    end

    def build_body(prompt:, system_instruction:, json_schema:, temperature:, max_output_tokens:)
      generation_config = { temperature: temperature, maxOutputTokens: max_output_tokens }

      if json_schema.present?
        generation_config[:responseMimeType] = "application/json"
        generation_config[:responseSchema] = json_schema
      end

      body = {
        contents: [ { role: "user", parts: [ { text: prompt } ] } ],
        generationConfig: generation_config
      }
      body[:systemInstruction] = { parts: [ { text: system_instruction } ] } if system_instruction.present?
      body
    end

    def http_client
      uri = URI("#{API_BASE_URL}/#{model}:generateContent")
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = true
      http.open_timeout = timeout
      http.read_timeout = timeout
      http
    end
  end
end

require "json"
require "net/http"
require "uri"

module Ai
  class GeminiClient
    class Error < StandardError; end

    DEFAULT_MODEL = "gemini-2.5-flash".freeze
    DEFAULT_TIMEOUT = 30
    DEFAULT_MAX_RETRIES = 2
    DEFAULT_RETRY_BASE_DELAY = 0.5
    MAX_RETRY_DELAY = 2.0
    RETRYABLE_STATUS_CODES = [ 503 ].freeze
    API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models".freeze

    def initialize(
      api_key: ENV.fetch("GEMINI_API_KEY") { Rails.application.credentials.dig(:gemini, :api_key) },
      model: ENV.fetch("GEMINI_MODEL", DEFAULT_MODEL),
      timeout: ENV.fetch("GEMINI_TIMEOUT", DEFAULT_TIMEOUT).to_i,
      max_retries: ENV.fetch("GEMINI_MAX_RETRIES", DEFAULT_MAX_RETRIES).to_i,
      retry_base_delay: ENV.fetch("GEMINI_RETRY_BASE_DELAY", DEFAULT_RETRY_BASE_DELAY).to_f,
      http_client: nil
    )
      @api_key = api_key
      @model = model
      @timeout = timeout
      @max_retries = [ max_retries.to_i, 0 ].max
      @retry_base_delay = [ retry_base_delay.to_f, 0 ].max
      @provided_http_client = http_client
    end

    def generate(prompt:, system_instruction: nil, json_schema: nil, temperature: 0.7, max_output_tokens: 2048)
      raise Error, "GEMINI_API_KEY is not configured" if api_key.blank?

      response = request_with_retries(build_request(
        prompt: prompt,
        system_instruction: system_instruction,
        json_schema: json_schema,
        temperature: temperature,
        max_output_tokens: max_output_tokens
      ))

      unless response.is_a?(Net::HTTPSuccess)
        raise Error, error_message_for(response)
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

    attr_reader :api_key, :model, :timeout, :max_retries, :retry_base_delay, :provided_http_client

    def request_with_retries(request)
      attempts = 0

      loop do
        response = http_client.request(request)
        return response if response.is_a?(Net::HTTPSuccess)
        return response unless retryable_response?(response) && attempts < max_retries

        attempts += 1
        delay = retry_delay_for(response, attempts)
        sleep(delay) if delay.positive?
      end
    end

    def retryable_response?(response)
      RETRYABLE_STATUS_CODES.include?(response.code.to_i)
    end

    def retry_delay_for(response, attempt)
      retry_after = response["Retry-After"].to_s
      delay = retry_after.match?(/\A\d+(\.\d+)?\z/) ? retry_after.to_f : retry_base_delay * (2 ** (attempt - 1))
      [ delay, MAX_RETRY_DELAY ].min
    end

    def error_message_for(response)
      status_code = response.code.to_i
      api_error = parsed_error_body(response.body)
      api_status = api_error["status"].to_s
      api_message = api_error["message"].to_s

      if status_code == 503
        return "The Gemini model is temporarily overloaded. Please try again in a few minutes." if "#{api_status} #{api_message}".match?(/UNAVAILABLE|high demand/i)

        return "Gemini is temporarily unavailable. Please try again shortly."
      end

      return "Gemini rate limit was reached. Please try again shortly." if status_code == 429

      detail = api_message.presence || response.message.to_s.presence
      [ "Gemini returned HTTP #{response.code}", detail ].compact.join(": ")
    end

    def parsed_error_body(body)
      payload = JSON.parse(body.to_s)
      error = payload["error"] if payload.is_a?(Hash)
      error.is_a?(Hash) ? error : {}
    rescue JSON::ParserError
      {}
    end

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
      return provided_http_client if provided_http_client

      uri = URI("#{API_BASE_URL}/#{model}:generateContent")
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = true
      http.open_timeout = timeout
      http.read_timeout = timeout
      http
    end
  end
end

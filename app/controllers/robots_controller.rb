class RobotsController < ApplicationController
  # AI assistants, answer engines, and LLM crawlers explicitly welcomed so the
  # site can be read, indexed, and cited by AI search products.
  AI_CRAWLERS = %w[
    GPTBot
    OAI-SearchBot
    ChatGPT-User
    ClaudeBot
    Claude-User
    Claude-SearchBot
    anthropic-ai
    PerplexityBot
    Perplexity-User
    Google-Extended
    GoogleOther
    Gemini-Deep-Research
    Applebot
    Applebot-Extended
    Amazonbot
    CCBot
    cohere-ai
    meta-externalagent
    meta-externalfetcher
    DuckAssistBot
    MistralAI-User
    Bytespider
  ].freeze

  def show
    expires_in 1.day, public: true
    render plain: robots_body, layout: false
  end

  private

  def robots_body
    host = ENV.fetch("APP_HOST", request.host_with_port)
    protocol = request.ssl? || Rails.env.production? ? "https" : request.scheme
    base_url = "#{protocol}://#{host}"

    sitemap_file = if File.exist?(Rails.root.join("public", "sitemap.xml.gz"))
      "sitemap.xml.gz"
    else
      "sitemap.xml"
    end

    ai_crawler_rules = AI_CRAWLERS.map { |agent| "User-agent: #{agent}" }.join("\n")

    <<~ROBOTS
      # AI crawlers and assistants are welcome. A structured guide to this site
      # for language models is available at #{base_url}/llms.txt
      #{ai_crawler_rules}
      Allow: /
      Disallow: /admin/
      Disallow: /dashboard
      Disallow: /users/

      User-agent: *
      Allow: /

      Disallow: /admin/
      Disallow: /dashboard
      Disallow: /users/

      Sitemap: #{base_url}/#{sitemap_file}
    ROBOTS
  end
end

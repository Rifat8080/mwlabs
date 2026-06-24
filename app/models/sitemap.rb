class Sitemap
  STATIC_ROUTES = [
    { helper: :root_path, changefreq: "weekly", priority: "1.0" },
    { helper: :about_path, changefreq: "monthly", priority: "0.8" },
    { helper: :work_path, changefreq: "monthly", priority: "0.8" },
    { helper: :pricing_path, changefreq: "monthly", priority: "0.8" },
    { helper: :blog_path, changefreq: "weekly", priority: "0.9" },
    { helper: :contact_path, changefreq: "monthly", priority: "0.9" },
    { helper: :team_path, changefreq: "monthly", priority: "0.6" },
    { helper: :careers_path, changefreq: "monthly", priority: "0.6" },
    { helper: :testimonials_path, changefreq: "monthly", priority: "0.7" },
    { helper: :case_studies_path, changefreq: "monthly", priority: "0.7" },
    { helper: :faqs_path, changefreq: "monthly", priority: "0.7" },
    { helper: :privacy_path, changefreq: "yearly", priority: "0.3" },
    { helper: :terms_path, changefreq: "yearly", priority: "0.3" }
  ].freeze

  def self.build(request)
    new(request).build
  end

  def initialize(request)
    @request = request
    @routes = Rails.application.routes.url_helpers
  end

  def build
    static_entries + service_entries + seo_landing_entries + blog_entries
  end

  private

  attr_reader :request, :routes

  def base_url
    @base_url ||= "#{protocol}://#{host}"
  end

  def protocol
    return "https" if request.ssl? || Rails.env.production?

    request.scheme
  end

  def host
    ENV.fetch("APP_HOST", "mwlabs.digital")
  end

  def static_entries
    STATIC_ROUTES.map do |entry|
      entry_for(routes.public_send(entry[:helper]), **entry.except(:helper))
    end
  end

  def service_entries
    PagesController::SERVICES.keys.map do |slug|
      entry_for(routes.service_path(slug), changefreq: "monthly", priority: "0.8")
    end
  end

  def seo_landing_entries
    SeoLandingPages.all.map do |page|
      entry_for(
        routes.seo_landing_path(page[:slug]),
        changefreq: "monthly",
        priority: "0.7"
      )
    end
  end

  def blog_entries
    BlogPost.published.order(published_at: :desc).map do |post|
      entry_for(
        routes.blog_post_path(post.slug),
        lastmod: (post.updated_at || post.published_at)&.utc&.iso8601,
        changefreq: "weekly",
        priority: "0.7"
      )
    end
  end

  def entry_for(path, changefreq: nil, priority: nil, lastmod: nil)
    {
      loc: "#{base_url}#{path}",
      lastmod: lastmod,
      changefreq: changefreq,
      priority: priority
    }.compact
  end
end

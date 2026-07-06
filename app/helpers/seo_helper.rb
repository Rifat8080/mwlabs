module SeoHelper
  SITE_NAME = "M&W Labs".freeze
  DEFAULT_TITLE = "M&W Labs | Digital solutions that drive real growth".freeze
  CONTACT_EMAIL = "hello@mwlabs.digital".freeze
  CONTACT_PHONE = "+8801704014210".freeze

  SOCIAL_PROFILES = [
    "https://www.facebook.com/info.mwlabs/",
    "https://www.instagram.com/info.mwlabs",
    "https://www.linkedin.com/company/mwlabs",
    "https://youtube.com/@mw_labs"
  ].freeze

  FAQS = [
    [ "What services does M&W Labs offer?", "We offer web development, digital marketing, branding, video editing, AI automation and growth strategy." ],
    [ "How long does a typical project take?", "Timelines vary by scope. Landing pages may take 2-4 weeks, while full platforms can take 8-12 weeks or more." ],
    [ "Do you work with startups and enterprises?", "Yes. We tailor our approach and team structure to fit businesses at every stage." ],
    [ "How do we get started?", "Book a free strategy call through our contact page and we'll outline next steps together." ]
  ].freeze

  def site_base_url
    protocol = request.ssl? || Rails.env.production? ? "https" : request.scheme
    "#{protocol}://#{ENV.fetch('APP_HOST', request.host_with_port)}"
  end

  def page_title
    content_for(:title).presence || DEFAULT_TITLE
  end

  def canonical_url
    content_for(:canonical).presence || "#{site_base_url}#{request.path}"
  end

  def social_image_url
    content_for(:og_image).presence || "#{site_base_url}/images/mwlogo-bg.png"
  end

  def og_type
    content_for(:og_type).presence || "website"
  end

  def jsonld_tag(data)
    tag.script(ERB::Util.json_escape(data.to_json).html_safe, type: "application/ld+json")
  end

  def organization_jsonld
    {
      "@context" => "https://schema.org",
      "@type" => [ "Organization", "ProfessionalService" ],
      "@id" => "#{site_base_url}/#organization",
      "name" => SITE_NAME,
      "url" => "#{site_base_url}/",
      "logo" => "#{site_base_url}/images/mwlogo-bg.png",
      "image" => "#{site_base_url}/images/mwlogo-bg.png",
      "description" => default_meta_description,
      "email" => CONTACT_EMAIL,
      "telephone" => CONTACT_PHONE,
      "address" => {
        "@type" => "PostalAddress",
        "addressLocality" => "Demra, Dhaka",
        "addressCountry" => "BD"
      },
      "areaServed" => "Worldwide",
      "sameAs" => SOCIAL_PROFILES,
      "contactPoint" => {
        "@type" => "ContactPoint",
        "contactType" => "sales",
        "email" => CONTACT_EMAIL,
        "telephone" => CONTACT_PHONE,
        "availableLanguage" => [ "English", "Bengali" ]
      },
      "knowsAbout" => PagesHelper::SERVICE_LINKS.map(&:first)
    }
  end

  def website_jsonld
    {
      "@context" => "https://schema.org",
      "@type" => "WebSite",
      "@id" => "#{site_base_url}/#website",
      "url" => "#{site_base_url}/",
      "name" => SITE_NAME,
      "publisher" => { "@id" => "#{site_base_url}/#organization" }
    }
  end

  def faq_jsonld(faqs = FAQS)
    {
      "@context" => "https://schema.org",
      "@type" => "FAQPage",
      "mainEntity" => faqs.map do |question, answer|
        {
          "@type" => "Question",
          "name" => question,
          "acceptedAnswer" => { "@type" => "Answer", "text" => answer }
        }
      end
    }
  end

  def service_jsonld(name:, description:, url:, free: false)
    data = {
      "@context" => "https://schema.org",
      "@type" => "Service",
      "name" => name,
      "description" => description,
      "url" => url,
      "provider" => { "@id" => "#{site_base_url}/#organization" },
      "areaServed" => "Worldwide"
    }
    data["offers"] = { "@type" => "Offer", "price" => "0", "priceCurrency" => "USD" } if free
    data
  end

  def blog_post_jsonld(post)
    data = {
      "@context" => "https://schema.org",
      "@type" => "BlogPosting",
      "mainEntityOfPage" => blog_post_url(post.slug),
      "headline" => post.title,
      "description" => post.seo_description,
      "datePublished" => post.published_at&.iso8601,
      "dateModified" => (post.updated_at || post.published_at)&.iso8601,
      "author" => { "@type" => "Person", "name" => post.author.display_name },
      "publisher" => { "@id" => "#{site_base_url}/#organization" },
      "articleSection" => post.category
    }
    data["image"] = "#{site_base_url}#{blog_cover_url(post)}" if post.cover_image.attached?
    data.compact
  end
end

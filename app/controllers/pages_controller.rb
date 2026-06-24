class PagesController < ApplicationController
  layout "visitor"

  SERVICES = {
    "web-development" => {
      title: "Web & Software Development",
      eyebrow: "Web Development",
      icon: "fa-code",
      summary: "Custom websites, web apps, SaaS platforms, dashboards and business systems built for performance and scale."
    },
    "digital-marketing" => {
      title: "Digital Marketing",
      eyebrow: "Digital Marketing",
      icon: "fa-bullhorn",
      summary: "SEO, paid ads, lead generation, funnels, email and WhatsApp campaigns that turn attention into revenue."
    },
    "branding-design" => {
      title: "Branding & Design",
      eyebrow: "Branding & Design",
      icon: "fa-pen-nib",
      summary: "Logo design, brand identity, social creatives and marketing assets that make your business unforgettable."
    },
    "video-editing" => {
      title: "Video Editing & Content",
      eyebrow: "Video Editing",
      icon: "fa-clapperboard",
      summary: "Reels, YouTube videos, ads, corporate films and motion graphics crafted to engage and convert."
    },
    "ai-automation" => {
      title: "AI & Automation",
      eyebrow: "AI & Automation",
      icon: "fa-robot",
      summary: "AI chatbots, workflow automation, smart integrations and dashboards that save time and unlock growth."
    },
    "growth-strategy" => {
      title: "Growth Strategy",
      eyebrow: "Growth Strategy",
      icon: "fa-bullseye",
      summary: "Business strategy, market research, competitor analysis and scaling plans tailored to your goals."
    }
  }.freeze

  def home
    @recent_blog_posts = load_recent_blog_posts
    @blog_categories = BlogCategory.with_published_posts.ordered
  end

  def seo_landing
    @seo_page = SeoLandingPages.find(params[:slug])
    raise ActionController::RoutingError, "Not Found" if @seo_page.blank?

    @recent_blog_posts = load_recent_blog_posts
    @blog_categories = BlogCategory.with_published_posts.ordered
  end

  def about
  end

  def work
  end

  def pricing
  end

  def contact
    @lead = Lead.new(source: "Website Contact Form")
  end

  def team
  end

  def careers
  end

  def testimonials
  end

  def case_studies
  end

  def faqs
  end

  def privacy
  end

  def terms
  end

  def service
    @service = SERVICES.fetch(params[:slug])
  rescue KeyError
    raise ActionController::RoutingError, "Not Found"
  end

  private

  def load_recent_blog_posts
    BlogPost.published
      .includes(:author, :blog_category, cover_image_attachment: :blob)
      .order(published_at: :desc)
      .limit(3)
  end
end

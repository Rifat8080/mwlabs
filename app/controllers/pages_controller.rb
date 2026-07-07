class PagesController < ApplicationController
  layout "visitor"

  SERVICES = {
    "web-development" => {
      title: "Web & Software Development",
      eyebrow: "Web Development",
      icon: "fa-code",
      color: "bg-blue-600 text-white",
      accent: "blue",
      summary: "Custom websites, web apps, SaaS platforms, dashboards and business systems built for performance and scale.",
      features: [
        { icon: "fa-globe", title: "Business & Marketing Websites", body: "Fast, responsive, SEO-ready websites that convert visitors into leads and customers." },
        { icon: "fa-layer-group", title: "SaaS & Web Applications", body: "Full-stack platforms built on Ruby on Rails, React and Node.js that scale with your users." },
        { icon: "fa-cart-shopping", title: "Ecommerce Development", body: "Custom online stores and checkout flows tailored to your catalog, not a generic template." },
        { icon: "fa-gauge-high", title: "Dashboards & Internal Tools", body: "Admin panels, CRMs and reporting systems that keep your operations organized." },
        { icon: "fa-rocket", title: "MVP Development", body: "Ship a working product fast so you can validate your idea with real users." },
        { icon: "fa-wrench", title: "Maintenance & Support", body: "Ongoing updates, monitoring and bug fixes so your product stays reliable." }
      ],
      process: [
        { title: "Discover", body: "We map your goals, users and requirements into a clear technical plan." },
        { title: "Design", body: "Wireframes and UI design that balance usability with your brand." },
        { title: "Build", body: "Clean, tested code shipped in focused, visible milestones." },
        { title: "Launch & Grow", body: "Deployment, monitoring and ongoing improvements post-launch." }
      ],
      tools: [ "Ruby on Rails", "React", "Node.js", "PostgreSQL", "MongoDB", "Tailwind CSS", "AWS", "Docker" ],
      faqs: [
        { q: "How long does a website or web app take to build?", a: "A marketing website typically takes 2-3 weeks. A custom web app or MVP takes 4-10 weeks depending on scope." },
        { q: "Do you work with existing codebases?", a: "Yes, we regularly take over, audit and extend existing Rails, React and Node applications." }
      ]
    },
    "digital-marketing" => {
      title: "Digital Marketing",
      eyebrow: "Digital Marketing",
      icon: "fa-bullhorn",
      color: "bg-emerald-50 text-emerald-600",
      accent: "emerald",
      summary: "SEO, paid ads, lead generation, funnels, email and WhatsApp campaigns that turn attention into revenue.",
      features: [
        { icon: "fa-magnifying-glass-chart", title: "SEO", body: "Technical, on-page and local SEO to rank higher and win organic traffic." },
        { icon: "fa-hand-pointer", title: "Paid Ads (Google & Meta)", body: "ROI-focused ad campaigns across Google, Facebook and Instagram." },
        { icon: "fa-filter", title: "Funnels & Landing Pages", body: "Conversion-optimized funnels that turn clicks into qualified leads." },
        { icon: "fa-users", title: "Lead Generation", body: "Systems to consistently fill your pipeline with qualified prospects." },
        { icon: "fa-envelope", title: "Email Marketing", body: "Automated sequences and newsletters that nurture leads into customers." },
        { icon: "fa-comment-dots", title: "WhatsApp Campaigns", body: "Direct, high-open-rate WhatsApp marketing for updates and offers." }
      ],
      process: [
        { title: "Audit", body: "We review your current channels, funnels and analytics for gaps and opportunity." },
        { title: "Strategy", body: "A channel plan and content calendar built around your growth targets." },
        { title: "Execute", body: "Campaigns launched, tracked and optimized on an ongoing basis." },
        { title: "Report & Scale", body: "Transparent reporting so we can double down on what's working." }
      ],
      tools: [ "Google Ads", "Meta Ads", "Google Analytics", "Search Console", "Mailchimp", "HubSpot", "SEMrush", "WhatsApp Business API" ],
      faqs: [
        { q: "How soon will I see results from SEO?", a: "Most clients see meaningful ranking movement within 60-90 days, with compounding growth after." },
        { q: "What's the minimum ad budget you work with?", a: "We tailor strategy to your budget; we typically recommend a minimum of $300-500/month in ad spend for meaningful data." }
      ]
    },
    "branding-design" => {
      title: "Branding & Design",
      eyebrow: "Branding & Design",
      icon: "fa-pen-nib",
      color: "bg-purple-50 text-purple-600",
      accent: "purple",
      summary: "Logo design, brand identity, social creatives and marketing assets that make your business unforgettable.",
      features: [
        { icon: "fa-swatchbook", title: "Logo & Brand Identity", body: "A distinctive logo, color palette and typography system built for recognition." },
        { icon: "fa-book-open", title: "Brand Guidelines", body: "A complete style guide so your brand stays consistent across every touchpoint." },
        { icon: "fa-photo-film", title: "Social Media Creatives", body: "On-brand post templates, stories and ad creatives for every platform." },
        { icon: "fa-file-lines", title: "Marketing Collateral", body: "Brochures, presentations, business cards and print-ready assets." },
        { icon: "fa-object-group", title: "UI/UX Design", body: "Interface design for websites and apps that looks great and converts." },
        { icon: "fa-box-open", title: "Packaging & Print Design", body: "Packaging, labels and merchandise design aligned to your brand." }
      ],
      process: [
        { title: "Discover", body: "We learn your business, audience and positioning before designing anything." },
        { title: "Concept", body: "Multiple creative directions explored so you choose the right fit." },
        { title: "Refine", body: "Iteration rounds until the identity feels exactly right." },
        { title: "Deliver", body: "Full asset library and guidelines handed over, ready to use anywhere." }
      ],
      tools: [ "Figma", "Adobe Illustrator", "Adobe Photoshop", "Canva Pro", "Adobe InDesign" ],
      faqs: [
        { q: "How many logo concepts do I get?", a: "Standard packages include 3 initial concepts with two rounds of revisions on your chosen direction." },
        { q: "Do you deliver source files?", a: "Yes, you receive full source files (AI, PSD, Figma) plus exported formats for web and print." }
      ]
    },
    "video-editing" => {
      title: "Video Editing & Content",
      eyebrow: "Video Editing",
      icon: "fa-clapperboard",
      color: "bg-pink-50 text-pink-600",
      accent: "pink",
      summary: "Reels, YouTube videos, ads, corporate films and motion graphics crafted to engage and convert.",
      features: [
        { icon: "fa-mobile-screen", title: "Reels & Short-Form Content", body: "Scroll-stopping Reels, TikToks and Shorts edited for retention." },
        { icon: "fa-video", title: "YouTube Video Editing", body: "Full long-form edits with pacing, captions and thumbnails that drive views." },
        { icon: "fa-bullhorn", title: "Ad & Promo Videos", body: "High-converting video ads for Meta, YouTube and TikTok campaigns." },
        { icon: "fa-building", title: "Corporate & Brand Films", body: "Polished company videos, testimonials and product explainers." },
        { icon: "fa-wand-magic-sparkles", title: "Motion Graphics & Animation", body: "Animated logos, titles and graphics that add a premium feel." },
        { icon: "fa-closed-captioning", title: "Captions, Color & Sound", body: "Subtitles, color grading and sound design polished to a professional standard." }
      ],
      process: [
        { title: "Brief", body: "We align on message, tone, platform and length before editing begins." },
        { title: "Edit", body: "First cut delivered with pacing, music and captions in place." },
        { title: "Revise", body: "Focused revision rounds until the edit is exactly right." },
        { title: "Deliver", body: "Final export in every format and aspect ratio you need." }
      ],
      tools: [ "Adobe Premiere Pro", "After Effects", "DaVinci Resolve", "CapCut Pro", "Adobe Audition" ],
      faqs: [
        { q: "What's the turnaround time for a video edit?", a: "Short-form content (Reels/Shorts) typically takes 2-3 days; long-form YouTube or ad videos take 4-7 days." },
        { q: "Can you work with raw, unedited footage?", a: "Yes, send us your raw footage (or B-roll requests) and we'll handle the full edit end-to-end." }
      ]
    },
    "ai-automation" => {
      title: "AI & Automation",
      eyebrow: "AI & Automation",
      icon: "fa-robot",
      color: "bg-amber-50 text-amber-600",
      accent: "amber",
      summary: "AI chatbots, workflow automation, smart integrations and dashboards that save time and unlock growth.",
      features: [
        { icon: "fa-headset", title: "AI Chatbots & Receptionists", body: "24/7 AI assistants that qualify leads, answer questions and book calls." },
        { icon: "fa-diagram-project", title: "Workflow Automation", body: "Automate repetitive tasks across your tools using Zapier, Make and custom scripts." },
        { icon: "fa-plug", title: "Smart Integrations", body: "Connect your CRM, forms, calendars and payment tools into one system." },
        { icon: "fa-table-cells", title: "Automation Dashboards", body: "Custom dashboards that surface the metrics that matter, updated in real time." },
        { icon: "fa-address-book", title: "CRM & Lead Automation", body: "Automatic lead capture, scoring and follow-up so nothing slips through." },
        { icon: "fa-brain", title: "Custom AI Tools", body: "Purpose-built AI features using LLMs, tailored to your specific workflow." }
      ],
      process: [
        { title: "Map", body: "We document your current workflow to find the highest-impact automations." },
        { title: "Design", body: "A blueprint of tools, triggers and integrations built around your stack." },
        { title: "Build", body: "Automations and AI tools built, tested and connected to your systems." },
        { title: "Monitor", body: "Ongoing monitoring and refinement so automations keep running reliably." }
      ],
      tools: [ "Zapier", "Make", "n8n", "OpenAI / Claude APIs", "Ruby on Rails", "Twilio", "Airtable" ],
      faqs: [
        { q: "Will an AI chatbot sound robotic?", a: "No, we tune tone, scripts and guardrails specifically to your brand and typical customer questions." },
        { q: "What if I don't know what to automate?", a: "That's normal — our workflow audit identifies the manual tasks eating the most time and the quickest wins." }
      ]
    },
    "growth-strategy" => {
      title: "Growth Strategy",
      eyebrow: "Growth Strategy",
      icon: "fa-bullseye",
      color: "bg-cyan-50 text-cyan-600",
      accent: "cyan",
      summary: "Business strategy, market research, competitor analysis and scaling plans tailored to your goals.",
      features: [
        { icon: "fa-chart-line", title: "Growth Strategy & Planning", body: "A clear, prioritized roadmap tied to revenue and growth targets." },
        { icon: "fa-magnifying-glass", title: "Market Research", body: "Data-driven insight into your customers, positioning and demand." },
        { icon: "fa-chess", title: "Competitor Analysis", body: "A clear-eyed view of competitors' strengths, gaps and opportunities for you." },
        { icon: "fa-arrows-up-down-left-right", title: "Scaling Plans", body: "Operational and go-to-market plans built for sustainable scale." },
        { icon: "fa-lightbulb", title: "Product & Positioning Strategy", body: "Sharpened messaging and offers that resonate with your ideal customer." },
        { icon: "fa-people-group", title: "Fractional Advisory", body: "Ongoing strategic guidance as an extension of your leadership team." }
      ],
      process: [
        { title: "Assess", body: "A deep-dive into your business, market and current performance." },
        { title: "Strategize", body: "A prioritized growth plan with clear milestones and ownership." },
        { title: "Implement", body: "Hands-on support executing the highest-impact initiatives." },
        { title: "Review", body: "Regular check-ins to track progress and adjust the plan." }
      ],
      tools: [ "Google Analytics", "SEMrush", "Notion", "Miro", "Airtable" ],
      faqs: [
        { q: "Is this a one-time engagement or ongoing?", a: "Both are available — a one-time strategy sprint, or ongoing fractional advisory support." },
        { q: "Do you also help implement the strategy?", a: "Yes, our team can execute the plan directly through our web, marketing, design and automation services." }
      ]
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
    @projects = PortfolioProject.published
      .includes(cover_image_attachment: :blob)
      .ordered
    @featured_project = @projects.featured.first
  end

  def project
    @project = PortfolioProject.published
      .includes(cover_image_attachment: :blob, gallery_images_attachments: :blob)
      .find_by!(slug: params[:slug])

    @related_projects = PortfolioProject.published
      .includes(cover_image_attachment: :blob)
      .where(category: @project.category)
      .where.not(id: @project.id)
      .ordered
      .limit(3)
  rescue ActiveRecord::RecordNotFound
    raise ActionController::RoutingError, "Not Found"
  end

  def pricing
  end

  def free_mvp_build
  end

  def free_marketing_report
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

class SeoLandingPages
  KEYWORDS = [
    "web development agency",
    "software development agency",
    "custom software development company",
    "digital agency for startups",
    "full stack development agency",
    "remote software development agency",
    "web design and development agency",
    "custom website development services",
    "professional web development company",
    "affordable web development agency",
    "startup web development agency",
    "SaaS development agency",
    "MVP development agency",
    "MVP development company",
    "build MVP for startup",
    "startup MVP development services",
    "affordable MVP development",
    "rapid MVP development agency",
    "custom MVP app development",
    "MVP web app development",
    "Ruby on Rails development agency",
    "Ruby on Rails development company",
    "hire Ruby on Rails developers",
    "Rails web application development",
    "Ruby on Rails SaaS development",
    "Ruby on Rails MVP development",
    "Rails app development agency",
    "Ruby on Rails ecommerce development",
    "Ruby on Rails maintenance services",
    "custom Rails development services",
    "MERN stack development agency",
    "MERN stack development company",
    "hire MERN stack developers",
    "React development agency",
    "Node.js development company",
    "Express.js development services",
    "MongoDB development services",
    "MERN web app development",
    "React and Node.js development",
    "full stack MERN development",
    "AI automation agency",
    "AI automation services",
    "business automation agency",
    "AI workflow automation",
    "AI chatbot development agency",
    "AI receptionist development",
    "custom AI automation solutions",
    "AI tools for small business",
    "AI automation for agencies",
    "AI automation for startups",
    "machine learning development services",
    "custom AI software development",
    "AI lead management automation",
    "AI CRM automation",
    "AI customer support automation",
    "website design agency",
    "responsive web design services",
    "modern website design company",
    "business website design agency",
    "landing page design agency",
    "conversion focused web design",
    "UI UX design agency",
    "professional UI UX design services",
    "SaaS UI UX design",
    "startup UI UX design agency",
    "ecommerce website development",
    "ecommerce development agency",
    "custom ecommerce website development",
    "online store development services",
    "ecommerce website design company",
    "Shopify alternative custom ecommerce",
    "WooCommerce development services",
    "ecommerce automation services",
    "ecommerce CRM development",
    "ecommerce web app development",
    "CRM development company",
    "custom CRM development services",
    "lead management software development",
    "sales CRM development agency",
    "business management software development",
    "internal dashboard development",
    "admin panel development services",
    "booking system development",
    "quotation system development",
    "workflow management software development",
    "digital marketing agency",
    "SEO services for small business",
    "SEO agency for startups",
    "technical SEO services",
    "local SEO services",
    "content marketing agency",
    "social media marketing agency",
    "performance marketing agency",
    "lead generation agency",
    "B2B digital marketing agency",
    "software agency in Bangladesh",
    "web development company in Bangladesh",
    "AI automation agency Bangladesh",
    "offshore software development agency",
    "software development agency for USA and Europe"
  ].freeze

  def self.slug_for(keyword)
    keyword.parameterize
  end

  INDEX = KEYWORDS.index_by { |keyword| slug_for(keyword) }.freeze

  def self.all
    KEYWORDS.map { |keyword| build_entry(keyword) }
  end

  def self.find(slug)
    keyword = INDEX[slug]
    return if keyword.blank?

    build_entry(keyword)
  end

  def self.build_entry(keyword)
    heading = display_title(keyword)

    {
      keyword: keyword,
      heading: heading,
      slug: slug_for(keyword),
      title: page_title_for(keyword),
      description: meta_description_for(keyword),
      hero_eyebrow: heading,
      hero_intro: "M&W Labs is a trusted #{keyword} helping ambitious founders and businesses through selected MVP builds, complimentary marketing reports, powerful websites, campaigns, content, and automation for growth.",
      offer_heading: "Validate faster with a strategic #{keyword} partnership.",
      offer_body: "For selected ideas, our #{keyword} team contributes MVP builds and complimentary marketing reports so founders can validate demand, clarify positioning, and see the highest-impact growth steps with expert guidance.",
      services_heading: "What Our #{heading} Delivers",
      services_subheading: "Everything you need from a #{keyword} to grow digitally",
      why_heading: "Why Choose M&W Labs as Your #{heading}?",
      why_points: [
        "A #{keyword} focused on result-driven strategies that bring real business growth",
        "Creative, modern and conversion-focused solutions from an experienced team",
        "Transparent communication and on-time delivery on every engagement",
        "A dedicated #{keyword} team that cares about your success"
      ],
      enquiry_heading: "Tell our #{keyword} team what you want to build, market, or automate.",
      enquiry_body: "Use the quick form and our #{keyword} specialists will route your request into our CRM, prepare your client portal, and review whether an MVP partnership, growth report, or project quote is the right next step.",
      lead_form_title: "Request #{heading} support",
      lead_form_description: "Share your project goals with our #{keyword} team for MVP partnership applications, marketing report requests, website projects, campaigns, and automation ideas.",
      cta_heading: "Ready to work with a #{heading}?",
      cta_body: "Book a free strategy call with our #{keyword} team and discuss how we can help you grow.",
      lead_source: "SEO Landing: #{keyword}"
    }
  end

  def self.page_title_for(keyword)
    "#{display_title(keyword)} | M&W Labs"
  end

  def self.meta_description_for(keyword)
    "M&W Labs is a trusted #{keyword} helping founders and businesses with MVP builds, custom websites, digital marketing, branding, and AI automation. Apply for your free growth consultation."
  end

  ACRONYMS = {
    "mvp" => "MVP",
    "saas" => "SaaS",
    "mern" => "MERN",
    "crm" => "CRM",
    "seo" => "SEO",
    "ui" => "UI",
    "ux" => "UX",
    "b2b" => "B2B",
    "ai" => "AI",
    "usa" => "USA"
  }.freeze

  def self.display_title(keyword)
    keyword.split.map do |word|
      normalized = word.delete(".")
      ACRONYMS.fetch(normalized.downcase, word.capitalize)
    end.join(" ")
  end

  private_class_method :build_entry, :page_title_for, :meta_description_for, :display_title
end

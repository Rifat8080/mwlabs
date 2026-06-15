module PagesHelper
  SERVICE_LINKS = [
    [ "Web Development", "web-development" ],
    [ "Digital Marketing", "digital-marketing" ],
    [ "Branding & Design", "branding-design" ],
    [ "Video Editing", "video-editing" ],
    [ "AI & Automation", "ai-automation" ],
    [ "Growth Strategy", "growth-strategy" ]
  ].freeze

  COMPANY_LINKS = [
    [ "About Us", :about_path ],
    [ "Our Team", :team_path ],
    [ "Careers", :careers_path ],
    [ "Testimonials", :testimonials_path ],
    [ "Blog", :blog_path ],
    [ "Contact Us", :contact_path ]
  ].freeze

  RESOURCE_LINKS = [
    [ "Case Studies", :case_studies_path ],
    [ "Pricing", :pricing_path ],
    [ "FAQs", :faqs_path ],
    [ "Privacy Policy", :privacy_path ],
    [ "Terms & Conditions", :terms_path ]
  ].freeze

  NAV_LINKS = [
    [ "About Us", :about_path ],
    [ "Our Work", :work_path ],
    [ "Pricing", :pricing_path ],
    [ "Blog", :blog_path ],
    [ "Contact", :contact_path ]
  ].freeze

  def nav_link_classes(path, exact: false)
    active = exact ? current_page?(path) : current_page?(path)

    base = "block rounded-lg px-3 py-3 lg:rounded-none lg:px-1 lg:py-4 lg:hover:bg-transparent"
    active_classes = "text-blue-600 hover:bg-blue-50 lg:border-b-2 lg:border-blue-600"
    inactive_classes = "text-slate-900 hover:bg-blue-50 hover:text-blue-600"

    [ base, active ? active_classes : inactive_classes ].join(" ")
  end

  def home_nav_link_classes
    nav_link_classes(root_path, exact: true)
  end
end

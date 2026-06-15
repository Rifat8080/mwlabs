class SitemapController < ApplicationController
  layout false

  def show
    @urls = Sitemap.build(request)
    expires_in 1.hour, public: true

    render formats: :xml, content_type: "application/xml"
  end
end

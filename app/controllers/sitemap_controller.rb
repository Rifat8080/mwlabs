class SitemapController < ApplicationController
  layout false

  def show
    @urls = Sitemap.build(request)
    expires_in 1.hour, public: true

    respond_to do |format|
      format.xml
    end
  end
end

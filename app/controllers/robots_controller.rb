class RobotsController < ApplicationController
  def show
    expires_in 1.day, public: true
    render plain: robots_body, layout: false
  end

  private

  def robots_body
    host = ENV.fetch("APP_HOST", request.host_with_port)
    protocol = request.ssl? || Rails.env.production? ? "https" : request.scheme

    <<~ROBOTS
      User-agent: *
      Allow: /

      Disallow: /admin/
      Disallow: /dashboard
      Disallow: /users/

      Sitemap: #{protocol}://#{host}/sitemap.xml
    ROBOTS
  end
end

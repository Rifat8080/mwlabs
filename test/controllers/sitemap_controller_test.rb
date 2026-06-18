require "test_helper"

class SitemapControllerTest < ActionDispatch::IntegrationTest
  setup do
    @author = users(:admin)
    @published = BlogPost.create!(
      title: "Published SEO Article",
      body: "Published body for sitemap testing.",
      category: "Web Development",
      status: "Published",
      published_at: 2.days.ago,
      author: @author
    )
    BlogPost.create!(
      title: "Draft SEO Article",
      body: "Draft body for sitemap testing.",
      category: "Web Development",
      status: "Draft",
      author: @author
    )
  end

  test "sitemap returns xml with public pages and published blog posts" do
    get "/sitemap.xml", headers: { "HTTP_USER_AGENT" => "Googlebot/2.1 (+http://www.google.com/bot.html)" }

    assert_response :success
    assert_equal "application/xml", response.media_type
    assert_match(/\A<\?xml/, response.body.strip)
    assert_no_match(/<html/i, response.body)
    assert_includes response.body, "/about"
    assert_includes response.body, "/blog"
    assert_includes response.body, "/services/web-development"
    assert_match(%r{<loc>[^<]+/blog/[^<]+</loc>}, response.body)
    assert_not_includes response.body, "draft-seo-article"
  end

  test "plain sitemap path redirects to canonical xml sitemap" do
    get "/sitemap"

    assert_redirected_to "/sitemap.xml"
  end

  test "robots.txt points to sitemap and blocks private areas" do
    get robots_url

    assert_response :success
    assert_equal "text/plain", response.media_type
    assert_includes response.body, "Sitemap: http://www.example.com/sitemap.xml"
    assert_includes response.body, "Disallow: /admin/"
    assert_includes response.body, "Disallow: /dashboard"
  end
end

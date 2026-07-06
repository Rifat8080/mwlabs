require "test_helper"

class BlogPostsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @author = users(:admin)
    @category = BlogCategory.create!(name: "Web Development", position: 0)
    @published = create_blog_post!(
      title: "How to Build a High-Converting Landing Page",
      status: "Published",
      published_at: 2.days.ago
    )
    @draft = create_blog_post!(
      title: "Draft Post",
      status: "Draft",
      published_at: nil,
      slug: "draft-post"
    )
  end

  test "index shows published posts only" do
    get blog_url

    assert_response :success
    assert_select "h1", text: /Insights on Digital Growth/
    assert_select "h2", text: @published.title
    assert_select "h2", text: @draft.title, count: 0
  end

  test "index filters by category slug from published posts" do
    marketing_category = BlogCategory.create!(name: "Custom Growth Category", position: 1)
    marketing = create_blog_post!(
      title: "Marketing Channels for SaaS",
      blog_category: marketing_category,
      status: "Published",
      published_at: 1.day.ago
    )

    get blog_url(category: marketing_category.slug)

    assert_response :success
    assert_select "h2", text: marketing.title
    assert_select "a[href='#{blog_path(category: marketing_category.slug)}']"
  end

  test "index shows only categories with published posts" do
    hidden_category = BlogCategory.create!(name: "Hidden Draft Category", position: 2)
    create_blog_post!(
      title: "Draft Category Post",
      blog_category: hidden_category,
      status: "Draft"
    )

    get blog_url

    assert_response :success
    assert_select "a[href='#{blog_path(category: hidden_category.slug)}']", count: 0
  end

  test "show resolves published post by slug" do
    get blog_post_url(@published.slug)

    assert_response :success
    assert_select "h1", text: @published.title
    assert_select "meta[name='description']"
    assert_select ".trix-content"
  end

  test "show includes BlogPosting structured data and article social tags" do
    get blog_post_url(@published.slug)

    assert_response :success
    assert_select "meta[property='og:type'][content='article']"
    assert_match(/"@type":"BlogPosting"/, response.body)
    assert_match(/"headline":/, response.body)
  end

  test "show returns not found for draft posts" do
    get blog_post_url(@draft.slug)

    assert_response :not_found
  end

  private

  def create_blog_post!(attrs = {})
    BlogPost.create!({
      title: "Sample Post",
      body: "Sample body with enough words for testing.",
      blog_category: @category,
      status: "Draft",
      author: @author
    }.merge(attrs))
  end
end

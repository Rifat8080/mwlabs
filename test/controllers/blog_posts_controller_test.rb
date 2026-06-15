require "test_helper"

class BlogPostsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @author = users(:admin)
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

  test "index filters by category" do
    marketing = create_blog_post!(
      title: "Marketing Channels for SaaS",
      category: "Digital Marketing",
      status: "Published",
      published_at: 1.day.ago
    )

    get blog_url(category: "Digital Marketing")

    assert_response :success
    assert_select "h2", text: marketing.title
    assert_select "h2", text: @published.title, count: 0
  end

  test "show resolves published post by slug" do
    get blog_post_url(@published.slug)

    assert_response :success
    assert_select "h1", text: @published.title
    assert_select "meta[name='description']"
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
      category: "Web Development",
      status: "Draft",
      author: @author
    }.merge(attrs))
  end
end

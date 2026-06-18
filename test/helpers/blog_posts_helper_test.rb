require "test_helper"

class BlogPostsHelperTest < ActionView::TestCase
  include BlogPostsHelper
  include Rails.application.routes.url_helpers

  setup do
    @author = users(:admin)
    @post = BlogPost.create!(
      title: "Cover Image Post",
      body: "Body content for the blog post.",
      category: "Web Development",
      status: "Published",
      published_at: 1.day.ago,
      author: @author
    )
    @post.cover_image.attach(
      io: StringIO.new("fake image bytes"),
      filename: "cover.png",
      content_type: "image/png"
    )
  end

  test "blog_cover_image renders original blob path" do
    html = blog_cover_image(@post, class: "w-full")

    assert_includes html, "/rails/active_storage/blobs/"
    assert_includes html, 'class="w-full"'
    assert_includes html, @post.title
  end

  test "blog_cover_url returns original blob path" do
    url = blog_cover_url(@post)

    assert_includes url, "/rails/active_storage/blobs/"
  end
end

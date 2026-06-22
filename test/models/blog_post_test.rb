require "test_helper"

class BlogPostTest < ActiveSupport::TestCase
  setup do
    @author = users(:admin)
    @category = BlogCategory.create!(name: "Web Development", position: 0)
  end

  test "generates unique slug from title" do
    first = create_post!(title: "How to Grow Online")
    second = create_post!(title: "How to Grow Online")

    assert_equal "how-to-grow-online", first.slug
    assert_equal "how-to-grow-online-2", second.slug
  end

  test "published scope includes only live published posts" do
    live = create_post!(status: "Published", published_at: 1.day.ago)
    create_post!(status: "Draft")
    create_post!(status: "Published", published_at: 1.day.from_now, title: "Future Post")

    assert_includes BlogPost.published, live
    assert_equal 1, BlogPost.published.count
  end

  test "read time is at least one minute" do
    post = create_post!(body: "one two three four five")

    assert_equal 1, post.read_time_minutes
  end

  test "syncs published_at when status is published" do
    post = BlogPost.new(
      title: "Launch Guide",
      body: "Content",
      blog_category: @category,
      status: "Published",
      author: @author
    )

    assert post.valid?
    assert post.published_at.present?
  end

  test "filters by category slug" do
    marketing = BlogCategory.create!(name: "Custom Growth Category", position: 3)
    matching = create_post!(title: "Marketing Post", blog_category: marketing, status: "Published", published_at: 1.day.ago)
    create_post!(title: "Other Post", status: "Published", published_at: 1.day.ago)

    results = BlogPost.published.by_category(marketing.slug)

    assert_includes results, matching
    assert_equal 1, results.count
  end

  test "rejects cover images larger than 25 MB" do
    post = create_post!
    post.cover_image.attach(
      io: StringIO.new("x" * (BlogPost::COVER_IMAGE_MAX_SIZE + 1)),
      filename: "large.png",
      content_type: "image/png"
    )

    assert_not post.valid?
    assert_includes post.errors[:cover_image], "must be smaller than 25 MB"
  end

  private

  def create_post!(attrs = {})
    BlogPost.create!({
      title: "Sample Post",
      body: "Sample body with enough words for testing.",
      blog_category: @category,
      status: "Draft",
      author: @author
    }.merge(attrs))
  end
end

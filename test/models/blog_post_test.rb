require "test_helper"

class BlogPostTest < ActiveSupport::TestCase
  setup do
    @author = users(:admin)
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
      category: "Web Development",
      status: "Published",
      author: @author
    )

    assert post.valid?
    assert post.published_at.present?
  end

  test "published categories come from live posts only" do
    create_post!(title: "Live Post", category: "Custom Category", status: "Published", published_at: 1.day.ago)
    create_post!(title: "Draft Post", category: "Hidden Category", status: "Draft")

    assert_includes BlogPost.published_categories, "Custom Category"
    assert_not_includes BlogPost.published_categories, "Hidden Category"
  end

  private

  def create_post!(attrs = {})
    BlogPost.create!({
      title: "Sample Post",
      body: "Sample body with enough words for testing.",
      category: "Web Development",
      status: "Draft",
      author: @author
    }.merge(attrs))
  end
end

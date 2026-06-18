require "test_helper"

class BlogCategoryTest < ActiveSupport::TestCase
  test "generates slug from name" do
    category = BlogCategory.create!(name: "Growth Strategy", position: 1)

    assert_equal "growth-strategy", category.slug
  end

  test "with published posts returns only categories used by live posts" do
    author = users(:admin)
    visible = BlogCategory.create!(name: "Visible Category", position: 1)
    hidden = BlogCategory.create!(name: "Hidden Category", position: 2)

    BlogPost.create!(
      title: "Visible Post",
      body: "Published body",
      blog_category: visible,
      status: "Published",
      published_at: 1.day.ago,
      author: author
    )
    BlogPost.create!(
      title: "Draft Post",
      body: "Draft body",
      blog_category: hidden,
      status: "Draft",
      author: author
    )

    names = BlogCategory.with_published_posts.pluck(:name)

    assert_includes names, "Visible Category"
    assert_not_includes names, "Hidden Category"
  end
end

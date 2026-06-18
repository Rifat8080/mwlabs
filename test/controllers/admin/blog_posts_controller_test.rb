require "test_helper"

module Admin
  class BlogPostsControllerTest < ActionDispatch::IntegrationTest
    setup do
      @admin = users(:admin)
      @team_member = users(:team_member)
      @client_user = users(:client)
      @category = BlogCategory.create!(name: "Growth Strategy", position: 0)
      @web_category = BlogCategory.create!(name: "Web Development", position: 1)
    end

    test "admin can create blog post with cover image" do
      sign_in @admin

      assert_difference -> { BlogPost.count }, 1 do
        post admin_blog_posts_url, params: {
          blog_post: {
            title: "New Growth Article",
            body: "<div>Detailed article body for the public blog.</div>",
            blog_category_id: @category.id,
            status: "Published",
            excerpt: "A short summary.",
            featured: true,
            cover_image: uploaded_image
          }
        }
      end

      post = BlogPost.order(:created_at).last

      assert_redirected_to admin_blog_post_url(post)
      assert_equal @admin, post.author
      assert_equal "new-growth-article", post.slug
      assert post.published_at.present?
      assert post.cover_image.attached?
      assert_includes post.body.to_s, "Detailed article body"
    end

    test "admin can update blog post cover image" do
      sign_in @admin
      post = BlogPost.create!(
        title: "Article To Update",
        body: "Published body content.",
        blog_category: @web_category,
        status: "Draft",
        author: @admin
      )

      patch admin_blog_post_url(post), params: {
        blog_post: {
          title: post.title,
          body: post.body.to_s,
          blog_category_id: post.blog_category_id,
          status: "Published",
          cover_image: uploaded_image("updated-cover.png")
        }
      }

      assert_redirected_to admin_blog_post_url(post)
      assert post.reload.cover_image.attached?
      assert_equal "updated-cover.png", post.cover_image.filename.to_s
    end

    test "team member can access blog admin" do
      sign_in @team_member

      get admin_blog_posts_url

      assert_response :success
      assert_select "h1", text: /Blog/
    end

    test "client cannot access blog admin" do
      sign_in @client_user

      get admin_blog_posts_url

      assert_redirected_to dashboard_root_url
      follow_redirect!
      assert_match(/do not have access/i, flash[:alert].to_s)
    end

    test "admin show page includes live post link for published posts" do
      sign_in @admin
      post = BlogPost.create!(
        title: "Published Article",
        body: "Published body content.",
        blog_category: @web_category,
        status: "Published",
        published_at: 1.day.ago,
        author: @admin
      )

      get admin_blog_post_url(post)

      assert_response :success
      assert_select "a[href='#{blog_post_path(post.slug)}']", text: /View live post/
    end

    private

    def uploaded_image(filename = "cover.png")
      Rack::Test::UploadedFile.new(StringIO.new("fake image"), "image/png", original_filename: filename)
    end
  end
end

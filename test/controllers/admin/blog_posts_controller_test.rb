require "test_helper"

module Admin
  class BlogPostsControllerTest < ActionDispatch::IntegrationTest
    setup do
      @admin = users(:admin)
      @team_member = users(:team_member)
      @client_user = users(:client)
    end

    test "admin can create blog post" do
      sign_in @admin

      assert_difference -> { BlogPost.count }, 1 do
        post admin_blog_posts_url, params: {
          blog_post: {
            title: "New Growth Article",
            body: "Detailed article body for the public blog.",
            category: "Growth Strategy",
            status: "Published",
            excerpt: "A short summary.",
            featured: true
          }
        }
      end

      post = BlogPost.order(:created_at).last

      assert_redirected_to admin_blog_post_url(post)
      assert_equal @admin, post.author
      assert_equal "new-growth-article", post.slug
      assert post.published_at.present?
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
        category: "Web Development",
        status: "Published",
        published_at: 1.day.ago,
        author: @admin
      )

      get admin_blog_post_url(post)

      assert_response :success
      assert_select "a[href='#{blog_post_path(post.slug)}']", text: /View live post/
    end
  end
end

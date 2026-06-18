require "test_helper"

module Admin
  class BlogCategoriesControllerTest < ActionDispatch::IntegrationTest
    setup do
      @admin = users(:admin)
      @team_member = users(:team_member)
    end

    test "admin can create blog category" do
      sign_in @admin

      assert_difference -> { BlogCategory.count }, 1 do
        post admin_blog_categories_url, params: {
          blog_category: {
            name: "Product Updates",
            position: 4
          }
        }
      end

      category = BlogCategory.order(:created_at).last

      assert_redirected_to admin_blog_category_url(category)
      assert_equal "product-updates", category.slug
    end

    test "team member can view categories but not create them" do
      sign_in @team_member

      get admin_blog_categories_url
      assert_response :success

      post admin_blog_categories_url, params: {
        blog_category: { name: "Blocked Category", position: 1 }
      }

      assert_redirected_to admin_blog_categories_url
      follow_redirect!
      assert_match(/cannot make changes/i, flash[:alert].to_s)
    end
  end
end

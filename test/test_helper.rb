ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"

module ActiveSupport
  class TestCase
    # Run tests in parallel with specified workers
    parallelize(workers: :number_of_processors)

    # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
    fixtures :all

    # Add more helper methods to be used by all tests here...
    def create_blog_category!(attrs = {})
      name = attrs[:name] || "Web Development"
      BlogCategory.find_or_create_by!(name: name) do |category|
        category.position = attrs[:position] || 0
        category.slug = name.parameterize
      end
    end

    def create_blog_post_for_tests!(attrs = {})
      author = attrs.delete(:author) || users(:admin)
      category = attrs.delete(:blog_category) || create_blog_category!
      BlogPost.create!({
        title: "Sample Post",
        body: "Sample body with enough words for testing.",
        blog_category: category,
        status: "Draft",
        author: author
      }.merge(attrs))
    end

    def create_portfolio_project_for_tests!(attrs = {})
      title = attrs[:title] || "Sample Project #{PortfolioProject.count + 1}"
      PortfolioProject.create!({
        title: title,
        client_name: "Acme",
        category: "Web Development",
        summary: "Sample project summary",
        status: "Published"
      }.merge(attrs))
    end
  end
end

class ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers
end

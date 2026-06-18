class MigrateBlogPostsToCategoriesAndRichText < ActiveRecord::Migration[8.0]
  class MigrationBlogCategory < ApplicationRecord
    self.table_name = "blog_categories"
  end

  class MigrationBlogPost < ApplicationRecord
    self.table_name = "blog_posts"
  end

  DEFAULT_CATEGORIES = [
    "Web Development",
    "Digital Marketing",
    "Branding & Design",
    "Video Editing",
    "AI Automation",
    "Growth Strategy"
  ].freeze

  def up
    add_reference :blog_posts, :blog_category, type: :uuid, foreign_key: true

    seed_categories
    backfill_blog_categories
    migrate_bodies_to_rich_text

    change_column_null :blog_posts, :blog_category_id, false
    remove_column :blog_posts, :category, :string
    remove_column :blog_posts, :body, :text
  end

  def down
    add_column :blog_posts, :category, :string
    add_column :blog_posts, :body, :text

    MigrationBlogPost.reset_column_information
    MigrationBlogCategory.reset_column_information

    MigrationBlogPost.find_each do |post|
      category = MigrationBlogCategory.find_by(id: post.blog_category_id)
      rich_body = ActionText::RichText.find_by(record_type: "BlogPost", record_id: post.id, name: "body")

      post.update_columns(
        category: category&.name,
        body: rich_body&.body&.to_plain_text
      )
      rich_body&.destroy
    end

    remove_reference :blog_posts, :blog_category, type: :uuid, foreign_key: true
    MigrationBlogCategory.delete_all
  end

  private

  def seed_categories
    DEFAULT_CATEGORIES.each_with_index do |name, index|
      MigrationBlogCategory.find_or_create_by!(name: name) do |category|
        category.slug = name.parameterize
        category.position = index
      end
    end

    distinct_categories.each_with_index do |name, index|
      MigrationBlogCategory.find_or_create_by!(name: name) do |category|
        category.slug = unique_slug_for(name)
        category.position = DEFAULT_CATEGORIES.length + index
      end
    end
  end

  def distinct_categories
    say_with_time "collecting blog post categories" do
      connection.select_values("SELECT DISTINCT category FROM blog_posts WHERE category IS NOT NULL AND category <> ''")
    end
  end

  def backfill_blog_categories
    say_with_time "backfilling blog_category_id" do
      MigrationBlogPost.reset_column_information

      MigrationBlogPost.find_each do |post|
        category = MigrationBlogCategory.find_by(name: post.read_attribute(:category))
        post.update_column(:blog_category_id, category.id) if category
      end
    end
  end

  def migrate_bodies_to_rich_text
    say_with_time "migrating blog bodies to Action Text" do
      connection.select_all("SELECT id, body FROM blog_posts").each do |row|
        next if row["body"].blank?

        html_body = "<div>#{ERB::Util.html_escape(row["body"]).gsub(/\r?\n/, "<br>")}</div>"
        ActionText::RichText.create!(
          name: "body",
          record_type: "BlogPost",
          record_id: row["id"],
          body: html_body
        )
      end
    end
  end

  def unique_slug_for(name)
    base = name.to_s.parameterize
    slug = base
    suffix = 2

    while MigrationBlogCategory.exists?(slug: slug)
      slug = "#{base}-#{suffix}"
      suffix += 1
    end

    slug
  end
end

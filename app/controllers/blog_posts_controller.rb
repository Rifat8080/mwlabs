class BlogPostsController < ApplicationController
  layout "visitor"

  def index
    @posts = BlogPost.published.includes(:author, :blog_category, cover_image_attachment: :blob).order(published_at: :desc)
    @selected_category = params[:category].presence
    @posts = @posts.by_category(@selected_category) if @selected_category
    @featured_post = BlogPost.published.featured.includes(:author, :blog_category, cover_image_attachment: :blob).order(published_at: :desc).first
    @featured_post ||= @posts.first
    @categories = BlogCategory.with_published_posts.ordered
  end

  def show
    @post = BlogPost.published.includes(:blog_category).find_by!(slug: params[:slug])
    authorize! :read, @post
    @related_posts = BlogPost.published
      .includes(:blog_category, cover_image_attachment: :blob)
      .where(blog_category: @post.blog_category)
      .where.not(id: @post.id)
      .order(published_at: :desc)
      .limit(3)
  end
end

class BlogPostsController < ApplicationController
  layout "visitor"

  def index
    @posts = BlogPost.published.includes(:author, cover_image_attachment: :blob).order(published_at: :desc)
    @selected_category = params[:category].presence
    @posts = @posts.by_category(@selected_category) if @selected_category
    @featured_post = BlogPost.published.featured.includes(:author, cover_image_attachment: :blob).order(published_at: :desc).first
    @featured_post ||= @posts.first
    @categories = BlogPost.published_categories
  end

  def show
    @post = BlogPost.published.find_by!(slug: params[:slug])
    authorize! :read, @post
    @related_posts = BlogPost.published
      .where.not(id: @post.id)
      .where(category: @post.category)
      .order(published_at: :desc)
      .limit(3)
  end
end

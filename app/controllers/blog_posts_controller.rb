class BlogPostsController < ApplicationController
  layout "visitor"

  def index
    @posts = BlogPost.published.includes(:author).order(published_at: :desc)
    @selected_category = params[:category].presence
    @posts = @posts.by_category(@selected_category) if @selected_category
    @featured_post = BlogPost.published.featured.order(published_at: :desc).first || @posts.first
    @categories = BlogPost::CATEGORIES
  end

  def show
    @post = BlogPost.published.find_by!(slug: params[:slug])
    @related_posts = BlogPost.published
      .where.not(id: @post.id)
      .where(category: @post.category)
      .order(published_at: :desc)
      .limit(3)
  end
end

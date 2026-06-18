module BlogPostsHelper
  def blog_cover_image(post, resize:, **options)
    return unless post.cover_image.attached?

    image = if variant_processor_available?
      post.cover_image.variant(resize_to_limit: resize)
    else
      post.cover_image
    end

    image_tag image, **options
  end

  private

  def variant_processor_available?
    Rails.application.config.active_storage.variant_processor.present?
  rescue StandardError
    false
  end
end

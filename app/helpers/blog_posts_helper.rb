module BlogPostsHelper
  def blog_cover_image(post, resize: nil, **options)
    return unless post.cover_image.attached?

    options = options.reverse_merge(alt: post.title)

    if resize.present? && variant_processor_available?
      begin
        return image_tag post.cover_image.variant(resize_to_limit: resize), **options
      rescue StandardError => e
        Rails.logger.warn("Blog cover variant failed, using original: #{e.message}")
      end
    end

    image_tag rails_blob_path(post.cover_image, only_path: true), **options
  end

  def blog_cover_url(post, resize: nil)
    return unless post.cover_image.attached?

    if resize.present? && variant_processor_available?
      begin
        return url_for(post.cover_image.variant(resize_to_limit: resize))
      rescue StandardError
        # Fall through to original blob URL.
      end
    end

    rails_blob_path(post.cover_image, only_path: true)
  end

  private

  def variant_processor_available?
    Rails.application.config.active_storage.variant_processor.present?
  rescue StandardError
    false
  end
end

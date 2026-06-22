module Admin
  class BlogPostsController < ResourceController
    configure(
      model: BlogPost,
      title: "Blog",
      description: "Publish insights, updates, and growth strategies for the public blog.",
      columns: %i[ title blog_category status published_at featured author ],
      includes: [ :author, :blog_category ],
      fields: [
        { name: :title, type: :text },
        { name: :slug, type: :text, hint: "Auto-generated from the title when left blank." },
        { name: :excerpt, type: :textarea, hint: "Short summary for cards and SEO fallback." },
        { name: :body, type: :rich_text, hint: "Use headings, lists, quotes, links, fonts, sizes, and colors. Inline images can be up to 25 MB." },
        { name: :blog_category_id, type: :select, collection: -> { BlogCategory.ordered.pluck(:name, :id) }, hint: "Create categories under Blog Categories in the sidebar." },
        { name: :status, type: :select, collection: BlogPost::STATUSES },
        { name: :published_at, type: :datetime_local },
        { name: :featured, type: :checkbox },
        { name: :cover_image, type: :file, hint: "PNG, JPG, GIF, or WebP up to 25 MB. Recommended size: 1600×900 or larger." },
        { name: :meta_title, type: :text },
        { name: :meta_description, type: :textarea }
      ]
    )

    def create
      @resource = resource_model.new(blog_post_attributes)
      prepare_resource
      authorize! :manage, @resource
      attach_cover_image(@resource)

      if cover_image_upload_failed? || @resource.errors.any?
        render_cover_image_failure(:new)
      elsif @resource.save
        record_activity("Created")
        redirect_to polymorphic_path([ :admin, @resource ]), notice: "#{resource_title.singularize} created."
      else
        prepare_resource
        render "admin/resources/new", status: :unprocessable_entity
      end
    end

    def update
      prepare_resource
      attach_cover_image(@resource)

      if cover_image_upload_failed? || @resource.errors.any?
        render_cover_image_failure(:edit)
      elsif @resource.update(blog_post_attributes)
        record_activity("Updated")
        redirect_to polymorphic_path([ :admin, @resource ]), notice: "#{resource_title.singularize} updated."
      else
        prepare_resource
        render "admin/resources/edit", status: :unprocessable_entity
      end
    end

    protected

    def prepare_resource
      @resource.author ||= current_user
    end

    private

    def blog_post_attributes
      resource_params.except(:cover_image)
    end

    def attach_cover_image(resource)
      return unless valid_cover_upload?

      file = cover_image_param

      unless file.content_type.in?(BlogPost::COVER_IMAGE_CONTENT_TYPES)
        resource.errors.add(:cover_image, "must be a PNG, JPG, GIF, or WebP image")
        return
      end

      if file.size > BlogPost::COVER_IMAGE_MAX_SIZE
        resource.errors.add(:cover_image, "must be smaller than #{ActiveSupport::NumberHelper.number_to_human_size(BlogPost::COVER_IMAGE_MAX_SIZE)}")
        return
      end

      resource.cover_image.attach(file)
    end

    def cover_image_param
      params.dig(:blog_post, :cover_image)
    end

    def cover_image_upload_requested?
      params.dig(:blog_post, :cover_image_upload_requested) == "1"
    end

    def valid_cover_upload?
      file = cover_image_param
      file.is_a?(ActionDispatch::Http::UploadedFile) && file.size.positive?
    end

    def cover_image_upload_failed?
      return false unless cover_image_upload_requested?
      return false if valid_cover_upload?

      @resource.errors.add(
        :cover_image,
        "could not be uploaded. Choose an image under 25 MB (PNG, JPG, GIF, or WebP) and try again."
      )
      true
    end

    def render_cover_image_failure(template)
      prepare_resource
      render "admin/resources/#{template}", status: :unprocessable_entity
    end
  end
end

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
        { name: :body, type: :rich_text, hint: "Format text with headings, bold, lists, quotes, and links." },
        { name: :blog_category_id, type: :select, collection: -> { BlogCategory.ordered.pluck(:name, :id) }, hint: "Create categories under Blog Categories in the sidebar." },
        { name: :status, type: :select, collection: BlogPost::STATUSES },
        { name: :published_at, type: :datetime_local },
        { name: :featured, type: :checkbox },
        { name: :cover_image, type: :file },
        { name: :meta_title, type: :text },
        { name: :meta_description, type: :textarea }
      ]
    )

    def create
      @resource = resource_model.new(resource_params)
      prepare_resource
      authorize! :manage, @resource

      if @resource.save
        record_activity("Created")
        redirect_to polymorphic_path([ :admin, @resource ]), notice: "#{resource_title.singularize} created."
      else
        prepare_resource
        render "admin/resources/new", status: :unprocessable_entity
      end
    end

    protected

    def prepare_resource
      @resource.author ||= current_user
    end
  end
end

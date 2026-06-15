module Admin
  class BlogPostsController < ResourceController
    configure(
      model: BlogPost,
      title: "Blog",
      description: "Publish insights, updates, and growth strategies for the public blog.",
      columns: %i[ title category status published_at featured author ],
      includes: [ :author ],
      fields: [
        { name: :title, type: :text },
        { name: :slug, type: :text, hint: "Auto-generated from the title when left blank." },
        { name: :excerpt, type: :textarea, hint: "Short summary for cards and SEO fallback." },
        { name: :body, type: :textarea },
        { name: :category, type: :select, collection: BlogPost::CATEGORIES },
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

    def team_member_scope
      BlogPost.all
    end
  end
end

module Admin
  class BlogCategoriesController < ResourceController
    configure(
      model: BlogCategory,
      title: "Blog Categories",
      description: "Create and organize the categories used on public blog posts.",
      columns: %i[ name slug position ],
      includes: [],
      fields: [
        { name: :name, type: :text, hint: "Display name shown on the blog." },
        { name: :slug, type: :text, hint: "URL-friendly name. Auto-generated when left blank." },
        { name: :description, type: :textarea, hint: "Optional internal note about this category." },
        { name: :position, type: :number, hint: "Lower numbers appear first in category filters." }
      ]
    )

    def destroy
      if @resource.blog_posts.exists?
        redirect_to polymorphic_path([ :admin, @resource ]), alert: "This category still has blog posts. Reassign or delete those posts first."
        return
      end

      super
    end
  end
end

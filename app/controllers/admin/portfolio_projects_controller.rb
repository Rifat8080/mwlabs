module Admin
  class PortfolioProjectsController < ResourceController
    before_action :set_resource, only: %i[ show edit update destroy remove_gallery_image ]

    configure(
      model: PortfolioProject,
      title: "Portfolio",
      description: "Showcase recent client work as a live, filterable case-study gallery on the public site.",
      columns: %i[ title category client_name status featured display_order ],
      fields: [
        { name: :title, type: :text },
        { name: :slug, type: :text, hint: "Auto-generated from the title when left blank." },
        { name: :client_name, type: :text },
        { name: :category, type: :select, collection: PortfolioProject::CATEGORIES },
        { name: :summary, type: :textarea, hint: "Short pitch shown on the project card (1-2 sentences)." },
        { name: :story, type: :rich_text, hint: "The full case study: challenge, approach, and outcome." },
        { name: :project_url, type: :text, hint: "Live site or app link, shown as \"Visit Live Site\"." },
        { name: :technologies, type: :text, hint: "Comma-separated, e.g. Ruby on Rails, React, Tailwind CSS" },
        { name: :result_metric_value, label: "Result number", type: :number, hint: "e.g. 312 for \"312% increase\"" },
        { name: :result_metric_suffix, label: "Result suffix", type: :text, hint: "e.g. %, x, +" },
        { name: :result_metric_label, label: "Result label", type: :text, hint: "e.g. increase in qualified leads" },
        { name: :completed_on, type: :date },
        { name: :status, type: :select, collection: PortfolioProject::STATUSES },
        { name: :featured, type: :checkbox, hint: "Featured projects are highlighted first on the Work page." },
        { name: :display_order, type: :number, hint: "Lower numbers appear first." },
        { name: :cover_image, type: :file, hint: "Main card and hero image. PNG, JPG, GIF, or WebP up to 25 MB." },
        { name: :gallery_images, type: :file, hint: "Extra screenshots for the live gallery slideshow on the case study page. Select multiple files." }
      ]
    )

    def create
      @resource = resource_model.new(portfolio_project_attributes)
      prepare_resource
      authorize! :manage, @resource
      attach_images(@resource)

      if image_upload_failed? || @resource.errors.any?
        render_image_failure(:new)
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
      attach_images(@resource)

      if image_upload_failed? || @resource.errors.any?
        render_image_failure(:edit)
      elsif @resource.update(portfolio_project_attributes)
        record_activity("Updated")
        redirect_to polymorphic_path([ :admin, @resource ]), notice: "#{resource_title.singularize} updated."
      else
        prepare_resource
        render "admin/resources/edit", status: :unprocessable_entity
      end
    end

    def remove_gallery_image
      image = @resource.gallery_images.find(params[:gallery_image_id])
      image.purge
      redirect_to edit_admin_portfolio_project_path(@resource), notice: "Gallery image removed."
    end

    private

    def portfolio_project_attributes
      resource_params.except(:cover_image, :gallery_images)
    end

    def attach_images(resource)
      attach_cover_image(resource)
      attach_gallery_images(resource)
    end

    def attach_cover_image(resource)
      return unless valid_upload?(cover_image_param)

      file = cover_image_param

      unless file.content_type.in?(PortfolioProject::IMAGE_CONTENT_TYPES)
        resource.errors.add(:cover_image, "must be a PNG, JPG, GIF, or WebP image")
        return
      end

      if file.size > PortfolioProject::COVER_IMAGE_MAX_SIZE
        resource.errors.add(:cover_image, "must be smaller than #{ActiveSupport::NumberHelper.number_to_human_size(PortfolioProject::COVER_IMAGE_MAX_SIZE)}")
        return
      end

      resource.cover_image.attach(file)
    end

    def attach_gallery_images(resource)
      gallery_files.each do |file|
        next unless valid_upload?(file)

        unless file.content_type.in?(PortfolioProject::IMAGE_CONTENT_TYPES)
          resource.errors.add(:gallery_images, "must all be PNG, JPG, GIF, or WebP images")
          next
        end

        resource.gallery_images.attach(file)
      end
    end

    def cover_image_param
      params.dig(:portfolio_project, :cover_image)
    end

    def gallery_files
      Array(params.dig(:portfolio_project, :gallery_images)).compact_blank
    end

    def valid_upload?(file)
      file.is_a?(ActionDispatch::Http::UploadedFile) && file.size.positive?
    end

    def image_upload_failed?
      @resource.errors.any? { |error| error.attribute.in?(%i[cover_image gallery_images]) }
    end

    def render_image_failure(template)
      prepare_resource
      render "admin/resources/#{template}", status: :unprocessable_entity
    end
  end
end

module Admin
  class MarketingItemsController < ResourceController
    before_action :set_resource, only: %i[ show edit update destroy move ai_rewrite ]

    configure(
      model: MarketingItem,
      title: "Marketing Planner",
      description: "Plan every piece of content from idea to published post, across every platform.",
      columns: %i[ title platform content_type status publish_on ],
      fields: [
        { name: :title, type: :text },
        { name: :platform, type: :select, collection: MarketingItem::PLATFORMS },
        { name: :content_type, type: :text, hint: "e.g. Post, Reel, Carousel, Article, Newsletter" },
        { name: :topic, type: :text },
        { name: :description, type: :textarea },
        { name: :target_audience, type: :text },
        { name: :keywords, type: :text, hint: "Comma-separated" },
        { name: :hashtags, type: :text, hint: "Comma-separated" },
        { name: :cta, label: "Call to action", type: :text },
        { name: :publish_on, label: "Publishing date", type: :date },
        { name: :status, type: :select, collection: MarketingItem::STATUSES },
        { name: :notes, type: :textarea }
      ]
    )

    def index
      @resources = filtered_scope.includes(resource_includes).order(position: :asc, publish_on: :asc, created_at: :desc)
      render "admin/resources/index"
    end

    def calendar
      @month = parse_month(params[:month])
      @items_by_date = resource_scope.where(publish_on: @month.beginning_of_month..@month.end_of_month)
        .group_by(&:publish_on)
      render "admin/marketing_items/calendar"
    end

    def move
      @resource.update(publish_on: params[:publish_on].presence || @resource.publish_on)

      respond_to do |format|
        format.turbo_stream do
          @month = parse_month(params[:month])
          @items_by_date = resource_scope.where(publish_on: @month.beginning_of_month..@month.end_of_month).group_by(&:publish_on)
          render turbo_stream: turbo_stream.replace("marketing-calendar", partial: "admin/marketing_items/calendar_grid", locals: { month: @month, items_by_date: @items_by_date })
        end
        format.html { redirect_to calendar_admin_marketing_items_path }
      end
    end

    def ai_generate
      service = params[:service].to_s.strip
      audience = params[:audience].to_s.strip
      platform = params[:platform].to_s.strip
      goal = params[:goal].to_s.strip

      if [ service, audience, platform, goal ].any?(&:blank?)
        redirect_to admin_marketing_items_path, alert: "Fill in service, audience, platform, and goal to generate ideas." and return
      end

      result = Ai::MarketingAssistant.new.content_ideas(service: service, audience: audience, platform: platform, goal: goal)

      respond_to do |format|
        format.turbo_stream do
          render turbo_stream: turbo_stream.replace("marketing-ai-ideas", partial: "admin/marketing_items/ai_ideas", locals: { content: result[:content] })
        end
        format.html { redirect_to admin_marketing_items_path }
      end
    rescue Ai::GeminiClient::Error, Ai::UsageTracker::RateLimitError => e
      respond_to do |format|
        format.turbo_stream { render turbo_stream: turbo_stream.replace("marketing-ai-ideas", partial: "admin/marketing_items/ai_error", locals: { message: e.message }) }
        format.html { redirect_to admin_marketing_items_path, alert: e.message }
      end
    end

    def ai_rewrite
      instruction = params[:instruction].presence_in(Ai::ContentGenerator::INSTRUCTIONS.keys) || "draft"
      result = Ai::MarketingAssistant.new.generate_post(
        platform: @resource.platform.presence || "LinkedIn",
        topic: @resource.topic.presence || @resource.title,
        instruction: instruction,
        previous_content: @resource.description
      )

      respond_to do |format|
        format.turbo_stream do
          render turbo_stream: turbo_stream.replace("marketing-item-ai-content", partial: "admin/marketing_items/ai_content", locals: { marketing_item: @resource, content: result[:content] })
        end
        format.html { redirect_to admin_marketing_item_path(@resource) }
      end
    rescue Ai::GeminiClient::Error, Ai::UsageTracker::RateLimitError => e
      respond_to do |format|
        format.turbo_stream { render turbo_stream: turbo_stream.replace("marketing-item-ai-content", partial: "admin/marketing_items/ai_error", locals: { message: e.message, target_id: "marketing-item-ai-content" }) }
        format.html { redirect_to admin_marketing_item_path(@resource), alert: e.message }
      end
    end

    private

    def prepare_resource
      @resource.publish_on ||= params[:publish_on].presence && Date.parse(params[:publish_on])
    rescue ArgumentError
      nil
    end

    def filtered_scope
      scope = resource_scope
      scope = scope.where(platform: params[:platform]) if params[:platform].present?
      scope = scope.where(status: params[:status]) if params[:status].present?
      scope
    end

    def parse_month(value)
      Date.parse("#{value}-01")
    rescue ArgumentError, TypeError
      Date.current.beginning_of_month
    end
  end
end

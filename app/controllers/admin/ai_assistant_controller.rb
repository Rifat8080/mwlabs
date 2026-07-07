module Admin
  class AiAssistantController < BaseController
    QUICK_ACTION_LABELS = {
      "plan_my_day" => "Plan My Day",
      "marketing_ideas" => "Generate Marketing Ideas",
      "analyze_my_week" => "Analyze My Week",
      "productivity_analysis" => "Productivity Analysis"
    }.freeze

    before_action :require_admin!
    before_action :set_conversation

    def show
      @messages = @conversation.ai_assistant_messages.ordered
    end

    def create_message
      content = params[:message].to_s.strip
      if content.blank?
        render json: { error: "Message can't be blank." }, status: :unprocessable_entity
        return
      end

      @conversation.ai_assistant_messages.create!(role: "user", content: content)
      history = @conversation.ai_assistant_messages.ordered.last(11).map { |message| { role: message.role, content: message.content } }

      result = Ai::Chat.new.respond(message: content, history: history[0..-2])
      assistant_message = @conversation.ai_assistant_messages.create!(role: "assistant", content: result[:content], feature: "general")

      render json: { reply: assistant_message.content, message_id: assistant_message.id }
    rescue Ai::GeminiClient::Error, Ai::UsageTracker::RateLimitError => e
      render json: { error: e.message }, status: :service_unavailable
    end

    def quick_action
      action_name = params[:action_name].to_s
      @conversation.ai_assistant_messages.create!(role: "user", content: QUICK_ACTION_LABELS.fetch(action_name, action_name.humanize), feature: action_name)

      result = perform_quick_action(action_name)
      assistant_message = @conversation.ai_assistant_messages.create!(role: "assistant", content: result[:content], feature: action_name)

      render json: { reply: assistant_message.content, message_id: assistant_message.id }
    rescue Ai::GeminiClient::Error, Ai::UsageTracker::RateLimitError => e
      render json: { error: e.message }, status: :service_unavailable
    end

    private

    def require_admin!
      return if admin_user?

      redirect_to dashboard_root_path, alert: "You do not have access to that area."
    end

    def set_conversation
      @conversation = AiAssistantConversation.current_for(current_user)
    end

    def perform_quick_action(action_name)
      case action_name
      when "plan_my_day"
        Ai::TaskAssistant.new.daily_plan
      when "marketing_ideas"
        Ai::MarketingAssistant.new.content_ideas(
          service: params[:service].presence || "our services",
          audience: params[:audience].presence || "our target customers",
          platform: params[:platform].presence || "LinkedIn",
          goal: params[:goal].presence || "engagement"
        )
      when "analyze_my_week"
        Ai::ReportGenerator.new.weekly_report
      when "productivity_analysis"
        Ai::ReportGenerator.new.productivity_analysis
      else
        raise ActionController::RoutingError, "Unknown quick action"
      end
    end
  end
end

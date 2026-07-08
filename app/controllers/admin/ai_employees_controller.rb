module Admin
  class AiEmployeesController < BaseController
    before_action :require_admin!
    before_action :set_agent

    def index
      @agents = Ai::AgentRegistry.all
      @latest_runs = AiAgentRun.recent.group_by(&:agent_key).transform_values(&:first)
      @run_counts = AiAgentRun.group(:agent_key).count
      @usage_summary = Ai::UsageTracker.summary
    end

    def show
      return redirect_to admin_ai_employees_path, alert: "Unknown AI agent." if @agent.blank?

      @runs = AiAgentRun.for_agent(@agent[:key]).recent.limit(20)
    end

    def run
      return render(json: { error: "Unknown AI agent." }, status: :not_found) if @agent.blank?

      result = Ai::AgentRunner.call(agent_key: @agent[:key], params: run_params, user: current_user)
      render json: { content: result[:content], run_id: result[:run].id, created_at: result[:run].created_at }
    rescue Ai::GeminiClient::Error, Ai::UsageTracker::RateLimitError => e
      render json: { error: e.message }, status: :service_unavailable
    end

    private

    def require_admin!
      return if admin_user?

      redirect_to dashboard_root_path, alert: "You do not have access to that area."
    end

    def set_agent
      @agent = Ai::AgentRegistry.find(params[:agent_key])
    end

    def run_params
      allowed_keys = @agent[:fields].map { |field| field[:name] } + [ :previous_content ]
      params.permit(*allowed_keys)
    end
  end
end

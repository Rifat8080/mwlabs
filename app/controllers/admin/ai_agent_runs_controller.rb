module Admin
  class AiAgentRunsController < ResourceController
    configure(
      model: AiAgentRun,
      title: "Agent Run History",
      description: "Every AI Employees run across all agents: request, response, timing, and status.",
      columns: %i[ agent_key status model tokens_used duration_ms created_at ],
      includes: [],
      fields: [
        { name: :agent_key, type: :text },
        { name: :model, type: :text },
        { name: :prompt_tokens, type: :number },
        { name: :output_tokens, type: :number },
        { name: :tokens_used, type: :number },
        { name: :duration_ms, type: :number },
        { name: :status, type: :select, collection: AiAgentRun::STATUSES },
        { name: :output, type: :textarea },
        { name: :error_message, type: :textarea }
      ]
    )

    def index
      @resources = resource_scope.recent.limit(200)
      render "admin/resources/index"
    end

    private

    # Agent runs are system-generated only — never editable/creatable, even by admins.
    def can_manage_resource?(model)
      return false if model == AiAgentRun

      super
    end
  end
end

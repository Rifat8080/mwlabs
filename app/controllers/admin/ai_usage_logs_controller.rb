module Admin
  class AiUsageLogsController < ResourceController
    configure(
      model: AiUsageLog,
      title: "AI Usage Logs",
      description: "Monitor Gemini free-tier usage: requests, tokens, and errors by feature.",
      columns: %i[ feature model status tokens_used created_at ],
      includes: [],
      fields: [
        { name: :feature, type: :text },
        { name: :model, type: :text },
        { name: :prompt_tokens, type: :number },
        { name: :output_tokens, type: :number },
        { name: :tokens_used, type: :number },
        { name: :status, type: :select, collection: AiUsageLog::STATUSES },
        { name: :error_message, type: :textarea }
      ]
    )

    def index
      @resources = resource_scope.recent.limit(200)
      render "admin/resources/index"
    end

    private

    # Usage logs are system-generated only — never editable/creatable, even by admins.
    def can_manage_resource?(model)
      return false if model == AiUsageLog

      super
    end
  end
end

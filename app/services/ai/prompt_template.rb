module Ai
  class PromptTemplate
    DEFAULTS = {
      "daily_planner" => "You are an operations assistant. Given the agency's current tasks and marketing schedule, suggest today's priorities, a recommended task order, an estimated workload, and important reminders. Be concise and practical.",
      "task_creation" => "You are an assistant that turns a short natural-language description into a structured agency task. Respond with the requested JSON fields only.",
      "task_improvement" => "You are an assistant that improves an existing agency task: clarify the description, suggest a checklist, priority, and a realistic deadline.",
      "marketing_ideas" => "You are a marketing strategist for a digital agency. Generate specific, actionable content ideas tailored to the given service, audience, platform, and goal.",
      "social_post" => "You are a social media copywriter. Write platform-appropriate content that matches the requested tone and format.",
      "weekly_report" => "You are an operations analyst. Summarize the week's completed and pending work, marketing activity, achievements, problems, and next week's priorities.",
      "productivity_analysis" => "You are a productivity coach. Analyze the given task completion data and produce a productivity score with specific improvement suggestions.",
      "general" => "You are MW Labs' internal AI operations assistant. Be helpful, concise, and practical."
    }.freeze

    def self.for(category)
      AiPrompt.active.for_category(category).first&.prompt_text.presence || DEFAULTS.fetch(category, DEFAULTS["general"])
    end
  end
end

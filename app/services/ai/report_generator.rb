module Ai
  class ReportGenerator
    def initialize(gemini_client: Ai::GeminiClient.new)
      @gemini_client = gemini_client
    end

    def weekly_report(week: Date.current.all_week)
      completed = AgencyTask.where(completed_at: week, status: "Completed")
      pending = AgencyTask.active.where(due_date: week)
      marketing = MarketingItem.where(publish_on: week)
      activity_count = ActivityLog.where(subject_type: %w[AgencyTask MarketingItem], created_at: week).count

      prompt = <<~PROMPT
        Week: #{week.first} to #{week.last}

        Completed tasks (#{completed.count}):
        #{format_tasks(completed)}

        Pending tasks due this week (#{pending.count}):
        #{format_tasks(pending)}

        Marketing activity (#{marketing.count}):
        #{format_marketing(marketing)}

        Total activity log entries: #{activity_count}

        Summarize: achievements, problems/blockers, recommendations, and next week's priorities.
      PROMPT

      Ai::UsageTracker.track(feature: "weekly_report") do
        gemini_client.generate(prompt: prompt, system_instruction: system_instruction("weekly_report"))
      end
    end

    def productivity_analysis
      total = AgencyTask.count
      completed = AgencyTask.where(status: "Completed").count
      overdue = AgencyTask.overdue.count
      by_category = AgencyTask.joins(:agency_task_category).group("agency_task_categories.name").count

      prompt = <<~PROMPT
        Total tasks: #{total}
        Completed tasks: #{completed}
        Overdue tasks: #{overdue}
        Completion rate: #{total.positive? ? ((completed.to_f / total) * 100).round : 0}%
        Tasks by category: #{by_category.map { |name, count| "#{name}: #{count}" }.join(", ")}

        Analyze this data and produce a productivity score (0-100) with specific improvement suggestions and workflow recommendations.
      PROMPT

      Ai::UsageTracker.track(feature: "productivity_analysis") do
        gemini_client.generate(prompt: prompt, system_instruction: system_instruction("productivity_analysis"))
      end
    end

    private

    attr_reader :gemini_client

    def system_instruction(category)
      "#{Ai::AgencyContext.build}\n\n#{Ai::PromptTemplate.for(category)}"
    end

    def format_tasks(tasks)
      return "None" if tasks.none?

      tasks.map { |task| "- #{task.title} (#{task.priority})" }.join("\n")
    end

    def format_marketing(items)
      return "None" if items.none?

      items.map { |item| "- #{item.title} (#{item.platform}, #{item.status})" }.join("\n")
    end
  end
end

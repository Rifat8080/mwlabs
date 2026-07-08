module Ai
  class TaskAssistant
    def initialize(gemini_client: Ai::GeminiClient.new)
      @gemini_client = gemini_client
    end

    def daily_plan
      prompt = <<~PROMPT
        Today's date: #{Date.current}

        Overdue tasks:
        #{format_tasks(AgencyTask.overdue.includes(:agency_task_category))}

        Due today:
        #{format_tasks(AgencyTask.due_today.includes(:agency_task_category))}

        Upcoming tasks:
        #{format_tasks(AgencyTask.upcoming.includes(:agency_task_category).limit(10))}

        Marketing scheduled today:
        #{format_marketing(MarketingItem.where(publish_on: Date.current))}

        Based on this, suggest: today's top priorities, a recommended task order, an estimated workload (hours), and important reminders.
      PROMPT

      Ai::UsageTracker.track(feature: "daily_planner") do
        gemini_client.generate(prompt: prompt, system_instruction: system_instruction("daily_planner"))
      end
    end

    def daily_operations_plan
      prompt = <<~PROMPT
        Today's date: #{Date.current}

        Overdue tasks:
        #{format_tasks(AgencyTask.overdue.includes(:agency_task_category))}

        Due today:
        #{format_tasks(AgencyTask.due_today.includes(:agency_task_category))}

        Upcoming tasks:
        #{format_tasks(AgencyTask.upcoming.includes(:agency_task_category).limit(10))}

        Marketing scheduled today:
        #{format_marketing(MarketingItem.where(publish_on: Date.current))}

        Based on this, write a short narrative covering today's top priorities, a recommended task order, an estimated workload (hours), and important reminders. Also list the important reminders separately as short, standalone reminder items (each with a title and an optional one-sentence note) so they can be added to a reminders list.
      PROMPT

      schema = {
        type: "OBJECT",
        properties: {
          narrative: { type: "STRING" },
          reminders: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                title: { type: "STRING" },
                note: { type: "STRING" }
              },
              required: %w[title]
            }
          }
        },
        required: %w[narrative reminders]
      }

      result = Ai::UsageTracker.track(feature: "daily_planner") do
        gemini_client.generate(prompt: prompt, system_instruction: system_instruction("daily_planner"), json_schema: schema)
      end

      parsed = JSON.parse(result[:content])
      result.merge(content: parsed["narrative"], parsed: parsed)
    rescue JSON::ParserError => e
      raise Ai::GeminiClient::Error, "Gemini returned invalid JSON: #{e.message}"
    end

    def create_from_description(description)
      prompt = <<~PROMPT
        Turn this into a structured agency task: "#{description}"

        Available categories: #{AgencyTaskCategory.ordered.pluck(:name).join(", ")}
        Available priorities: #{AgencyTask::PRIORITIES.join(", ")}
        Today's date: #{Date.current}
      PROMPT

      schema = {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          description: { type: "STRING" },
          category: { type: "STRING" },
          priority: { type: "STRING" },
          due_date: { type: "STRING", description: "YYYY-MM-DD" },
          checklist: { type: "ARRAY", items: { type: "STRING" } }
        },
        required: %w[title priority]
      }

      result = Ai::UsageTracker.track(feature: "task_creation") do
        gemini_client.generate(prompt: prompt, system_instruction: system_instruction("task_creation"), json_schema: schema)
      end

      parse_json(result)
    end

    def improve(agency_task)
      prompt = <<~PROMPT
        Existing task:
        Title: #{agency_task.title}
        Description: #{agency_task.description}
        Category: #{agency_task.agency_task_category&.name}
        Priority: #{agency_task.priority}
        Due date: #{agency_task.due_date}

        Improve this task: rewrite the description clearly, suggest a checklist (3-6 items), suggest a priority, and suggest a due date if missing.
      PROMPT

      schema = {
        type: "OBJECT",
        properties: {
          description: { type: "STRING" },
          priority: { type: "STRING" },
          due_date: { type: "STRING", description: "YYYY-MM-DD" },
          checklist: { type: "ARRAY", items: { type: "STRING" } }
        },
        required: %w[description]
      }

      result = Ai::UsageTracker.track(feature: "task_improvement") do
        gemini_client.generate(prompt: prompt, system_instruction: system_instruction("task_improvement"), json_schema: schema)
      end

      parse_json(result)
    end

    private

    attr_reader :gemini_client

    def system_instruction(category)
      "#{Ai::AgencyContext.build}\n\n#{Ai::PromptTemplate.for(category)}"
    end

    def format_tasks(tasks)
      return "None" if tasks.none?

      tasks.map { |task| "- #{task.title} (#{task.priority}, due #{task.due_date || "no date"}, #{task.agency_task_category&.name || "uncategorized"})" }.join("\n")
    end

    def format_marketing(items)
      return "None" if items.none?

      items.map { |item| "- #{item.title} (#{item.platform}, #{item.status})" }.join("\n")
    end

    def parse_json(result)
      JSON.parse(result[:content]).symbolize_keys
    rescue JSON::ParserError => e
      raise Ai::GeminiClient::Error, "Gemini returned invalid JSON: #{e.message}"
    end
  end
end

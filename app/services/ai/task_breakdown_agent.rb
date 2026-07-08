module Ai
  class TaskBreakdownAgent
    def initialize(gemini_client: Ai::GeminiClient.new)
      @gemini_client = gemini_client
    end

    def breakdown(goal:)
      prompt = <<~PROMPT
        Goal: #{goal}

        Available categories: #{AgencyTaskCategory.ordered.pluck(:name).join(", ")}
        Available priorities: #{AgencyTask::PRIORITIES.join(", ")}
        Today's date: #{Date.current}

        Break this goal into 5-12 concrete, ordered subtasks needed to accomplish it. For each subtask give a title, priority, estimated duration (e.g. "2 hours", "1 day"), a suggested deadline (YYYY-MM-DD), any dependencies (titles of other subtasks it depends on), and a short checklist (2-4 items).
      PROMPT

      schema = {
        type: "OBJECT",
        properties: {
          tasks: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                title: { type: "STRING" },
                priority: { type: "STRING" },
                estimated_duration: { type: "STRING" },
                suggested_deadline: { type: "STRING", description: "YYYY-MM-DD" },
                dependencies: { type: "ARRAY", items: { type: "STRING" } },
                checklist: { type: "ARRAY", items: { type: "STRING" } }
              },
              required: %w[title priority]
            }
          }
        },
        required: %w[tasks]
      }

      result = Ai::UsageTracker.track(feature: "task_breakdown") do
        gemini_client.generate(prompt: prompt, system_instruction: system_instruction, json_schema: schema)
      end

      result.merge(parsed: parse_json(result))
    end

    def create_tasks!(subtasks, category: nil)
      subtasks.map do |subtask|
        task = AgencyTask.create!(
          title: subtask[:title] || subtask["title"],
          priority: subtask[:priority] || subtask["priority"] || AgencyTask::PRIORITIES.last,
          due_date: subtask[:suggested_deadline] || subtask["suggested_deadline"],
          agency_task_category: category
        )

        Array(subtask[:checklist] || subtask["checklist"]).each do |item|
          task.checklist_items.create!(title: item)
        end

        task
      end
    end

    private

    attr_reader :gemini_client

    def system_instruction
      "#{Ai::AgencyContext.build}\n\n#{Ai::PromptTemplate.for("task_breakdown")}"
    end

    def parse_json(result)
      JSON.parse(result[:content]).symbolize_keys
    rescue JSON::ParserError => e
      raise Ai::GeminiClient::Error, "Gemini returned invalid JSON: #{e.message}"
    end
  end
end

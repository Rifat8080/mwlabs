module Ai
  module AgentRegistry
    AGENTS = [
      {
        key: "daily_operations",
        name: "Daily Operations Manager",
        description: "Organizes today's work: priorities, execution order, workload estimate, and reminders based on your current tasks and marketing schedule.",
        icon: "fa-list-check",
        category: "planning",
        fields: [],
        auto_schedule: "Auto-runs weekdays 7am",
        apply_label: "Add today's reminders",
        runner: ->(params:, user:) { Ai::TaskAssistant.new.daily_operations_plan },
        apply: ->(parsed:, user:) {
          reminders = Array(parsed["reminders"])
          created = reminders.filter_map do |reminder|
            title = reminder["title"].to_s
            next if title.blank?
            next if Reminder.exists?(title: title, due_date: Date.current, user: user)

            Reminder.create!(title: title, note: reminder["note"], due_date: Date.current, user: user, status: "Open")
          end
          "Added #{created.size} reminder#{"s" unless created.size == 1} for today."
        }
      },
      {
        key: "marketing_manager",
        name: "Marketing Manager",
        description: "Reviews your marketing calendar and suggests content ideas, publishing recommendations, and platform strategy.",
        icon: "fa-bullhorn",
        category: "marketing",
        fields: [],
        auto_schedule: "Auto-runs Mondays 8am",
        apply_label: "Add this week's ideas to the Marketing Planner",
        runner: ->(params:, user:) { Ai::MarketingAssistant.new.weekly_content_plan },
        apply: ->(parsed:, user:) {
          items = Array(parsed["items"])
          created = items.filter_map do |item|
            title = item["title"].to_s
            publish_on = Date.parse(item["publish_on"].to_s) rescue nil
            next if title.blank?
            next if publish_on.present? && MarketingItem.exists?(title: title, publish_on: publish_on)

            MarketingItem.create!(title: title, platform: item["platform"].presence, publish_on: publish_on, notes: item["notes"], status: "Idea")
          end
          "Added #{created.size} marketing item#{"s" unless created.size == 1} to the planner."
        }
      },
      {
        key: "content_creator",
        name: "Content Creator",
        description: "Generates platform-ready content: posts, threads, captions, titles, outlines, CTAs, hashtags, and more.",
        icon: "fa-pen-nib",
        category: "content",
        fields: [
          { name: :platform, type: :text, placeholder: "e.g. LinkedIn, Twitter/X, Blog" },
          { name: :content_type, type: :select, collection: Ai::ContentGenerator::CONTENT_TYPE_FORMATS.keys },
          { name: :topic, type: :textarea, placeholder: "What should the content be about?" },
          { name: :instruction, type: :select, collection: Ai::ContentGenerator::INSTRUCTIONS.keys }
        ],
        runner: ->(params:, user:) {
          Ai::ContentGenerator.new.write(
            platform: params[:platform].presence || "LinkedIn",
            topic: params[:topic].to_s,
            content_type: params[:content_type].presence || "post",
            instruction: params[:instruction].presence || "draft",
            previous_content: params[:previous_content]
          )
        }
      },
      {
        key: "task_breakdown",
        name: "Task Breakdown Agent",
        description: "Turns a large goal into an ordered list of actionable subtasks with priority, duration, deadline, dependencies, and a checklist.",
        icon: "fa-diagram-project",
        category: "planning",
        fields: [
          { name: :goal, type: :textarea, placeholder: "e.g. Launch a new AI automation service" }
        ],
        apply_label: "Create these as Agency Tasks",
        runner: ->(params:, user:) { Ai::TaskBreakdownAgent.new.breakdown(goal: params[:goal].to_s) },
        apply: ->(parsed:, user:) {
          subtasks = Array(parsed["tasks"]).map(&:symbolize_keys)
          existing_titles = AgencyTask.where(title: subtasks.map { |task| task[:title] }).pluck(:title)
          new_subtasks = subtasks.reject { |task| existing_titles.include?(task[:title]) }
          created = Ai::TaskBreakdownAgent.new.create_tasks!(new_subtasks)
          "Created #{created.size} agency task#{"s" unless created.size == 1}."
        }
      },
      {
        key: "weekly_report",
        name: "Weekly Report Agent",
        description: "Summarizes the week's completed and pending work, marketing activity, achievements, problems, and next week's priorities.",
        icon: "fa-chart-simple",
        category: "reporting",
        fields: [],
        runner: ->(params:, user:) { Ai::ReportGenerator.new.weekly_report }
      },
      {
        key: "seo_assistant",
        name: "SEO Assistant",
        description: "Generates keywords, meta titles/descriptions, content outlines, and internal linking suggestions for a page or topic.",
        icon: "fa-magnifying-glass-chart",
        category: "content",
        fields: [
          { name: :topic, type: :text, placeholder: "e.g. AI automation for agencies" },
          { name: :target_keyword, type: :text, placeholder: "optional" },
          { name: :page_url, type: :text, placeholder: "optional" },
          { name: :existing_content, type: :textarea, placeholder: "optional — paste existing content to critique" }
        ],
        runner: ->(params:, user:) {
          Ai::SeoAssistant.new.optimize(
            topic: params[:topic].to_s,
            target_keyword: params[:target_keyword],
            page_url: params[:page_url],
            existing_content: params[:existing_content]
          )
        }
      },
      {
        key: "meeting_assistant",
        name: "Meeting Assistant",
        description: "Turns raw meeting notes into a summary, key decisions, action items with owners/deadlines, and follow-ups.",
        icon: "fa-people-arrows",
        category: "planning",
        fields: [
          { name: :notes, type: :textarea, placeholder: "Paste your meeting notes here" }
        ],
        runner: ->(params:, user:) { Ai::MeetingAssistant.new.summarize(notes: params[:notes].to_s) }
      }
    ].freeze

    CATEGORY_LABELS = {
      "planning" => "Planning",
      "marketing" => "Marketing",
      "content" => "Content",
      "reporting" => "Reporting"
    }.freeze

    def self.all
      AGENTS
    end

    def self.find(key)
      AGENTS.find { |agent| agent[:key] == key.to_s }
    end
  end
end

module Ai
  module AgentRegistry
    AGENTS = [
      {
        key: "daily_operations",
        name: "Daily Operations Manager",
        description: "Organizes today's work: priorities, execution order, workload estimate, and reminders based on your current tasks and marketing schedule.",
        icon: "fa-list-check",
        fields: [],
        runner: ->(params:, user:) { Ai::TaskAssistant.new.daily_plan }
      },
      {
        key: "marketing_manager",
        name: "Marketing Manager",
        description: "Reviews your marketing calendar and suggests content ideas, publishing recommendations, and platform strategy.",
        icon: "fa-bullhorn",
        fields: [
          { name: :service, type: :text, placeholder: "e.g. AI automation" },
          { name: :audience, type: :text, placeholder: "e.g. small agencies" },
          { name: :platform, type: :text, placeholder: "e.g. LinkedIn" },
          { name: :goal, type: :text, placeholder: "e.g. lead generation" }
        ],
        runner: ->(params:, user:) {
          Ai::MarketingAssistant.new.content_ideas(
            service: params[:service].presence || "our services",
            audience: params[:audience].presence || "our target customers",
            platform: params[:platform].presence || "LinkedIn",
            goal: params[:goal].presence || "engagement"
          )
        }
      },
      {
        key: "content_creator",
        name: "Content Creator",
        description: "Generates platform-ready content: posts, threads, captions, titles, outlines, CTAs, hashtags, and more.",
        icon: "fa-pen-nib",
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
        fields: [
          { name: :goal, type: :textarea, placeholder: "e.g. Launch a new AI automation service" }
        ],
        runner: ->(params:, user:) { Ai::TaskBreakdownAgent.new.breakdown(goal: params[:goal].to_s) }
      },
      {
        key: "weekly_report",
        name: "Weekly Report Agent",
        description: "Summarizes the week's completed and pending work, marketing activity, achievements, problems, and next week's priorities.",
        icon: "fa-chart-simple",
        fields: [],
        runner: ->(params:, user:) { Ai::ReportGenerator.new.weekly_report }
      },
      {
        key: "seo_assistant",
        name: "SEO Assistant",
        description: "Generates keywords, meta titles/descriptions, content outlines, and internal linking suggestions for a page or topic.",
        icon: "fa-magnifying-glass-chart",
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
        fields: [
          { name: :notes, type: :textarea, placeholder: "Paste your meeting notes here" }
        ],
        runner: ->(params:, user:) { Ai::MeetingAssistant.new.summarize(notes: params[:notes].to_s) }
      }
    ].freeze

    def self.all
      AGENTS
    end

    def self.find(key)
      AGENTS.find { |agent| agent[:key] == key.to_s }
    end
  end
end

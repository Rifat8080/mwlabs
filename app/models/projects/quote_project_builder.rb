module Projects
  class QuoteProjectBuilder
    def initialize(quote, client)
      @quote = quote
      @client = client
    end

    def call
      project = Project.create!(
        client: client,
        quote: quote,
        name: project_name,
        service_category: primary_service&.category,
        project_value: quote.total_amount,
        start_date: Date.current,
        deadline: default_deadline,
        status: "Requirement Collection",
        priority: "Medium",
        progress: 0,
        client_notes: quote.delivery_timeline
      )

      create_default_tasks(project)
      project
    end

    private

    attr_reader :quote, :client

    def project_name
      "#{client.display_name} - #{quote.quote_items.first&.name || 'Project'}"
    end

    def primary_service
      @primary_service ||= Service.find_by(name: quote.quote_items.pluck(:name))
    end

    def default_deadline
      30.days.from_now.to_date
    end

    def create_default_tasks(project)
      tasks = default_task_titles
      tasks = [ "Collect requirements", "Prepare first delivery", "Client review", "Final delivery" ] if tasks.blank?

      tasks.each_with_index do |title, index|
        project.tasks.create!(
          title: title,
          due_date: (index + 1).days.from_now.to_date,
          priority: "Medium",
          status: "To Do",
          client_visible: false
        )
      end
    end

    def default_task_titles
      quote.quote_items.filter_map do |item|
        Service.find_by(name: item.name)&.checklist_items
      end.flatten.uniq
    end
  end
end

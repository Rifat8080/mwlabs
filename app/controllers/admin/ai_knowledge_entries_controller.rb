module Admin
  class AiKnowledgeEntriesController < ResourceController
    configure(
      model: AiKnowledgeEntry,
      title: "AI Knowledge",
      description: "Facts about the agency (name, services, tone) that the AI assistant includes in every prompt.",
      columns: %i[ key value active ],
      includes: [],
      fields: [
        { name: :key, type: :text, hint: "e.g. agency_name, services, tone" },
        { name: :value, type: :textarea },
        { name: :active, type: :checkbox }
      ]
    )
  end
end

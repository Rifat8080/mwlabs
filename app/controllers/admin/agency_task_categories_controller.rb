module Admin
  class AgencyTaskCategoriesController < ResourceController
    configure(
      model: AgencyTaskCategory,
      title: "Task Categories",
      description: "Organize agency tasks into custom categories like Marketing, Development, or Client Follow-up.",
      columns: %i[ name color position ],
      includes: [],
      fields: [
        { name: :name, type: :text, hint: "Displayed on the task board and filters." },
        { name: :color, type: :select, collection: AgencyTaskCategory::COLORS, hint: "Accent color used on the task board." },
        { name: :position, type: :number, hint: "Lower numbers appear first." }
      ]
    )

    def index
      @resources = resource_scope.includes(resource_includes).order(position: :asc, name: :asc)
      render "admin/resources/index"
    end
  end
end

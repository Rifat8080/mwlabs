module Admin
  class AiPromptsController < ResourceController
    configure(
      model: AiPrompt,
      title: "AI Prompts",
      description: "Customize the instructions the AI assistant uses for each feature. Falls back to sensible defaults when none is active.",
      columns: %i[ name category active ],
      includes: [],
      fields: [
        { name: :name, type: :text },
        { name: :category, type: :select, collection: AiPrompt::CATEGORIES },
        { name: :prompt_text, type: :textarea, hint: "The system instruction sent to Gemini for this category." },
        { name: :active, type: :checkbox }
      ]
    )
  end
end

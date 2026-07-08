class AiPrompt < ApplicationRecord
  CATEGORIES = %w[
    daily_planner task_creation task_improvement
    marketing_ideas social_post weekly_report productivity_analysis general
    seo meeting_summary task_breakdown
  ].freeze

  validates :name, presence: true, uniqueness: true
  validates :category, inclusion: { in: CATEGORIES }
  validates :prompt_text, presence: true

  scope :active, -> { where(active: true) }
  scope :for_category, ->(category) { where(category: category) }

  def display_name
    name
  end
end

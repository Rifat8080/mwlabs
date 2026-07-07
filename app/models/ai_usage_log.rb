class AiUsageLog < ApplicationRecord
  STATUSES = %w[success error].freeze

  validates :feature, presence: true
  validates :status, inclusion: { in: STATUSES }

  scope :recent, -> { order(created_at: :desc) }
  scope :for_feature, ->(feature) { where(feature: feature) }
  scope :within, ->(range) { where(created_at: range) }

  def display_name
    "#{feature} (#{status})"
  end
end

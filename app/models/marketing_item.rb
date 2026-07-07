class MarketingItem < ApplicationRecord
  PLATFORMS = [ "LinkedIn", "Twitter/X", "Facebook", "Instagram", "Threads", "TikTok", "YouTube", "Blog", "Newsletter" ].freeze
  STATUSES = %w[Idea Research Writing Designing Ready Scheduled Published Archived].freeze

  has_many :activity_logs, as: :subject, dependent: :destroy

  validates :title, :status, presence: true
  validates :status, inclusion: { in: STATUSES }
  validates :platform, inclusion: { in: PLATFORMS }, allow_blank: true

  after_create_commit :record_created_activity
  after_update_commit :record_status_activity, if: :saved_change_to_status?

  scope :by_platform, ->(platform) { platform.present? ? where(platform: platform) : all }
  scope :scheduled, -> { where(status: "Scheduled") }
  scope :published_items, -> { where(status: "Published") }
  scope :upcoming, -> { where(publish_on: Date.current..).order(:publish_on) }
  scope :ordered, -> { order(position: :asc, publish_on: :asc, created_at: :desc) }

  def display_name
    title
  end

  def keyword_list
    keywords.to_s.split(",").map(&:strip).reject(&:blank?)
  end

  def hashtag_list
    hashtags.to_s.split(",").map(&:strip).reject(&:blank?)
  end

  private

  def record_created_activity
    ActivityLog.record!(subject: self, action: "Marketing item created", details: title)
  end

  def record_status_activity
    ActivityLog.record!(subject: self, action: "Marketing item status changed", details: "#{title}: #{status}")
  end
end

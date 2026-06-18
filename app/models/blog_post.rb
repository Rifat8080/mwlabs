class BlogPost < ApplicationRecord
  DEFAULT_CATEGORIES = [
    "Web Development",
    "Digital Marketing",
    "Branding & Design",
    "Video Editing",
    "AI Automation",
    "Growth Strategy"
  ].freeze
  STATUSES = [ "Draft", "Published", "Archived" ].freeze

  belongs_to :author, class_name: "User"
  has_one_attached :cover_image
  has_many :activity_logs, as: :subject, dependent: :destroy

  before_validation :generate_slug
  before_validation :sync_published_at

  validates :title, :body, :category, :status, :slug, presence: true
  validates :slug, uniqueness: true
  validates :status, inclusion: { in: STATUSES }
  validates :author, presence: true

  scope :published, -> {
    where(status: "Published").where(published_at: ..Time.zone.now)
  }
  scope :featured, -> { where(featured: true) }
  scope :by_category, ->(category) { category.present? ? where(category: category) : all }

  def self.category_options
    (DEFAULT_CATEGORIES + distinct.where.not(category: [ nil, "" ]).pluck(:category)).uniq.sort
  end

  def self.published_categories
    published.distinct.order(:category).pluck(:category)
  end

  def display_name
    title
  end

  def published?
    status == "Published" && published_at.present? && published_at <= Time.zone.now
  end

  def read_time_minutes
    words = body.to_s.split.size
    [ (words / 200.0).ceil, 1 ].max
  end

  def seo_title
    meta_title.presence || title
  end

  def seo_description
    meta_description.presence || excerpt.presence || body.to_s.truncate(160)
  end

  private

  def generate_slug
    return if title.blank?

    base = title.parameterize
    return if base.blank?

    if slug.blank? || will_save_change_to_title?
      candidate = base
      suffix = 2
      while BlogPost.where.not(id: id).exists?(slug: candidate)
        candidate = "#{base}-#{suffix}"
        suffix += 1
      end
      self.slug = candidate
    end
  end

  def sync_published_at
    return unless status == "Published"

    self.published_at ||= Time.zone.now
  end
end

class BlogPost < ApplicationRecord
  STATUSES = [ "Draft", "Published", "Archived" ].freeze
  COVER_IMAGE_MAX_SIZE = 25.megabytes
  COVER_IMAGE_CONTENT_TYPES = %w[image/png image/jpeg image/jpg image/gif image/webp].freeze

  belongs_to :author, class_name: "User"
  belongs_to :blog_category
  has_one_attached :cover_image
  has_many :activity_logs, as: :subject, dependent: :destroy
  has_rich_text :body

  before_validation :generate_slug
  before_validation :sync_published_at

  validates :title, :status, :slug, presence: true
  validates :slug, uniqueness: true
  validates :status, inclusion: { in: STATUSES }
  validates :author, :blog_category, presence: true
  validates :body, presence: true
  validate :acceptable_cover_image

  scope :published, -> {
    where(status: "Published").where(published_at: ..Time.zone.now)
  }
  scope :featured, -> { where(featured: true) }
  scope :by_category, ->(category_slug) {
    category_slug.present? ? joins(:blog_category).where(blog_categories: { slug: category_slug }) : all
  }

  delegate :name, :slug, to: :blog_category, prefix: :category, allow_nil: true

  def category
    blog_category&.name
  end

  def display_name
    title
  end

  def published?
    status == "Published" && published_at.present? && published_at <= Time.zone.now
  end

  def read_time_minutes
    words = body.to_plain_text.split.size
    [ (words / 200.0).ceil, 1 ].max
  end

  def seo_title
    meta_title.presence || title
  end

  def seo_description
    meta_description.presence || excerpt.presence || body.to_plain_text.truncate(160)
  end

  def acceptable_cover_image
    return unless cover_image.attached?

    unless cover_image.content_type.in?(COVER_IMAGE_CONTENT_TYPES)
      errors.add(:cover_image, "must be a PNG, JPG, GIF, or WebP image")
    end

    if cover_image.byte_size > COVER_IMAGE_MAX_SIZE
      errors.add(:cover_image, "must be smaller than #{ActiveSupport::NumberHelper.number_to_human_size(COVER_IMAGE_MAX_SIZE)}")
    end
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

class PortfolioProject < ApplicationRecord
  STATUSES = [ "Draft", "Published" ].freeze
  CATEGORIES = [
    "Web Development", "Digital Marketing", "Branding & Design",
    "Video Editing", "AI & Automation", "Growth Strategy"
  ].freeze
  COVER_IMAGE_MAX_SIZE = 25.megabytes
  IMAGE_CONTENT_TYPES = %w[image/png image/jpeg image/jpg image/gif image/webp].freeze

  has_one_attached :cover_image
  has_many_attached :gallery_images
  has_rich_text :story

  before_validation :generate_slug

  validates :title, :status, :slug, presence: true
  validates :slug, uniqueness: true
  validates :status, inclusion: { in: STATUSES }
  validates :category, inclusion: { in: CATEGORIES }, allow_blank: true
  validate :acceptable_cover_image

  scope :published, -> { where(status: "Published") }
  scope :featured, -> { where(featured: true) }
  scope :ordered, -> { order(display_order: :asc, completed_on: :desc, created_at: :desc) }
  scope :by_category, ->(category) { category.present? ? where(category: category) : all }

  def display_name
    title
  end

  def published?
    status == "Published"
  end

  def technology_list
    technologies.to_s.split(",").map(&:strip).reject(&:blank?)
  end

  def acceptable_cover_image
    return unless cover_image.attached?

    unless cover_image.content_type.in?(IMAGE_CONTENT_TYPES)
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
      while PortfolioProject.where.not(id: id).exists?(slug: candidate)
        candidate = "#{base}-#{suffix}"
        suffix += 1
      end
      self.slug = candidate
    end
  end
end

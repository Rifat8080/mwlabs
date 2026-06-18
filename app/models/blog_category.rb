class BlogCategory < ApplicationRecord
  has_many :blog_posts, dependent: :restrict_with_error

  before_validation :generate_slug

  validates :name, presence: true, uniqueness: { case_sensitive: false }
  validates :slug, presence: true, uniqueness: true
  validates :position, numericality: { only_integer: true }

  scope :ordered, -> { order(:position, :name) }
  scope :with_published_posts, -> {
    joins(:blog_posts).merge(BlogPost.published).distinct
  }

  def display_name
    name
  end

  def to_param
    slug
  end

  private

  def generate_slug
    return if name.blank?

    base = name.parameterize
    return if base.blank?

    if slug.blank? || will_save_change_to_name?
      candidate = base
      suffix = 2
      while BlogCategory.where.not(id: id).exists?(slug: candidate)
        candidate = "#{base}-#{suffix}"
        suffix += 1
      end
      self.slug = candidate
    end
  end
end

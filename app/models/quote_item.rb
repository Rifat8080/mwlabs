class QuoteItem < ApplicationRecord
  ITEM_TYPES = [ "Service", "Custom" ].freeze

  belongs_to :quote

  before_validation :calculate_total

  validates :name, presence: true
  validates :item_type, inclusion: { in: ITEM_TYPES }, allow_blank: true
  validates :quantity, numericality: { greater_than: 0 }
  validates :unit_price, numericality: { greater_than_or_equal_to: 0 }

  private

  def calculate_total
    self.quantity ||= 1
    self.unit_price ||= 0
    self.total = quantity * unit_price
  end
end

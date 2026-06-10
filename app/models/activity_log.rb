class ActivityLog < ApplicationRecord
  belongs_to :user, optional: true
  belongs_to :subject, polymorphic: true

  validates :action, presence: true

  def self.record!(subject:, action:, user: nil, details: nil)
    create!(subject: subject, user: user, action: action, details: details)
  end
end

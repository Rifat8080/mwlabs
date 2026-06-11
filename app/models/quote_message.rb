class QuoteMessage < ApplicationRecord
  KINDS = %w[message change_request staff_reply system].freeze

  belongs_to :quote
  belongs_to :user

  validates :message, presence: true
  validates :kind, inclusion: { in: KINDS }

  scope :visible_to_client, -> { where(internal: false) }
  scope :chronological, -> { order(created_at: :asc) }

  def from_staff?
    user&.admin? || user&.role == "team_member"
  end

  def from_client?
    user&.role == "client"
  end

  def system?
    kind == "system"
  end

  def author_label
    return "System" if system?
    return "M&W Labs" if from_staff?

    user.display_name
  end

  def kind_label
    case kind
    when "change_request" then "Change request"
    when "staff_reply" then "Staff reply"
    when "system" then "System update"
    else "Message"
    end
  end
end

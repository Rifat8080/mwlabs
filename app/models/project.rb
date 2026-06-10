class Project < ApplicationRecord
  STATUSES = [
    "Not Started", "Requirement Collection", "In Progress", "Waiting for Client",
    "Revision", "Completed", "Delivered", "Cancelled"
  ].freeze
  PRIORITIES = [ "Low", "Medium", "High", "Urgent" ].freeze

  belongs_to :client
  belongs_to :quote, optional: true
  belongs_to :assigned_to, class_name: "User", optional: true, inverse_of: :assigned_projects
  has_many :tasks, dependent: :destroy
  has_many :invoices, dependent: :nullify
  has_many :payments, through: :invoices
  has_many :expenses, dependent: :nullify
  has_many :file_uploads, dependent: :nullify
  has_many :activity_logs, as: :subject, dependent: :destroy
  has_many :reminders, as: :remindable, dependent: :destroy

  validates :name, :client, presence: true
  validates :status, inclusion: { in: STATUSES }
  validates :priority, inclusion: { in: PRIORITIES }
  validates :progress, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 100 }
  validates :project_value, numericality: { greater_than_or_equal_to: 0 }

  scope :active, -> { where.not(status: [ "Completed", "Delivered", "Cancelled" ]) }

  def display_name
    name
  end

  def profit
    payments.sum(:amount) - expenses.sum(:amount)
  end

  def refresh_progress!
    total_tasks = tasks.count
    done_tasks = tasks.where(status: "Done").count
    calculated_progress = total_tasks.zero? ? progress : ((done_tasks.to_f / total_tasks) * 100).round
    next_status =
      if calculated_progress == 100 && total_tasks.positive?
        "Completed"
      elsif status == "Completed"
        "In Progress"
      else
        status
      end

    update_columns(progress: calculated_progress, status: next_status, updated_at: Time.current)
  end
end

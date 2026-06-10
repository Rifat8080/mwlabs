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

  def next_action
    return "Project is closed." if status.in?([ "Delivered", "Cancelled" ])
    return "Collect missing requirements from the client." if status == "Requirement Collection"
    return "Review waiting items with the client." if status == "Waiting for Client"
    return "Package final delivery and send invoice." if status == "Completed"
    return "Start the first task." if tasks.none?

    next_task = tasks.where.not(status: "Done").order(:due_date, :created_at).first
    next_task ? "Work on: #{next_task.title}" : "Confirm final delivery."
  end

  def refresh_progress!
    total_tasks = tasks.count
    done_tasks = tasks.where(status: "Done").count
    calculated_progress = total_tasks.zero? ? progress : ((done_tasks.to_f / total_tasks) * 100).round
    next_status = calculated_status_for(calculated_progress, total_tasks)

    update_columns(progress: calculated_progress, status: next_status, updated_at: Time.current)
  end

  private

  def calculated_status_for(calculated_progress, total_tasks)
    return status if status.in?([ "Delivered", "Cancelled" ])
    return "Not Started" if total_tasks.zero?
    return "Completed" if calculated_progress == 100
    return "Waiting for Client" if tasks.where(status: "Waiting").exists?
    return "Revision" if tasks.where(status: "Review").exists?
    return "In Progress" if tasks.where(status: "In Progress").exists? || calculated_progress.positive?

    "Requirement Collection"
  end
end

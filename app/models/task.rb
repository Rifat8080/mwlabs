class Task < ApplicationRecord
  STATUSES = [ "To Do", "In Progress", "Waiting", "Review", "Done" ].freeze
  PRIORITIES = [ "Low", "Medium", "High", "Urgent" ].freeze

  belongs_to :project
  belongs_to :assigned_to, class_name: "User", optional: true, inverse_of: :assigned_tasks
  has_many :file_uploads, dependent: :nullify

  has_one_attached :attachment

  validates :title, :project, presence: true
  validates :status, inclusion: { in: STATUSES }
  validates :priority, inclusion: { in: PRIORITIES }

  after_create_commit :record_created_activity
  after_save_commit :refresh_project_progress
  after_update_commit :record_status_activity, if: :saved_change_to_status?
  after_destroy_commit :refresh_project_progress

  scope :overdue, -> { where.not(status: "Done").where(due_date: ...Date.current) }
  scope :due_today, -> { where.not(status: "Done").where(due_date: Date.current) }

  def display_name
    title
  end

  def next_action
    case status
    when "To Do"
      "Start work before #{due_date || 'the planned deadline'}."
    when "In Progress"
      "Continue work and submit for review."
    when "Waiting"
      "Get the required client input or asset."
    when "Review"
      "Review internally or request client approval."
    when "Done"
      "No action needed."
    else
      "Review task status."
    end
  end

  private

  def refresh_project_progress
    project.refresh_progress!
  end

  def record_created_activity
    ActivityLog.record!(subject: project, action: "Task created", details: title)
  end

  def record_status_activity
    ActivityLog.record!(subject: project, action: "Task status changed", details: "#{title} moved to #{status}.")
  end
end

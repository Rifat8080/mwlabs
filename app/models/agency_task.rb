class AgencyTask < ApplicationRecord
  STATUSES = %w[Inbox Todo InProgress Waiting Review Completed Cancelled Archived].freeze
  PRIORITIES = %w[Critical High Medium Low].freeze
  RECURRENCE_RULES = %w[daily weekly monthly custom].freeze
  CLOSED_STATUSES = %w[Completed Cancelled Archived].freeze
  WEEKDAYS = %w[mon tue wed thu fri sat sun].freeze

  belongs_to :agency_task_category, optional: true
  belongs_to :parent_recurring_task, class_name: "AgencyTask", optional: true
  has_many :recurring_occurrences, class_name: "AgencyTask", foreign_key: :parent_recurring_task_id, dependent: :nullify
  has_many :checklist_items, as: :checklistable, dependent: :destroy
  has_many :activity_logs, as: :subject, dependent: :destroy
  has_one_attached :attachment

  accepts_nested_attributes_for :checklist_items, allow_destroy: true, reject_if: :all_blank

  validates :title, :status, :priority, presence: true
  validates :status, inclusion: { in: STATUSES }
  validates :priority, inclusion: { in: PRIORITIES }
  validates :recurrence_rule, inclusion: { in: RECURRENCE_RULES }, allow_blank: true

  before_save :sync_completed_at
  after_create_commit :record_created_activity
  after_update_commit :record_status_activity, if: :saved_change_to_status?
  after_update_commit :spawn_next_occurrence!, if: :should_spawn_next_occurrence?

  scope :active, -> { where.not(status: CLOSED_STATUSES) }
  scope :overdue, -> { active.where(due_date: ...Date.current) }
  scope :due_today, -> { active.where(due_date: Date.current) }
  scope :due_this_week, -> { active.where(due_date: Date.current..Date.current.end_of_week) }
  scope :upcoming, -> { active.where(due_date: (Date.current + 1.day)..) }
  scope :completed_today, -> { where(status: "Completed").where(completed_at: Date.current.all_day) }
  scope :recurring, -> { where.not(recurrence_rule: nil) }
  scope :ordered, -> { order(position: :asc, due_date: :asc, created_at: :desc) }

  def display_name
    title
  end

  def recurring?
    recurrence_rule.present?
  end

  def tag_list
    tags.to_s.split(",").map(&:strip).reject(&:blank?)
  end

  def weekday_list
    recurrence_weekdays.to_s.split(",").map(&:strip).reject(&:blank?)
  end

  def next_due_date(from_date = due_date || Date.current)
    interval = [ recurrence_interval.to_i, 1 ].max

    case recurrence_rule
    when "daily", "custom"
      from_date + interval.days
    when "weekly"
      weekday_list.present? ? next_weekday_after(from_date) : from_date + interval.weeks
    when "monthly"
      from_date + interval.months
    end
  end

  def spawn_next_occurrence!
    return unless recurring?

    AgencyTask.create!(
      title: title,
      description: description,
      agency_task_category: agency_task_category,
      priority: priority,
      status: "Todo",
      due_date: next_due_date,
      estimated_minutes: estimated_minutes,
      notes: notes,
      tags: tags,
      recurrence_rule: recurrence_rule,
      recurrence_interval: recurrence_interval,
      recurrence_weekdays: recurrence_weekdays,
      parent_recurring_task: parent_recurring_task || self
    )
  end

  private

  def should_spawn_next_occurrence?
    saved_change_to_status? && status == "Completed" && recurring?
  end

  def next_weekday_after(from_date)
    target_indexes = weekday_list.filter_map { |day| WEEKDAYS.index(day) }
    return from_date + 1.week if target_indexes.empty?

    (1..7).each do |offset|
      candidate = from_date + offset.days
      candidate_index = (candidate.wday + 6) % 7
      return candidate if target_indexes.include?(candidate_index)
    end

    from_date + 1.week
  end

  def sync_completed_at
    if status == "Completed" && status_changed? && completed_at.blank?
      self.completed_at = Time.current
    elsif status != "Completed" && status_changed?
      self.completed_at = nil
    end
  end

  def record_created_activity
    ActivityLog.record!(subject: self, action: "Task created", details: title)
  end

  def record_status_activity
    ActivityLog.record!(subject: self, action: "Task status changed", details: "#{title}: #{status}")
  end
end

class User < ApplicationRecord
  ROLES = [ "admin", "team_member", "client" ].freeze
  STATUSES = [ "Active", "Inactive" ].freeze
  PAYMENT_TYPES = [ "fixed salary", "per project", "hourly", "per task", "commission" ].freeze

  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  has_many :assigned_leads, class_name: "Lead", foreign_key: :assigned_to_id, dependent: :nullify, inverse_of: :assigned_to
  has_many :assigned_projects, class_name: "Project", foreign_key: :assigned_to_id, dependent: :nullify, inverse_of: :assigned_to
  has_many :assigned_tasks, class_name: "Task", foreign_key: :assigned_to_id, dependent: :nullify, inverse_of: :assigned_to
  has_many :activity_logs, dependent: :nullify
  has_many :reminders, dependent: :destroy

  validates :role, inclusion: { in: ROLES }
  validates :status, inclusion: { in: STATUSES }

  def display_name
    name.presence || email
  end

  def admin?
    role == "admin"
  end
end

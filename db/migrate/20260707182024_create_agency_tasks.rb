class CreateAgencyTasks < ActiveRecord::Migration[8.0]
  def change
    create_table :agency_tasks, id: :uuid do |t|
      t.string :title, null: false
      t.text :description
      t.uuid :agency_task_category_id
      t.string :status, default: "Inbox", null: false
      t.string :priority, default: "Medium", null: false
      t.date :due_date
      t.date :start_date
      t.integer :estimated_minutes
      t.text :notes
      t.string :tags
      t.integer :position, default: 0, null: false
      t.datetime :completed_at
      t.string :recurrence_rule
      t.integer :recurrence_interval, default: 1
      t.string :recurrence_weekdays
      t.uuid :parent_recurring_task_id

      t.timestamps
    end

    add_index :agency_tasks, :status
    add_index :agency_tasks, :due_date
    add_index :agency_tasks, :agency_task_category_id
    add_index :agency_tasks, :parent_recurring_task_id
  end
end

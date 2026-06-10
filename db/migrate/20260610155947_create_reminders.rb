class CreateReminders < ActiveRecord::Migration[8.0]
  def change
    create_table :reminders, id: :uuid do |t|
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.references :remindable, polymorphic: true, null: true, type: :uuid
      t.string :title
      t.date :due_date
      t.string :status, null: false, default: "Open"
      t.string :next_action
      t.text :note

      t.timestamps
    end
  end
end

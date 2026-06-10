class CreateTasks < ActiveRecord::Migration[8.0]
  def change
    create_table :tasks, id: :uuid do |t|
      t.references :project, null: false, foreign_key: true, type: :uuid
      t.references :assigned_to, null: true, foreign_key: { to_table: :users }, type: :uuid
      t.string :title
      t.date :due_date
      t.string :priority, null: false, default: "Medium"
      t.string :status, null: false, default: "To Do"
      t.text :description
      t.text :checklist
      t.boolean :client_visible, null: false, default: false

      t.timestamps
    end
  end
end

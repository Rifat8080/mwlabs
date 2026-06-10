class CreateProjects < ActiveRecord::Migration[8.0]
  def change
    create_table :projects, id: :uuid do |t|
      t.references :client, null: false, foreign_key: true, type: :uuid
      t.references :quote, null: true, foreign_key: true, type: :uuid
      t.string :name
      t.string :service_category
      t.decimal :project_value, precision: 12, scale: 2, null: false, default: 0
      t.date :start_date
      t.date :deadline
      t.string :status, null: false, default: "Not Started"
      t.string :priority, null: false, default: "Medium"
      t.references :assigned_to, null: true, foreign_key: { to_table: :users }, type: :uuid
      t.integer :progress, null: false, default: 0
      t.text :internal_notes
      t.text :client_notes

      t.timestamps
    end
  end
end

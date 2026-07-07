class CreateChecklistItems < ActiveRecord::Migration[8.0]
  def change
    create_table :checklist_items, id: :uuid do |t|
      t.string :checklistable_type, null: false
      t.uuid :checklistable_id, null: false
      t.string :list_type
      t.string :title, null: false
      t.boolean :done, default: false, null: false
      t.integer :position, default: 0, null: false

      t.timestamps
    end

    add_index :checklist_items, [ :checklistable_type, :checklistable_id ]
  end
end

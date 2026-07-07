class CreateAgencyTaskCategories < ActiveRecord::Migration[8.0]
  def change
    create_table :agency_task_categories, id: :uuid do |t|
      t.string :name, null: false
      t.string :color, default: "blue", null: false
      t.integer :position, default: 0, null: false

      t.timestamps
    end

    add_index :agency_task_categories, :name, unique: true
  end
end

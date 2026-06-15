class CreateServices < ActiveRecord::Migration[8.0]
  def change
    create_table :services, id: :uuid do |t|
      t.string :name
      t.string :category
      t.text :description
      t.decimal :base_price, precision: 12, scale: 2, null: false, default: 0
      t.string :estimated_delivery_time
      t.text :required_inputs
      t.text :default_task_checklist
      t.string :status, null: false, default: "Active"

      t.timestamps
    end

    add_index :services, :category
    add_index :services, :status
  end
end

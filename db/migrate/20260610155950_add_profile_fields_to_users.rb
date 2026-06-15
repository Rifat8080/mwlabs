class AddProfileFieldsToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :name, :string
    add_column :users, :phone, :string
    add_column :users, :role, :string, null: false, default: "admin"
    add_column :users, :status, :string, null: false, default: "Active"
    add_column :users, :skill, :string
    add_column :users, :payment_type, :string
    add_column :users, :rate, :decimal, precision: 12, scale: 2, null: false, default: 0

    add_index :users, :role
    add_index :users, :status
  end
end

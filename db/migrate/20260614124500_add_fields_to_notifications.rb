class AddFieldsToNotifications < ActiveRecord::Migration[8.0]
  def change
    add_column :notifications, :url, :string
    add_column :notifications, :level, :string, default: "info", null: false
    add_column :notifications, :icon, :string
    add_index :notifications, :level
  end
end

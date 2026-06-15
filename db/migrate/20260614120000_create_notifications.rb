class CreateNotifications < ActiveRecord::Migration[8.0]
  def change
    create_table :notifications do |t|
      t.string :action, null: false
      t.references :recipient, polymorphic: true, null: false, index: true
      t.references :notifiable, polymorphic: true, index: true
      t.integer :actor_id
      t.string :actor_type
      t.jsonb :params, default: {}
      t.datetime :read_at

      t.timestamps
    end

    add_index :notifications, :read_at
    add_index :notifications, [ :recipient_type, :recipient_id, :read_at ], name: "index_notifications_on_recipient_and_read"
  end
end

class FixNotificationPolymorphicIds < ActiveRecord::Migration[8.0]
  def up
    execute "DELETE FROM notifications"

    remove_index :notifications, name: "index_notifications_on_recipient_and_read", if_exists: true
    remove_index :notifications, name: "index_notifications_on_recipient", if_exists: true
    remove_index :notifications, name: "index_notifications_on_notifiable", if_exists: true

    remove_column :notifications, :recipient_id, :bigint
    remove_column :notifications, :notifiable_id, :bigint
    remove_column :notifications, :actor_id, :integer

    add_column :notifications, :recipient_id, :uuid, null: false
    add_column :notifications, :notifiable_id, :uuid
    add_column :notifications, :actor_id, :uuid

    add_index :notifications, [ :recipient_type, :recipient_id ], name: "index_notifications_on_recipient"
    add_index :notifications, [ :recipient_type, :recipient_id, :read_at ], name: "index_notifications_on_recipient_and_read"
    add_index :notifications, [ :notifiable_type, :notifiable_id ], name: "index_notifications_on_notifiable"
  end

  def down
    execute "DELETE FROM notifications"

    remove_index :notifications, name: "index_notifications_on_recipient_and_read", if_exists: true
    remove_index :notifications, name: "index_notifications_on_recipient", if_exists: true
    remove_index :notifications, name: "index_notifications_on_notifiable", if_exists: true

    remove_column :notifications, :recipient_id, :uuid
    remove_column :notifications, :notifiable_id, :uuid
    remove_column :notifications, :actor_id, :uuid

    add_column :notifications, :recipient_id, :bigint, null: false
    add_column :notifications, :notifiable_id, :bigint
    add_column :notifications, :actor_id, :integer

    add_index :notifications, [ :recipient_type, :recipient_id ], name: "index_notifications_on_recipient"
    add_index :notifications, [ :recipient_type, :recipient_id, :read_at ], name: "index_notifications_on_recipient_and_read"
    add_index :notifications, [ :notifiable_type, :notifiable_id ], name: "index_notifications_on_notifiable"
  end
end

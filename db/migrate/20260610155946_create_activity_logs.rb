class CreateActivityLogs < ActiveRecord::Migration[8.0]
  def change
    create_table :activity_logs, id: :uuid do |t|
      t.references :user, null: true, foreign_key: true, type: :uuid
      t.references :subject, polymorphic: true, null: false, type: :uuid
      t.string :action
      t.text :details

      t.timestamps
    end
  end
end

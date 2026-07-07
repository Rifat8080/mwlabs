class CreateAiUsageLogs < ActiveRecord::Migration[8.0]
  def change
    create_table :ai_usage_logs, id: :uuid do |t|
      t.string :feature, null: false
      t.string :model
      t.integer :prompt_tokens
      t.integer :output_tokens
      t.integer :tokens_used
      t.string :status, default: "success", null: false
      t.text :error_message

      t.timestamps
    end

    add_index :ai_usage_logs, :feature
    add_index :ai_usage_logs, :status
    add_index :ai_usage_logs, :created_at
  end
end

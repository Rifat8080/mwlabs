class CreateAiAgentRuns < ActiveRecord::Migration[8.0]
  def change
    create_table :ai_agent_runs, id: :uuid do |t|
      t.string :agent_key, null: false
      t.string :feature
      t.uuid :user_id
      t.jsonb :input, default: {}, null: false
      t.text :output
      t.string :status, default: "success", null: false
      t.string :model
      t.integer :prompt_tokens
      t.integer :output_tokens
      t.integer :tokens_used
      t.integer :duration_ms
      t.text :error_message

      t.timestamps
    end

    add_index :ai_agent_runs, :agent_key
    add_index :ai_agent_runs, :status
    add_index :ai_agent_runs, :created_at
    add_index :ai_agent_runs, :user_id
  end
end

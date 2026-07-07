class CreateAiAssistantMessages < ActiveRecord::Migration[8.0]
  def change
    create_table :ai_assistant_messages, id: :uuid do |t|
      t.references :ai_assistant_conversation, null: false, foreign_key: true, type: :uuid
      t.string :role, null: false
      t.text :content
      t.string :feature
      t.jsonb :metadata, default: {}

      t.timestamps
    end

    add_index :ai_assistant_messages, :feature
  end
end

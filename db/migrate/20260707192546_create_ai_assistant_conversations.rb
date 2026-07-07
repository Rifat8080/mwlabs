class CreateAiAssistantConversations < ActiveRecord::Migration[8.0]
  def change
    create_table :ai_assistant_conversations, id: :uuid do |t|
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.string :title

      t.timestamps
    end
  end
end

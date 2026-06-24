class CreateAiReceptionistConversations < ActiveRecord::Migration[8.0]
  def change
    create_table :ai_receptionist_conversations, id: :uuid do |t|
      t.string :channel, null: false, default: "website"
      t.string :external_id
      t.string :visitor_token, null: false
      t.references :lead, null: true, foreign_key: true, type: :uuid
      t.string :status, null: false, default: "open"
      t.string :name
      t.string :email
      t.string :phone
      t.string :company_name
      t.string :service_interest
      t.decimal :budget, precision: 12, scale: 2
      t.string :urgency
      t.text :summary
      t.jsonb :metadata, null: false, default: {}
      t.datetime :last_message_at

      t.timestamps
    end

    add_index :ai_receptionist_conversations, :visitor_token, unique: true
    add_index :ai_receptionist_conversations, [ :channel, :external_id ],
      unique: true,
      where: "external_id IS NOT NULL",
      name: "index_ai_receptionist_conversations_on_channel_external"
    add_index :ai_receptionist_conversations, :status
    add_index :ai_receptionist_conversations, :last_message_at

    create_table :ai_receptionist_messages, id: :uuid do |t|
      t.references :ai_receptionist_conversation, null: false, foreign_key: true, type: :uuid
      t.string :role, null: false
      t.text :content, null: false
      t.string :llm_model
      t.jsonb :metadata, null: false, default: {}

      t.timestamps
    end

    add_index :ai_receptionist_messages,
      [ :ai_receptionist_conversation_id, :created_at ],
      name: "index_ai_receptionist_messages_on_conversation_created"
  end
end

class CreateAiKnowledgeEntries < ActiveRecord::Migration[8.0]
  def change
    create_table :ai_knowledge_entries, id: :uuid do |t|
      t.string :key, null: false
      t.text :value
      t.boolean :active, default: true, null: false

      t.timestamps
    end

    add_index :ai_knowledge_entries, :key, unique: true
  end
end

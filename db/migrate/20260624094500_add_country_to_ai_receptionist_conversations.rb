class AddCountryToAiReceptionistConversations < ActiveRecord::Migration[8.0]
  def change
    add_column :ai_receptionist_conversations, :country, :string
    add_index :ai_receptionist_conversations, :country
  end
end

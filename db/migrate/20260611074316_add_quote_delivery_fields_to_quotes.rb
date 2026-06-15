class AddQuoteDeliveryFieldsToQuotes < ActiveRecord::Migration[8.0]
  def change
    add_column :quotes, :sent_at, :datetime
    add_reference :quotes, :sent_by, type: :uuid, foreign_key: { to_table: :users }
    add_column :quotes, :public_token, :string
    add_column :quotes, :negotiation_status, :string, default: "none", null: false
    add_index :quotes, :public_token, unique: true
  end
end

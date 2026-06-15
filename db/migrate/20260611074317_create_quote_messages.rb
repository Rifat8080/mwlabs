class CreateQuoteMessages < ActiveRecord::Migration[8.0]
  def change
    create_table :quote_messages, id: :uuid do |t|
      t.references :quote, null: false, foreign_key: true, type: :uuid
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.text :message, null: false
      t.string :kind, null: false, default: "message"
      t.boolean :internal, null: false, default: false

      t.timestamps
    end
  end
end

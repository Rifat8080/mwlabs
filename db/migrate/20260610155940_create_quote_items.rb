class CreateQuoteItems < ActiveRecord::Migration[8.0]
  def change
    create_table :quote_items, id: :uuid do |t|
      t.references :quote, null: false, foreign_key: true, type: :uuid
      t.string :item_type
      t.string :name
      t.text :description
      t.decimal :quantity, precision: 10, scale: 2, null: false, default: 1
      t.decimal :unit_price, precision: 12, scale: 2, null: false, default: 0
      t.decimal :total, precision: 12, scale: 2, null: false, default: 0

      t.timestamps
    end
  end
end

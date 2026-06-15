class CreateQuotes < ActiveRecord::Migration[8.0]
  def change
    create_table :quotes, id: :uuid do |t|
      t.references :client, null: true, foreign_key: true, type: :uuid
      t.references :lead, null: true, foreign_key: true, type: :uuid
      t.string :status, null: false, default: "Draft"
      t.decimal :subtotal, precision: 12, scale: 2, null: false, default: 0
      t.decimal :discount, precision: 12, scale: 2, null: false, default: 0
      t.decimal :tax, precision: 12, scale: 2, null: false, default: 0
      t.decimal :total_amount, precision: 12, scale: 2, null: false, default: 0
      t.text :payment_terms
      t.string :delivery_timeline
      t.date :validity_date
      t.text :notes
      t.datetime :accepted_at

      t.timestamps
    end
  end
end

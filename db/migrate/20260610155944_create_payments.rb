class CreatePayments < ActiveRecord::Migration[8.0]
  def change
    create_table :payments, id: :uuid do |t|
      t.references :invoice, null: false, foreign_key: true, type: :uuid
      t.decimal :amount, precision: 12, scale: 2, null: false, default: 0
      t.string :payment_method
      t.string :transaction_reference
      t.date :payment_date
      t.text :note

      t.timestamps
    end
  end
end

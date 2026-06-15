class CreateInvoices < ActiveRecord::Migration[8.0]
  def change
    create_table :invoices, id: :uuid do |t|
      t.references :client, null: false, foreign_key: true, type: :uuid
      t.references :project, null: true, foreign_key: true, type: :uuid
      t.references :quote, null: true, foreign_key: true, type: :uuid
      t.string :invoice_number
      t.date :issue_date
      t.date :due_date
      t.decimal :subtotal, precision: 12, scale: 2, null: false, default: 0
      t.decimal :discount, precision: 12, scale: 2, null: false, default: 0
      t.decimal :tax, precision: 12, scale: 2, null: false, default: 0
      t.decimal :total, precision: 12, scale: 2, null: false, default: 0
      t.decimal :paid_amount, precision: 12, scale: 2, null: false, default: 0
      t.string :status, null: false, default: "Draft"
      t.text :notes

      t.timestamps
    end
  end
end

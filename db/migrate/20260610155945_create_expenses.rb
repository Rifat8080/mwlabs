class CreateExpenses < ActiveRecord::Migration[8.0]
  def change
    create_table :expenses, id: :uuid do |t|
      t.date :date
      t.string :category
      t.decimal :amount, precision: 12, scale: 2, null: false, default: 0
      t.string :payment_method
      t.references :project, null: true, foreign_key: true, type: :uuid
      t.references :client, null: true, foreign_key: true, type: :uuid
      t.text :note

      t.timestamps
    end
  end
end

class AddCurrencyToQuotes < ActiveRecord::Migration[8.0]
  def change
    add_column :quotes, :currency, :string, default: "USD", null: false
  end
end

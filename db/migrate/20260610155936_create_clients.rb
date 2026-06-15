class CreateClients < ActiveRecord::Migration[8.0]
  def change
    create_table :clients, id: :uuid do |t|
      t.string :name
      t.string :company_name
      t.string :email
      t.string :phone
      t.string :country
      t.string :status, null: false, default: "Active"
      t.string :source
      t.text :notes
      t.date :follow_up_date
      t.string :next_action

      t.timestamps
    end

    add_index :clients, :email
    add_index :clients, :status
  end
end

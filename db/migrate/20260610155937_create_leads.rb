class CreateLeads < ActiveRecord::Migration[8.0]
  def change
    create_table :leads, id: :uuid do |t|
      t.string :name
      t.string :phone
      t.string :email
      t.string :company_name
      t.string :country
      t.string :source
      t.string :service_interest
      t.decimal :budget
      t.string :urgency
      t.text :message
      t.string :status, null: false, default: "New"
      t.references :assigned_to, null: true, foreign_key: { to_table: :users }, type: :uuid
      t.date :follow_up_date
      t.text :notes
      t.references :client, null: true, foreign_key: true, type: :uuid

      t.timestamps
    end
  end
end

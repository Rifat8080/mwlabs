class CreateDailyPlans < ActiveRecord::Migration[8.0]
  def change
    create_table :daily_plans, id: :uuid do |t|
      t.date :date, null: false
      t.text :focus
      t.text :top_priorities
      t.text :notes
      t.text :wins
      t.text :tomorrow_plan

      t.timestamps
    end

    add_index :daily_plans, :date, unique: true
  end
end

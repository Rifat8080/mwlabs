class CreateAiPrompts < ActiveRecord::Migration[8.0]
  def change
    create_table :ai_prompts, id: :uuid do |t|
      t.string :name, null: false
      t.string :category, null: false
      t.text :prompt_text, null: false
      t.boolean :active, default: true, null: false

      t.timestamps
    end

    add_index :ai_prompts, :name, unique: true
    add_index :ai_prompts, :category
  end
end

class CreateMarketingItems < ActiveRecord::Migration[8.0]
  def change
    create_table :marketing_items, id: :uuid do |t|
      t.string :title, null: false
      t.string :platform
      t.string :content_type
      t.string :topic
      t.text :description
      t.string :target_audience
      t.string :keywords
      t.string :hashtags
      t.string :cta
      t.date :publish_on
      t.string :status, default: "Idea", null: false
      t.text :notes
      t.integer :position, default: 0, null: false

      t.timestamps
    end

    add_index :marketing_items, :status
    add_index :marketing_items, :platform
    add_index :marketing_items, :publish_on
  end
end

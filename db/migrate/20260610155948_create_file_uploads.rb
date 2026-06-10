class CreateFileUploads < ActiveRecord::Migration[8.0]
  def change
    create_table :file_uploads, id: :uuid do |t|
      t.references :client, null: true, foreign_key: true, type: :uuid
      t.references :project, null: true, foreign_key: true, type: :uuid
      t.references :task, null: true, foreign_key: true, type: :uuid
      t.string :category
      t.string :visibility
      t.boolean :downloadable, null: false, default: true
      t.boolean :needs_approval, null: false, default: false
      t.string :status, null: false, default: "Uploaded"
      t.text :note

      t.timestamps
    end
  end
end

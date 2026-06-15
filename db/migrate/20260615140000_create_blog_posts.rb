class CreateBlogPosts < ActiveRecord::Migration[8.0]
  def change
    create_table :blog_posts, id: :uuid do |t|
      t.string :title, null: false
      t.string :slug, null: false
      t.text :excerpt
      t.text :body, null: false
      t.string :category, null: false
      t.string :status, null: false, default: "Draft"
      t.references :author, null: false, foreign_key: { to_table: :users }, type: :uuid
      t.datetime :published_at
      t.string :meta_title
      t.text :meta_description
      t.boolean :featured, null: false, default: false

      t.timestamps
    end

    add_index :blog_posts, :slug, unique: true
    add_index :blog_posts, :status
    add_index :blog_posts, :published_at
    add_index :blog_posts, :category
  end
end

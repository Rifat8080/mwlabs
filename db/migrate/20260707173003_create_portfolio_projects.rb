class CreatePortfolioProjects < ActiveRecord::Migration[8.0]
  def change
    create_table :portfolio_projects, id: :uuid do |t|
      t.string :title, null: false
      t.string :slug, null: false
      t.string :client_name
      t.string :category
      t.text :summary
      t.string :project_url
      t.integer :result_metric_value
      t.string :result_metric_suffix
      t.string :result_metric_label
      t.string :technologies
      t.date :completed_on
      t.string :status, default: "Draft", null: false
      t.integer :display_order, default: 0, null: false
      t.boolean :featured, default: false, null: false

      t.timestamps
    end

    add_index :portfolio_projects, :slug, unique: true
    add_index :portfolio_projects, :status
    add_index :portfolio_projects, :category
  end
end

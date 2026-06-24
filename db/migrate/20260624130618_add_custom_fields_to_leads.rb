class AddCustomFieldsToLeads < ActiveRecord::Migration[8.0]
  def change
    add_column :leads, :custom_fields, :jsonb, null: false, default: []
  end
end

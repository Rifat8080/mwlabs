class RenameAiReceptionistMessageModelNameToLlmModel < ActiveRecord::Migration[8.0]
  def up
    return unless table_exists?(:ai_receptionist_messages)
    return if column_exists?(:ai_receptionist_messages, :llm_model)

    rename_column :ai_receptionist_messages, :model_name, :llm_model if column_exists?(:ai_receptionist_messages, :model_name)
  end

  def down
    return unless table_exists?(:ai_receptionist_messages)
    return if column_exists?(:ai_receptionist_messages, :model_name)

    rename_column :ai_receptionist_messages, :llm_model, :model_name if column_exists?(:ai_receptionist_messages, :llm_model)
  end
end

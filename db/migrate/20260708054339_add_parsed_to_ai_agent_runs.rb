class AddParsedToAiAgentRuns < ActiveRecord::Migration[8.0]
  def change
    add_column :ai_agent_runs, :parsed, :jsonb
  end
end

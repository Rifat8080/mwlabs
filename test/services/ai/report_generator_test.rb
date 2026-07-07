require "test_helper"

module Ai
  class ReportGeneratorTest < ActiveSupport::TestCase
    test "weekly_report summarizes completed and pending work" do
      AgencyTask.create!(title: "Done task", status: "Completed", priority: "Medium", completed_at: Time.current)
      fake = fake_client("Great week!")

      result = Ai::ReportGenerator.new(gemini_client: fake).weekly_report
      assert_equal "Great week!", result[:content]
    end

    test "productivity_analysis returns a score and suggestions" do
      AgencyTask.create!(title: "Task", status: "Completed", priority: "Medium")
      fake = fake_client("Productivity score: 80")

      result = Ai::ReportGenerator.new(gemini_client: fake).productivity_analysis
      assert_equal "Productivity score: 80", result[:content]
    end

    private

    def fake_client(content)
      client = Object.new
      client.define_singleton_method(:generate) do |**|
        { content: content, model: "gemini-2.5-flash", prompt_tokens: 1, output_tokens: 1, total_tokens: 2 }
      end
      client
    end
  end
end

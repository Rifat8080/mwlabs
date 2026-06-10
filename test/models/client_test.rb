require "test_helper"

class ClientTest < ActiveSupport::TestCase
  test "destroying client marks linked leads lost" do
    client = Client.create!(name: "ABC Ltd", email: "client@example.com")
    lead = Lead.create!(name: "Ahmed Khan", email: "ahmed@example.com", status: "Won", client: client)

    client.destroy!

    assert_equal "Lost", lead.reload.status
    assert_nil lead.client
  end
end

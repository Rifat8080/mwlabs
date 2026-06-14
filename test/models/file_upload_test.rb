require "test_helper"

class FileUploadTest < ActiveSupport::TestCase
  setup do
    @client = Client.create!(name: "File Client", email: "file-client@example.com")
    @project = Project.create!(name: "File Project", client: @client)
    @task = Task.create!(title: "Design task", project: @project)
  end

  test "requires an attached file on create" do
    upload = FileUpload.new(project: @project, category: "Design Files")

    assert_not upload.valid?
    assert_includes upload.errors[:file], "must be attached"
  end

  test "syncs project and client from task" do
    upload = build_upload(task: @task)

    assert upload.valid?
    assert_equal @project, upload.project
    assert_equal @client, upload.client
  end

  test "rejects task that does not belong to selected project" do
    other_project = Project.create!(name: "Other Project", client: @client)
    upload = build_upload(project: other_project, task: @task)

    assert_not upload.valid?
    assert_includes upload.errors[:task], "must belong to the selected project"
  end

  test "rejects client that does not match project client" do
    other_client = Client.create!(name: "Other Client", email: "other@example.com")
    upload = build_upload(project: @project, client: other_client)

    assert_not upload.valid?
    assert_includes upload.errors[:client], "must match the selected project's client"
  end

  test "allows update without re-uploading file" do
    upload = create_upload!(project: @project, task: @task, note: "Original note")

    upload.note = "Updated note"

    assert upload.valid?
    assert upload.save
    assert upload.file.attached?
  end

  private

  def build_upload(attrs = {})
    upload = FileUpload.new({ category: "Design Files", visibility: "Internal Only" }.merge(attrs))
    upload.file.attach(io: StringIO.new("sample file"), filename: "sample.txt", content_type: "text/plain") unless upload.file.attached?
    upload
  end

  def create_upload!(attrs = {})
    upload = build_upload(attrs)
    upload.save!
    upload
  end
end

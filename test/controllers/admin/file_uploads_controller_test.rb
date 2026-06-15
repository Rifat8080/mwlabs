require "test_helper"

module Admin
  class FileUploadsControllerTest < ActionDispatch::IntegrationTest
    setup do
      @admin = users(:admin)
      @client_user = users(:client)
      @team_member = users(:team_member)
      @client = Client.create!(name: "Portal Client", email: @client_user.email)
      @project = Project.create!(name: "Portal Project", client: @client, assigned_to: @team_member)
      @task = Task.create!(title: "Portal Task", project: @project, assigned_to: @team_member)
      @upload = create_file_upload!(project: @project, task: @task, client: @client, visibility: "Client Visible")
    end

    test "admin can create file linked to project and task" do
      sign_in @admin

      assert_difference -> { FileUpload.count }, 1 do
        post admin_file_uploads_url, params: {
          file_upload: {
            client_id: @client.id,
            project_id: @project.id,
            task_id: @task.id,
            category: "Design Files",
            visibility: "Client Visible",
            downloadable: true,
            status: "Uploaded",
            file: uploaded_file
          }
        }
      end

      upload = FileUpload.order(:created_at).last

      assert_redirected_to admin_file_upload_url(upload)
      assert_equal @project, upload.project
      assert_equal @task, upload.task
      assert upload.file.attached?
    end

    test "new file form preselects project and task from query params" do
      sign_in @admin

      get new_admin_file_upload_url(project_id: @project.id, task_id: @task.id)

      assert_response :success
      assert_select "select[name='file_upload[project_id]'] option[selected]", text: /Portal Project/
      assert_select "select[name='file_upload[task_id]'] option[selected]", text: /Portal Task/
    end

    test "admin can view file show page with edit action" do
      sign_in @admin

      get admin_file_upload_url(@upload)

      assert_response :success
      assert_select "h1", text: /sample\.txt/
      assert_select "a[href='#{edit_admin_file_upload_path(@upload)}']", text: /Edit/
      assert_select "a[href='#{download_admin_file_upload_path(@upload)}']", text: /Download/
    end

    test "admin can download attached file" do
      sign_in @admin

      get download_admin_file_upload_url(@upload)

      assert_response :redirect
      assert_match %r{/rails/active_storage/}, response.location
    end

    test "client can download visible downloadable file" do
      sign_in @client_user

      get download_admin_file_upload_url(@upload)

      assert_response :redirect
      assert_match %r{/rails/active_storage/}, response.location
    end

    test "client cannot download when downloadable is disabled" do
      @upload.update!(downloadable: false)
      sign_in @client_user

      get download_admin_file_upload_url(@upload)

      assert_redirected_to admin_file_upload_url(@upload)
      assert_equal "This file is view-only and cannot be downloaded.", flash[:alert]
    end

    test "project page shows linked files and download action" do
      sign_in @admin

      get admin_project_url(@project)

      assert_response :success
      assert_select "#project-files", text: /sample\.txt/
      assert_select "a[href='#{download_admin_file_upload_path(@upload)}']", text: /Download/
    end

    private

    def uploaded_file
      Rack::Test::UploadedFile.new(StringIO.new("new upload"), "text/plain", original_filename: "new-upload.txt")
    end

    def create_file_upload!(attrs = {})
      upload = FileUpload.new({
        category: "Design Files",
        visibility: "Internal Only",
        downloadable: true,
        status: "Uploaded"
      }.merge(attrs))
      upload.file.attach(io: StringIO.new("sample file"), filename: "sample.txt", content_type: "text/plain")
      upload.save!
      upload
    end
  end
end

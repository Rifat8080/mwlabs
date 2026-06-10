require "test_helper"

class AuthPagesTest < ActionDispatch::IntegrationTest
  test "login page uses branded portal design" do
    get new_user_session_url

    assert_response :success
    assert_select "h1", "Welcome back to your M&W Labs workspace."
    assert_select "input[name='user[email]']"
    assert_select "input[name='user[password]']"
  end

  test "signup page uses branded portal design" do
    get new_user_registration_url

    assert_response :success
    assert_select "h1", "Create your client portal account."
    assert_select "input[name='user[name]']"
    assert_select "input[name='user[phone]']"
  end

  test "forgot password page uses branded recovery design" do
    get new_user_password_url

    assert_response :success
    assert_select "h1", "Recover access to your M&W Labs workspace."
    assert_select "input[name='user[email]']"
    assert_select "input[type='submit'][value='Send Reset Instructions']"
  end

  test "public signup creates client account" do
    assert_difference("User.count", 1) do
      post user_registration_url, params: {
        user: {
          name: "New Client",
          phone: "+8801712345678",
          email: "new-client@example.com",
          password: "password123",
          password_confirmation: "password123"
        }
      }
    end

    user = User.find_by!(email: "new-client@example.com")
    assert_equal "client", user.role
    assert_equal "Active", user.status
  end
end

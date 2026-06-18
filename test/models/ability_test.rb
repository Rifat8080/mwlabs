require "test_helper"

class AbilityTest < ActiveSupport::TestCase
  setup do
    @admin = users(:admin)
    @team_member = users(:team_member)
    @client_user = users(:client)
    @client = Client.create!(name: "Ability Client", email: @client_user.email)
  end

  test "admin can manage every application resource" do
    ability = Ability.new(@admin)

    assert ability.can?(:manage, Lead)
    assert ability.can?(:manage, User)
    assert ability.can?(:manage, BlogPost)
  end

  test "team member can manage assigned delivery and content but not finance or users" do
    assigned_project = Project.create!(name: "Assigned Build", client: @client, assigned_to: @team_member)
    assigned_task = Task.create!(title: "Assigned project task", project: assigned_project)
    other_project = Project.create!(name: "Other Build", client: @client)
    assigned_lead = Lead.create!(name: "Assigned Lead", email: "assigned@example.com", assigned_to: @team_member)
    other_lead = Lead.create!(name: "Other Lead", email: "other@example.com")
    ability = Ability.new(@team_member)

    assert ability.can?(:manage, assigned_project)
    assert ability.can?(:manage, assigned_task)
    assert ability.can?(:manage, assigned_lead)
    assert ability.can?(:manage, BlogPost.new(author: @team_member))
    assert ability.cannot?(:manage, other_project)
    assert ability.cannot?(:manage, other_lead)
    assert ability.cannot?(:manage, Invoice.new(client: @client))
    assert ability.cannot?(:manage, @admin)
  end

  test "team member quote and file scopes follow assigned leads and projects" do
    assigned_lead = Lead.create!(name: "Scoped Lead", email: "scoped-lead@example.com", assigned_to: @team_member)
    assigned_project = Project.create!(name: "Scoped Project", client: @client, assigned_to: @team_member)
    assigned_quote = Quote.create!(lead: assigned_lead, status: "Draft", total_amount: 100)
    project_quote = Quote.create!(client: @client, status: "Draft", total_amount: 200)
    project_quote.projects << assigned_project
    other_quote = Quote.create!(client: @client, status: "Draft", total_amount: 300)
    ability = Ability.new(@team_member)

    assert_includes ability.resource_scope(Quote), assigned_quote
    assert_includes ability.resource_scope(Quote), project_quote
    assert_not_includes ability.resource_scope(Quote), other_quote
  end

  test "client can read only portal visible records and cannot manage them" do
    project = Project.create!(name: "Client Portal Project", client: @client)
    visible_task = Task.create!(title: "Visible Task", project: project, client_visible: true)
    internal_task = Task.create!(title: "Internal Task", project: project, client_visible: false)
    visible_quote = Quote.create!(client: @client, status: "Sent", total_amount: 100)
    draft_quote = Quote.create!(client: @client, status: "Draft", total_amount: 100)
    invoice = Invoice.create!(client: @client, project: project, subtotal: 100, total: 100)
    ability = Ability.new(@client_user)

    assert ability.can?(:read, project)
    assert ability.can?(:read, visible_task)
    assert ability.can?(:read, visible_quote)
    assert ability.can?(:read, invoice)
    assert ability.cannot?(:read, internal_task)
    assert ability.cannot?(:read, draft_quote)
    assert ability.cannot?(:manage, project)
  end

  test "guests can create leads and read only published blog posts" do
    published = create_blog_post_for_tests!(
      title: "Published Insight",
      status: "Published",
      published_at: 1.day.ago,
      author: @admin
    )
    draft = create_blog_post_for_tests!(
      title: "Draft Insight",
      author: @admin
    )
    ability = Ability.new(nil)

    assert ability.can?(:create, Lead.new)
    assert ability.can?(:read, published)
    assert ability.cannot?(:read, draft)
    assert ability.cannot?(:read, Project.new(client: @client))
  end
end

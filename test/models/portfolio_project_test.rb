require "test_helper"

class PortfolioProjectTest < ActiveSupport::TestCase
  test "generates unique slug from title" do
    first = create_project!(title: "Fintech Website Build")
    second = create_project!(title: "Fintech Website Build")

    assert_equal "fintech-website-build", first.slug
    assert_equal "fintech-website-build-2", second.slug
  end

  test "published scope includes only published projects" do
    live = create_project!(status: "Published")
    draft = create_project!(status: "Draft", title: "Draft Project")

    assert_includes PortfolioProject.published, live
    assert_not_includes PortfolioProject.published, draft
  end

  test "by_category scope filters by category" do
    marketing = create_project!(title: "Ad Campaign", category: "Digital Marketing")
    web = create_project!(title: "Website Build", category: "Web Development")

    results = PortfolioProject.by_category("Digital Marketing")

    assert_includes results, marketing
    assert_not_includes results, web
  end

  test "technology_list splits comma separated technologies" do
    project = create_project!(technologies: "Ruby on Rails, React, Tailwind CSS")

    assert_equal [ "Ruby on Rails", "React", "Tailwind CSS" ], project.technology_list
  end

  test "rejects cover images larger than 25 MB" do
    project = create_project!
    project.cover_image.attach(
      io: StringIO.new("x" * (PortfolioProject::COVER_IMAGE_MAX_SIZE + 1)),
      filename: "large.png",
      content_type: "image/png"
    )

    assert_not project.valid?
    assert_includes project.errors[:cover_image], "must be smaller than 25 MB"
  end

  test "requires a valid status" do
    project = PortfolioProject.new(title: "Invalid Status Project", status: "Archived")

    assert_not project.valid?
    assert_includes project.errors[:status], "is not included in the list"
  end

  private

  def create_project!(attrs = {})
    PortfolioProject.create!({
      title: "Sample Project",
      client_name: "Acme",
      category: "Web Development",
      summary: "Sample summary",
      status: "Draft"
    }.merge(attrs))
  end
end

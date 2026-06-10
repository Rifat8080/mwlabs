# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
services = [
  {
    name: "Business Website",
    category: "Software & Web Development",
    base_price: 500,
    estimated_delivery_time: "2-4 weeks",
    required_inputs: "Brand information, logo, copy, domain/hosting access, reference websites",
    default_task_checklist: [
      "Collect brand information",
      "Collect logo and brand assets",
      "Collect domain and hosting access",
      "Create sitemap",
      "Design homepage",
      "Design service pages",
      "Develop frontend",
      "Develop backend",
      "Set up contact form",
      "Test mobile responsiveness",
      "Connect analytics",
      "Deploy website",
      "Final client review"
    ].join("\n")
  },
  {
    name: "Google Ads Campaign",
    category: "Digital Marketing",
    base_price: 300,
    estimated_delivery_time: "1-2 weeks setup",
    required_inputs: "Business details, target location, offer, landing page, ad account access",
    default_task_checklist: [
      "Collect business details",
      "Collect target location",
      "Keyword research",
      "Competitor research",
      "Ad copy writing",
      "Creative design",
      "Campaign setup",
      "Conversion tracking",
      "Launch campaign",
      "Weekly report",
      "Optimization"
    ].join("\n")
  },
  {
    name: "Logo Design",
    category: "Branding & Design",
    base_price: 100,
    estimated_delivery_time: "3-7 days",
    required_inputs: "Business name, colors, references, brand personality",
    default_task_checklist: [
      "Collect brand brief",
      "Research competitors",
      "Create logo concepts",
      "Client review",
      "Apply revisions",
      "Prepare final files"
    ].join("\n")
  },
  {
    name: "Video Editing",
    category: "Video Editing",
    base_price: 150,
    estimated_delivery_time: "3-10 days",
    required_inputs: "Raw footage, brand assets, script, music preference, reference videos",
    default_task_checklist: [
      "Collect raw footage",
      "Collect brand assets",
      "Create first cut",
      "Add captions",
      "Add motion graphics",
      "Add music",
      "Export preview",
      "Client revision",
      "Final delivery"
    ].join("\n")
  },
  {
    name: "AI Lead Qualification",
    category: "AI Automation",
    base_price: 400,
    estimated_delivery_time: "2-3 weeks",
    required_inputs: "Lead sources, qualification rules, CRM access, messaging scripts",
    default_task_checklist: [
      "Map lead sources",
      "Define qualification criteria",
      "Design automation workflow",
      "Build qualification assistant",
      "Test handoff rules",
      "Deploy automation",
      "Review lead quality"
    ].join("\n")
  }
]

services.each do |attributes|
  Service.find_or_create_by!(name: attributes[:name]) do |service|
    service.assign_attributes(attributes.merge(status: "Active"))
  end
end

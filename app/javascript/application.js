// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails
import "@hotwired/turbo-rails"
import "controllers"
import "notifications"

// Load ActionCable after Stimulus so the notification dropdown still works if cable fails.
import("channels").catch((error) => {
  console.warn("Realtime notifications unavailable:", error)
})
import "flowbite"
import "@fortawesome/fontawesome-free"
import { initProjectFilters } from "project_filters"
import { initTestimonials } from "testimonials"

document.addEventListener("turbo:load", () => {
  initProjectFilters()
  initTestimonials()
})

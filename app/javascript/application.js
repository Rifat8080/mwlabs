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

const hideSiteLoader = () => {
  document.body.classList.add("site-loaded")
}

window.addEventListener("load", hideSiteLoader, { once: true })

document.addEventListener("turbo:load", () => {
  window.requestAnimationFrame(hideSiteLoader)
  initProjectFilters()
  initTestimonials()
})

// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails
import "@hotwired/turbo-rails"
import "controllers"
import "flowbite"
import "@fortawesome/fontawesome-free"
import { initProjectFilters } from "project_filters"
import { initTestimonials } from "testimonials"

document.addEventListener("turbo:load", () => {
  initProjectFilters()
  initTestimonials()
})

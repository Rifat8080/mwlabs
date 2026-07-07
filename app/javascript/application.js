// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails
import "@hotwired/turbo-rails"
import "controllers"
import "notifications"
import "flowbite"
import "@fortawesome/fontawesome-free"
import { initProjectFilters } from "project_filters"
import { initTestimonials } from "testimonials"
import { initLandingEffects } from "landing_effects"
import { initProjectGalleries, initProjectShowcases } from "project_gallery"

const hideSiteLoader = () => {
  document.body.classList.add("site-loaded")
}

window.addEventListener("load", hideSiteLoader, { once: true })

document.addEventListener("turbo:load", () => {
  window.requestAnimationFrame(hideSiteLoader)
  initProjectFilters()
  initTestimonials()
  initLandingEffects()
  initProjectGalleries()
  initProjectShowcases()
})

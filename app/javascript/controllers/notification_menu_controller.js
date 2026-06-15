import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["button", "panel"]

  connect() {
    this.boundCloseOnOutsideClick = this.closeOnOutsideClick.bind(this)
    this.boundCloseOnEscape = this.closeOnEscape.bind(this)
    document.addEventListener("click", this.boundCloseOnOutsideClick)
    document.addEventListener("keydown", this.boundCloseOnEscape)
  }

  disconnect() {
    document.removeEventListener("click", this.boundCloseOnOutsideClick)
    document.removeEventListener("keydown", this.boundCloseOnEscape)
  }

  toggle(event) {
    event.preventDefault()
    event.stopPropagation()

    this.panelTarget.classList.toggle("hidden")
    this.buttonTarget.setAttribute("aria-expanded", (!this.panelTarget.classList.contains("hidden")).toString())
  }

  close() {
    this.panelTarget.classList.add("hidden")
    this.buttonTarget.setAttribute("aria-expanded", "false")
  }

  closeOnOutsideClick(event) {
    if (this.element.contains(event.target)) return

    this.close()
  }

  closeOnEscape(event) {
    if (event.key !== "Escape") return

    this.close()
  }
}

import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["button", "panel"]

  connect() {
    this.boundCloseOnOutsideClick = this.closeOnOutsideClick.bind(this)
    this.boundCloseOnEscape = this.closeOnEscape.bind(this)
    this.boundFitPanelWithinViewport = this.fitPanelWithinViewport.bind(this)
    document.addEventListener("click", this.boundCloseOnOutsideClick)
    document.addEventListener("keydown", this.boundCloseOnEscape)
    window.addEventListener("resize", this.boundFitPanelWithinViewport)
  }

  disconnect() {
    document.removeEventListener("click", this.boundCloseOnOutsideClick)
    document.removeEventListener("keydown", this.boundCloseOnEscape)
    window.removeEventListener("resize", this.boundFitPanelWithinViewport)
  }

  toggle(event) {
    event.preventDefault()
    event.stopPropagation()

    this.panelTarget.classList.toggle("hidden")
    this.buttonTarget.setAttribute("aria-expanded", (!this.panelTarget.classList.contains("hidden")).toString())

    if (!this.panelTarget.classList.contains("hidden")) {
      this.fitPanelWithinViewport()
    }
  }

  close() {
    this.panelTarget.classList.add("hidden")
    this.panelTarget.style.transform = ""
    this.buttonTarget.setAttribute("aria-expanded", "false")
  }

  fitPanelWithinViewport() {
    if (!this.hasPanelTarget || this.panelTarget.classList.contains("hidden")) return

    this.panelTarget.style.transform = ""

    const viewportPadding = 16
    const panelRect = this.panelTarget.getBoundingClientRect()
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth
    const minRight = viewportWidth - viewportPadding
    let horizontalShift = 0

    if (panelRect.left < viewportPadding) {
      horizontalShift = viewportPadding - panelRect.left
    } else if (panelRect.right > minRight) {
      horizontalShift = minRight - panelRect.right
    }

    if (horizontalShift !== 0) {
      this.panelTarget.style.transform = `translateX(${horizontalShift}px)`
    }
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

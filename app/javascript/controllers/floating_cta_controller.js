import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  connect() {
    this.closed = false
    this.onScroll = this.revealOnScroll.bind(this)
    window.addEventListener("scroll", this.onScroll, { passive: true })
    this.revealOnScroll()
  }

  disconnect() {
    window.removeEventListener("scroll", this.onScroll)
  }

  close() {
    this.closed = true
    this.hide()
  }

  revealOnScroll() {
    if (this.closed) return

    if (window.scrollY > 360) {
      this.show()
    } else {
      this.hide()
    }
  }

  show() {
    this.element.classList.remove("pointer-events-none", "translate-y-4", "opacity-0")
  }

  hide() {
    this.element.classList.add("pointer-events-none", "translate-y-4", "opacity-0")
  }
}

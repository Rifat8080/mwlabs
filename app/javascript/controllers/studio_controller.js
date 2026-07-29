import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = { bundle: String }

  async connect() {
    this.disconnected = false

    try {
      const studio = await import(this.bundleValue)
      if (this.disconnected) return

      this.unmount = await studio.mountStudio(this.element)
    } catch (error) {
      document.documentElement.classList.remove("studio-loading")
      console.error("M&W Labs studio bundle could not start.", error)
    }
  }

  disconnect() {
    this.disconnected = true
    this.unmount?.()
  }
}

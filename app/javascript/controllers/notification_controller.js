import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  async markAsRead(event) {
    event.preventDefault()
    const button = event.currentTarget
    const url = button.dataset.notificationUrl

    if (!url) return

    button.disabled = true

    try {
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]').content,
          "Accept": "text/vnd.turbo-stream.html",
          "X-Requested-With": "XMLHttpRequest"
        }
      })

      if (response.ok) {
        const html = await response.text()
        window.Turbo.renderStreamMessage(html)
      } else {
        button.disabled = false
      }
    } catch (error) {
      button.disabled = false
      console.error("Failed to mark notification as read:", error)
    }
  }
}

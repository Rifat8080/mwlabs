import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["day"]
  static values = { month: String }

  dragStart(event) {
    event.dataTransfer.setData("text/plain", event.currentTarget.dataset.marketingItemId)
    event.dataTransfer.effectAllowed = "move"
    event.currentTarget.classList.add("opacity-40")
  }

  dragEnd(event) {
    event.currentTarget.classList.remove("opacity-40")
  }

  allowDrop(event) {
    event.preventDefault()
    event.currentTarget.classList.add("bg-blue-50")
  }

  dragLeave(event) {
    event.currentTarget.classList.remove("bg-blue-50")
  }

  drop(event) {
    event.preventDefault()

    const day = event.currentTarget
    day.classList.remove("bg-blue-50")

    const itemId = event.dataTransfer.getData("text/plain")
    const date = day.dataset.date

    if (!itemId || !date) return

    fetch(`/admin/marketing-planner/${itemId}/move`, {
      method: "PATCH",
      headers: {
        "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]')?.content,
        "Accept": "text/vnd.turbo-stream.html",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ publish_on: date, month: this.monthValue })
    })
      .then((response) => response.text())
      .then((html) => window.Turbo.renderStreamMessage(html))
  }
}

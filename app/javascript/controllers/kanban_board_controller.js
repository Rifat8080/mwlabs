import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["column"]

  dragStart(event) {
    event.dataTransfer.setData("text/plain", event.currentTarget.dataset.agencyTaskId)
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

    const column = event.currentTarget
    column.classList.remove("bg-blue-50")

    const taskId = event.dataTransfer.getData("text/plain")
    const status = column.dataset.status

    if (!taskId || !status) return

    fetch(`/admin/tasks-manager/${taskId}/move`, {
      method: "PATCH",
      headers: {
        "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]')?.content,
        "Accept": "text/vnd.turbo-stream.html",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status })
    })
      .then((response) => response.text())
      .then((html) => window.Turbo.renderStreamMessage(html))
  }
}

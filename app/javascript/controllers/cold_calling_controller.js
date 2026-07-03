import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["form", "status"]

  connect() {
    this.isSaving = false
    this.statusTarget?.textContent = "Autosave is active."
  }

  async saveForm(event) {
    if (event?.target && !event.target.matches("textarea, input, select")) return
    if (!this.hasFormTarget) return
    if (this.isSaving) return

    this.isSaving = true
    this.showStatus("Saving answers…")

    const form = this.formTarget
    const formData = new FormData(form)
    const actionUrl = form.action

    try {
      const response = await fetch(actionUrl, {
        method: "PATCH",
        body: formData,
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]').content
        },
        credentials: "same-origin"
      })

      if (!response.ok) {
        this.showStatus("Could not save call notes.")
        return
      }

      const html = await response.text()
      const fragment = document.createElement("div")
      fragment.innerHTML = html

      const panel = fragment.querySelector("[data-cold-calling-panel]")
      if (panel) {
        this.element.replaceWith(panel)
        return
      }

      this.showStatus("Saved successfully.")
    } catch (error) {
      this.showStatus("Save failed.")
      console.error("Cold calling save failed:", error)
    } finally {
      this.isSaving = false
    }
  }

  async submit(event) {
    event.preventDefault()
    await this.saveForm()
  }

  showStatus(message) {
    if (this.hasStatusTarget) {
      this.statusTarget.textContent = message
    }
  }
}

import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [
    "checkbox", "selectAll", "bar", "count",
    "deleteForm", "assignForm", "statusForm",
    "assignSubmit", "statusSubmit"
  ]

  connect() {
    this.refresh()
  }

  toggleAll(event) {
    const checked = event.target.checked

    this.visibleCheckboxes().forEach((checkbox) => {
      checkbox.checked = checked
    })

    this.refresh()
  }

  refresh() {
    const visible = this.visibleCheckboxes()
    const visibleIds = new Set(visible.map((checkbox) => checkbox.value))
    const selectedVisible = visible.filter((checkbox) => checkbox.checked)
    const count = this.selectedIds().length

    if (this.hasBarTarget) this.barTarget.classList.toggle("hidden", count === 0)
    if (this.hasCountTarget) {
      this.countTarget.textContent = count === 1 ? "1 lead selected" : `${count} leads selected`
    }
    if (this.hasAssignSubmitTarget) this.assignSubmitTarget.disabled = count === 0
    if (this.hasStatusSubmitTarget) this.statusSubmitTarget.disabled = count === 0

    if (this.hasSelectAllTarget) {
      this.selectAllTarget.checked = visibleIds.size > 0 && selectedVisible.length === visibleIds.size
      this.selectAllTarget.indeterminate = selectedVisible.length > 0 && selectedVisible.length < visibleIds.size
    }
  }

  clear() {
    this.checkboxTargets.forEach((checkbox) => { checkbox.checked = false })
    if (this.hasSelectAllTarget) {
      this.selectAllTarget.checked = false
      this.selectAllTarget.indeterminate = false
    }
    this.refresh()
  }

  visibleCheckboxes() {
    return this.checkboxTargets.filter((checkbox) => {
      const row = checkbox.closest('[data-table-filter-target="row"]')
      return !row || !row.classList.contains("hidden")
    })
  }

  selectedIds() {
    const ids = this.checkboxTargets.filter((checkbox) => checkbox.checked).map((checkbox) => checkbox.value)
    return [ ...new Set(ids) ]
  }

  injectIds(event) {
    const form = event.target
    form.querySelectorAll("[data-bulk-id-field]").forEach((field) => field.remove())

    const ids = this.selectedIds()
    if (ids.length === 0) {
      event.preventDefault()
      return
    }

    ids.forEach((id) => {
      const input = document.createElement("input")
      input.type = "hidden"
      input.name = "lead_ids[]"
      input.value = id
      input.dataset.bulkIdField = "true"
      form.appendChild(input)
    })
  }

  confirmDelete(event) {
    const count = this.selectedIds().length
    if (count === 0) return

    const message = count === 1
      ? "Delete 1 selected lead? This cannot be undone."
      : `Delete ${count} selected leads? This cannot be undone.`

    if (!window.confirm(message)) {
      event.preventDefault()
    }
  }
}

import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["input", "row", "empty", "filterInput"]

  filter() {
    const query = this.hasInputTarget ? this.inputTarget.value.trim().toLowerCase() : ""
    const columnFilters = this.filterInputTargets.reduce((accumulator, input) => {
      const value = input.value.trim().toLowerCase()
      if (value) accumulator[input.dataset.column] = value
      return accumulator
    }, {})

    let visibleCount = 0

    this.rowTargets.forEach((row) => {
      const searchText = (row.dataset.searchText || row.textContent).toLowerCase()
      const generalMatch = !query || searchText.includes(query)
      const columnMatch = Object.entries(columnFilters).every(([column, value]) => {
        const cell = row.querySelector(`[data-filter-column="${column}"]`)
        const cellValue = (cell?.dataset.filterValue || cell?.textContent || "").toLowerCase()
        return cellValue.includes(value)
      })
      const isVisible = generalMatch && columnMatch

      row.classList.toggle("hidden", !isVisible)
      if (isVisible) visibleCount += 1
    })

    if (this.hasEmptyTarget) {
      this.emptyTarget.classList.toggle("hidden", visibleCount !== 0)
    }
  }

  async copyValue(event) {
    const button = event.currentTarget
    const value = button.dataset.copyValue || ""

    if (!value) return

    const showCopiedState = () => {
      const icon = button.querySelector("i")
      if (icon) {
        icon.classList.remove("fa-copy")
        icon.classList.add("fa-check")
      }
      button.classList.remove("text-slate-500")
      button.classList.add("text-emerald-600")
      window.setTimeout(() => {
        if (icon) {
          icon.classList.remove("fa-check")
          icon.classList.add("fa-copy")
        }
        button.classList.remove("text-emerald-600")
        button.classList.add("text-slate-500")
      }, 1200)
    }

    const fallbackCopy = () => {
      const textarea = document.createElement("textarea")
      textarea.value = value
      textarea.setAttribute("readonly", "")
      textarea.style.position = "fixed"
      textarea.style.left = "-9999px"
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value)
      } else {
        fallbackCopy()
      }
      showCopiedState()
    } catch (error) {
      try {
        fallbackCopy()
        showCopiedState()
      } catch (fallbackError) {
        console.error("Copy failed", fallbackError)
      }
    }
  }
}

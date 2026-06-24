import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["container", "template"]
  static values = { index: Number, paramPrefix: String }

  connect() {
    this.indexValue = this.containerTarget.querySelectorAll("[data-dynamic-fields-row]").length
  }

  add(event) {
    event.preventDefault()

    const content = this.templateTarget.content.cloneNode(true)
    const row = content.querySelector("[data-dynamic-fields-row]")

    row.querySelectorAll("[data-field-name]").forEach((input) => {
      input.name = this.fieldName(input.dataset.fieldName)
    })

    this.containerTarget.appendChild(row)
    this.indexValue++
    row.querySelector("input, textarea, select")?.focus()
  }

  remove(event) {
    event.preventDefault()
    event.currentTarget.closest("[data-dynamic-fields-row]")?.remove()
  }

  fieldName(attribute) {
    return `${this.paramPrefixValue}[${this.indexValue}][${attribute}]`
  }
}

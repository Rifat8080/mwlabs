import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [ "input", "requested", "error", "preview", "previewImage", "previewName", "previewSize" ]
  static values = { maxSize: Number }

  select() {
    const file = this.inputTarget.files[0]
    this.clearError()

    if (!file) {
      this.requestedTarget.value = "0"
      this.hidePreview()
      return
    }

    this.requestedTarget.value = "1"

    if (!file.type.startsWith("image/")) {
      this.rejectFile("Please choose a PNG, JPG, GIF, or WebP image.")
      return
    }

    if (file.size > this.maxSizeValue) {
      this.rejectFile(
        `This image is too large (${this.formatSize(file.size)}). Maximum size is ${this.formatSize(this.maxSizeValue)}.`
      )
      return
    }

    this.showPreview(file)
  }

  rejectFile(message) {
    this.showError(message)
    this.inputTarget.value = ""
    this.requestedTarget.value = "0"
    this.hidePreview()
  }

  showError(message) {
    this.errorTarget.textContent = message
    this.errorTarget.classList.remove("hidden")
  }

  clearError() {
    this.errorTarget.textContent = ""
    this.errorTarget.classList.add("hidden")
  }

  showPreview(file) {
    this.previewNameTarget.textContent = file.name
    this.previewSizeTarget.textContent = this.formatSize(file.size)
    this.previewImageTarget.src = URL.createObjectURL(file)
    this.previewTarget.classList.remove("hidden")
  }

  hidePreview() {
    if (this.hasPreviewImageTarget && this.previewImageTarget.src) {
      URL.revokeObjectURL(this.previewImageTarget.src)
      this.previewImageTarget.removeAttribute("src")
    }

    if (this.hasPreviewTarget) {
      this.previewTarget.classList.add("hidden")
    }
  }

  formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  disconnect() {
    this.hidePreview()
  }
}

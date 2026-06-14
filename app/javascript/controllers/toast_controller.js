import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  connect() {
    // Auto-dismiss after 4 seconds
    setTimeout(() => this.dismiss(), 4000)
  }

  dismiss() {
    this.element.animate([
      { opacity: 1, transform: 'translateY(0)' },
      { opacity: 0, transform: 'translateY(-10px)' }
    ], { duration: 300 })
    
    setTimeout(() => {
      this.element.remove()
    }, 300)
  }

  close(event) {
    event.preventDefault()
    this.dismiss()
  }
}

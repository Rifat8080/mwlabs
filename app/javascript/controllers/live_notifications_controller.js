import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  connect() {
    this.boundHandleNotification = this.handleNotification.bind(this)
    document.addEventListener("notification:received", this.boundHandleNotification)
  }

  disconnect() {
    document.removeEventListener("notification:received", this.boundHandleNotification)
  }

  handleNotification(event) {
    const { title, message } = event.detail

    this.showNotificationToast(title, message)

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body: message, icon: "/icon-192.png" })
    }
  }

  showNotificationToast(title, message) {
    const toast = document.createElement("div")
    toast.className = "fixed bottom-4 right-4 z-50 max-w-md animate-in slide-in-from-right"

    const panel = document.createElement("div")
    panel.className = "rounded-lg shadow-lg border bg-blue-50 border-blue-200 p-4 flex items-start gap-3"

    const iconWrapper = document.createElement("div")
    iconWrapper.className = "flex-shrink-0 pt-0.5"
    const icon = document.createElement("i")
    icon.className = "fa-solid fa-bell text-blue-500"
    iconWrapper.appendChild(icon)

    const body = document.createElement("div")
    body.className = "flex-1"

    const titleElement = document.createElement("p")
    titleElement.className = "font-semibold text-blue-900"
    titleElement.textContent = title
    body.appendChild(titleElement)

    if (message) {
      const messageElement = document.createElement("p")
      messageElement.className = "text-sm text-blue-700 mt-1"
      messageElement.textContent = message
      body.appendChild(messageElement)
    }

    panel.appendChild(iconWrapper)
    panel.appendChild(body)
    toast.appendChild(panel)
    document.body.appendChild(toast)

    setTimeout(() => {
      toast.style.opacity = "0"
      toast.style.transition = "opacity 0.3s"
      setTimeout(() => toast.remove(), 300)
    }, 4000)
  }
}

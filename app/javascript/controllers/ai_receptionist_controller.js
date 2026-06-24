import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["panel", "messages", "input", "launcher", "status"]
  static values = { endpoint: String }

  connect() {
    this.loading = false
    this.boundCloseOnEscape = this.closeOnEscape.bind(this)
    document.addEventListener("keydown", this.boundCloseOnEscape)
  }

  disconnect() {
    document.removeEventListener("keydown", this.boundCloseOnEscape)
  }

  toggle() {
    if (this.panelTarget.classList.contains("hidden")) {
      this.open()
    } else {
      this.close()
    }
  }

  open() {
    this.panelTarget.classList.remove("hidden")
    this.launcherTarget.setAttribute("aria-expanded", "true")
    this.inputTarget.focus()
    this.scrollToBottom()
  }

  close() {
    this.panelTarget.classList.add("hidden")
    this.launcherTarget.setAttribute("aria-expanded", "false")
  }

  closeOnEscape(event) {
    if (event.key === "Escape") this.close()
  }

  async submit(event) {
    event.preventDefault()
    if (this.loading) return

    const content = this.inputTarget.value.trim()
    if (!content) return

    this.appendMessage("visitor", content)
    this.inputTarget.value = ""
    this.setLoading(true)

    try {
      const response = await fetch(this.endpointValue, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "X-CSRF-Token": this.csrfToken()
        },
        body: JSON.stringify({
          message: content,
          visitor_token: this.visitorToken()
        })
      })

      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Request failed")

      if (payload.visitor_token) {
        window.localStorage.setItem("ai_receptionist_visitor_token", payload.visitor_token)
      }

      if (payload.started_new) {
        this.messagesTarget.innerHTML = ""
      }

      this.appendMessage("assistant", payload.reply)
    } catch (_error) {
      this.appendMessage("assistant", "I could not reach the receptionist endpoint just now. Please try again or message us on WhatsApp.")
    } finally {
      this.setLoading(false)
    }
  }

  appendMessage(role, content) {
    const row = document.createElement("div")
    row.className = role === "visitor" ? "flex justify-end" : "flex justify-start"

    const bubble = document.createElement("div")
    bubble.className = role === "visitor"
      ? "max-w-xs rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold leading-6 text-white"
      : "max-w-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold leading-6 text-slate-700"
    bubble.textContent = content

    row.appendChild(bubble)
    this.messagesTarget.appendChild(row)
    this.scrollToBottom()
  }

  setLoading(loading) {
    this.loading = loading
    this.inputTarget.disabled = loading
    this.statusTarget.textContent = loading ? "Thinking..." : "Local AI ready"
  }

  scrollToBottom() {
    this.messagesTarget.scrollTop = this.messagesTarget.scrollHeight
  }

  csrfToken() {
    return document.querySelector("meta[name='csrf-token']")?.content || ""
  }

  visitorToken() {
    return window.localStorage.getItem("ai_receptionist_visitor_token")
  }
}

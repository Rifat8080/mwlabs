import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["messages", "input", "status"]
  static values = { messagesUrl: String, quickActionUrl: String }

  connect() {
    this.loading = false
    this.lastUserMessage = null
  }

  async submit(event) {
    event.preventDefault()
    if (this.loading) return

    const content = this.inputTarget.value.trim()
    if (!content) return

    this.appendMessage("user", content)
    this.lastUserMessage = content
    this.inputTarget.value = ""
    this.setLoading(true)

    await this.send(this.messagesUrlValue, { message: content })
  }

  async quickAction(event) {
    if (this.loading) return

    const actionName = event.currentTarget.dataset.actionName
    const label = event.currentTarget.textContent.trim()

    this.appendMessage("user", label)
    this.setLoading(true)

    await this.send(this.quickActionUrlValue, { action_name: actionName })
  }

  regenerate(_event) {
    if (!this.lastUserMessage || this.loading) return

    this.setLoading(true)
    this.send(this.messagesUrlValue, { message: this.lastUserMessage })
  }

  async copy(event) {
    const group = event.currentTarget.closest("[data-message-group]")
    const text = group?.querySelector("[data-message-content]")?.dataset.messageContent || ""
    if (!text) return

    try {
      await navigator.clipboard.writeText(text)
      const icon = event.currentTarget.querySelector("i")
      if (icon) {
        icon.classList.remove("fa-copy")
        icon.classList.add("fa-check")
        window.setTimeout(() => {
          icon.classList.remove("fa-check")
          icon.classList.add("fa-copy")
        }, 1200)
      }
    } catch (_error) {
      // Clipboard unavailable — silently ignore.
    }
  }

  async send(url, body) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "X-CSRF-Token": this.csrfToken()
        },
        body: JSON.stringify(body)
      })

      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Request failed")

      this.appendMessage("assistant", payload.reply)
    } catch (error) {
      this.appendMessage("assistant", error.message || "The AI assistant could not respond just now. Please try again shortly.")
    } finally {
      this.setLoading(false)
    }
  }

  appendMessage(role, content) {
    const group = document.createElement("div")
    group.dataset.messageGroup = "true"
    group.className = "space-y-1"

    const row = document.createElement("div")
    row.className = role === "user" ? "flex justify-end" : "flex justify-start"

    const bubble = document.createElement("div")
    bubble.className = role === "user"
      ? "max-w-lg whitespace-pre-line rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold leading-6 text-white"
      : "max-w-lg whitespace-pre-line rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium leading-6 text-slate-700 shadow-sm"
    bubble.textContent = content
    bubble.dataset.messageContent = content
    row.appendChild(bubble)
    group.appendChild(row)

    if (role === "assistant") {
      const actions = document.createElement("div")
      actions.className = "flex justify-start gap-3 pl-1"

      const copyButton = document.createElement("button")
      copyButton.type = "button"
      copyButton.className = "text-xs font-bold text-slate-400 transition hover:text-slate-600"
      copyButton.innerHTML = "<i class=\"fa-regular fa-copy\"></i> Copy"
      copyButton.dataset.action = "click->ai-assistant#copy"
      actions.appendChild(copyButton)

      const regenerateButton = document.createElement("button")
      regenerateButton.type = "button"
      regenerateButton.className = "text-xs font-bold text-slate-400 transition hover:text-slate-600"
      regenerateButton.innerHTML = "<i class=\"fa-solid fa-rotate-right\"></i> Regenerate"
      regenerateButton.dataset.action = "click->ai-assistant#regenerate"
      actions.appendChild(regenerateButton)

      group.appendChild(actions)
    }

    this.messagesTarget.appendChild(group)
    this.scrollToBottom()
  }

  setLoading(loading) {
    this.loading = loading
    this.inputTarget.disabled = loading
    if (this.hasStatusTarget) this.statusTarget.textContent = loading ? "Thinking..." : ""
  }

  scrollToBottom() {
    this.messagesTarget.scrollTop = this.messagesTarget.scrollHeight
  }

  csrfToken() {
    return document.querySelector("meta[name='csrf-token']")?.content || ""
  }
}

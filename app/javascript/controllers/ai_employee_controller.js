import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["form", "output", "status", "history"]
  static values = { runUrl: String, applyUrl: String, applyLabel: String }

  connect() {
    this.loading = false
  }

  async run(event) {
    if (event) event.preventDefault()
    if (this.loading) return

    this.setLoading(true)

    try {
      const body = Object.fromEntries(new FormData(this.formTarget).entries())

      const response = await fetch(this.runUrlValue, {
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

      this.showOutput(payload.content)
      this.prependHistory(payload)
    } catch (error) {
      this.showOutput(error.message || "The agent could not run just now. Please try again shortly.")
    } finally {
      this.setLoading(false)
    }
  }

  showOutput(content) {
    this.outputTarget.textContent = content
    this.outputTarget.dataset.content = content
  }

  async copy() {
    const text = this.outputTarget.dataset.content || ""
    if (!text) return

    try {
      await navigator.clipboard.writeText(text)
    } catch (_error) {
      // Clipboard unavailable — silently ignore.
    }
  }

  prependHistory(payload) {
    if (!this.hasHistoryTarget) return

    const entry = document.createElement("div")
    entry.className = "rounded-xl border border-slate-100 bg-slate-50 p-3"
    entry.innerHTML = `
      <div class="flex items-center justify-between gap-2">
        <span class="text-xs font-black text-emerald-600">success</span>
        <span class="text-[0.65rem] font-bold text-slate-400">just now</span>
      </div>
      <p class="mt-1 truncate text-xs font-semibold text-slate-600"></p>
    `
    entry.querySelector("p").textContent = (payload.content || "").slice(0, 80)

    if (this.hasApplyUrlValue && this.applyUrlValue) {
      const form = document.createElement("form")
      form.method = "post"
      form.action = this.applyUrlValue
      form.className = "mt-2"

      const csrf = document.createElement("input")
      csrf.type = "hidden"
      csrf.name = "authenticity_token"
      csrf.value = this.csrfToken()
      form.appendChild(csrf)

      const runId = document.createElement("input")
      runId.type = "hidden"
      runId.name = "run_id"
      runId.value = payload.run_id
      form.appendChild(runId)

      const button = document.createElement("button")
      button.type = "submit"
      button.className = "inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[0.65rem] font-black text-emerald-700 hover:bg-emerald-100"
      button.textContent = this.applyLabelValue || "Apply"
      form.appendChild(button)

      entry.appendChild(form)
    }

    this.historyTarget.prepend(entry)
  }

  setLoading(loading) {
    this.loading = loading
    if (this.hasStatusTarget) this.statusTarget.textContent = loading ? "Running..." : ""
  }

  csrfToken() {
    return document.querySelector("meta[name='csrf-token']")?.content || ""
  }
}

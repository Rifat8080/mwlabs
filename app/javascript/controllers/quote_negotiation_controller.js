import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["count", "hint", "internal", "message", "prompt", "requestType", "responseType"]

  connect() {
    this.count()
  }

  changeRequestType() {
    const prompts = {
      scope: "List the deliverables to add, remove, or move into a later phase.",
      pricing: "Share the budget range and what scope trade-offs you can accept.",
      timeline: "Explain the deadline, launch dependency, or milestone that needs to change.",
      payment_terms: "Describe the payment schedule or billing terms that would work better.",
      general: "Ask the question clearly so the team can reply without another back-and-forth."
    }

    this.promptTarget.textContent = prompts[this.requestTypeTarget.value] || prompts.general
    this.hintTarget.textContent = "Your request will be saved in the negotiation history and notify the team to respond."
  }

  changeResponseType() {
    const prompts = {
      reply: "Reply with the decision, rationale, and what happens next.",
      revised_terms: "Summarize the revision, then update the quote fields and send the quote again.",
      clarification: "Ask only for the missing information needed to revise or approve the quote.",
      internal_note: "Internal notes are hidden from clients and help the team coordinate next steps."
    }

    const responseType = this.responseTypeTarget.value
    this.promptTarget.textContent = prompts[responseType] || prompts.reply
    this.hintTarget.textContent = responseType === "internal_note" ? "This note is for M&W Labs only." : "This reply will be visible to the client."

    if (this.hasInternalTarget) {
      this.internalTarget.checked = responseType === "internal_note"
    }
  }

  count() {
    if (!this.hasMessageTarget || !this.hasCountTarget) return

    this.countTarget.textContent = this.messageTarget.value.length
  }
}

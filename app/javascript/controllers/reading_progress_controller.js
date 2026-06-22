import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [ "bar", "article" ]

  connect() {
    this.onScroll = this.update.bind(this)
    window.addEventListener("scroll", this.onScroll, { passive: true })
    this.update()
  }

  disconnect() {
    window.removeEventListener("scroll", this.onScroll)
  }

  update() {
    const article = this.articleTarget
    const rect = article.getBoundingClientRect()
    const articleTop = window.scrollY + rect.top
    const articleHeight = article.offsetHeight
    const viewportMiddle = window.scrollY + window.innerHeight * 0.35
    const progress = ((viewportMiddle - articleTop) / articleHeight) * 100

    this.barTarget.style.width = `${Math.min(100, Math.max(0, progress))}%`
  }
}

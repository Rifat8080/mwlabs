const CARD_CYCLE_INTERVAL_MS = 2600
const SHOWCASE_AUTOPLAY_INTERVAL_MS = 4200

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches

const initGalleryCard = (card) => {
  if (card.dataset.initialized === "true") return

  card.dataset.initialized = "true"

  const slides = card.querySelectorAll("[data-gallery-slide]")

  if (slides.length < 2 || prefersReducedMotion()) return

  let index = 0
  let timer = null

  const showSlide = (nextIndex) => {
    slides.forEach((slide, i) => {
      slide.classList.toggle("opacity-100", i === nextIndex)
      slide.classList.toggle("opacity-0", i !== nextIndex)
    })
    index = nextIndex
  }

  const start = () => {
    if (timer) return
    timer = window.setInterval(() => showSlide((index + 1) % slides.length), CARD_CYCLE_INTERVAL_MS)
  }

  const stop = () => {
    window.clearInterval(timer)
    timer = null
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => (entry.isIntersecting ? start() : stop()))
  }, { threshold: 0.2 })

  observer.observe(card)
}

const initShowcase = (showcase) => {
  if (showcase.dataset.initialized === "true") return

  showcase.dataset.initialized = "true"

  const slides = showcase.querySelectorAll("[data-showcase-slide]")
  const thumbs = showcase.querySelectorAll("[data-showcase-thumb]")
  const prevButton = showcase.querySelector("[data-showcase-prev]")
  const nextButton = showcase.querySelector("[data-showcase-next]")
  const liveDot = showcase.querySelector("[data-showcase-live-dot]")

  if (slides.length < 1) return

  let index = 0
  let timer = null

  const render = (nextIndex) => {
    index = (nextIndex + slides.length) % slides.length

    slides.forEach((slide, i) => {
      slide.classList.toggle("opacity-100", i === index)
      slide.classList.toggle("opacity-0", i !== index)
    })

    thumbs.forEach((thumb, i) => {
      thumb.classList.toggle("ring-2", i === index)
      thumb.classList.toggle("ring-blue-600", i === index)
      thumb.classList.toggle("opacity-100", i === index)
      thumb.classList.toggle("opacity-60", i !== index)
    })
  }

  const stop = () => {
    window.clearInterval(timer)
    timer = null
    liveDot?.classList.add("hidden")
  }

  const start = () => {
    if (timer || slides.length < 2 || prefersReducedMotion()) return

    liveDot?.classList.remove("hidden")
    timer = window.setInterval(() => render(index + 1), SHOWCASE_AUTOPLAY_INTERVAL_MS)
  }

  prevButton?.addEventListener("click", () => {
    stop()
    render(index - 1)
  })

  nextButton?.addEventListener("click", () => {
    stop()
    render(index + 1)
  })

  thumbs.forEach((thumb, i) => {
    thumb.addEventListener("click", () => {
      stop()
      render(i)
    })
  })

  showcase.addEventListener("pointerenter", stop)
  showcase.addEventListener("pointerleave", start)

  render(0)
  start()
}

export const initProjectGalleries = () => {
  document.querySelectorAll("[data-gallery-card]").forEach(initGalleryCard)
}

export const initProjectShowcases = () => {
  document.querySelectorAll("[data-showcase]").forEach(initShowcase)
}

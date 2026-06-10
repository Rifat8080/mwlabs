const ACTIVE_DOT_CLASSES = ["bg-blue-600"]
const INACTIVE_DOT_CLASSES = ["bg-blue-100"]

const scrollToCard = (track, index) => {
  const card = track.children[index]

  if (!card) return

  track.scrollTo({ left: card.offsetLeft, behavior: "smooth" })
}

const updateDots = (dots, activeIndex) => {
  dots.forEach((dot, index) => {
    const isActive = index === activeIndex

    dot.setAttribute("aria-pressed", isActive.toString())
    ACTIVE_DOT_CLASSES.forEach((className) => dot.classList.toggle(className, isActive))
    INACTIVE_DOT_CLASSES.forEach((className) => dot.classList.toggle(className, !isActive))
  })
}

const currentCardIndex = (track) => {
  const cards = Array.from(track.children)

  return cards.reduce((closestIndex, card, index) => {
    const currentDistance = Math.abs(card.offsetLeft - track.scrollLeft)
    const closestDistance = Math.abs(cards[closestIndex].offsetLeft - track.scrollLeft)

    return currentDistance < closestDistance ? index : closestIndex
  }, 0)
}

const initTestimonialsSection = (section) => {
  if (section.dataset.initialized === "true") return

  section.dataset.initialized = "true"
  const track = section.querySelector("[data-testimonials-track]")
  const previousButton = section.querySelector("[data-testimonials-prev]")
  const nextButton = section.querySelector("[data-testimonials-next]")
  const dots = section.querySelectorAll("[data-testimonials-dot]")

  if (!track) return

  previousButton?.addEventListener("click", () => {
    const index = Math.max(currentCardIndex(track) - 1, 0)

    scrollToCard(track, index)
    updateDots(dots, index)
  })

  nextButton?.addEventListener("click", () => {
    const index = Math.min(currentCardIndex(track) + 1, track.children.length - 1)

    scrollToCard(track, index)
    updateDots(dots, index)
  })

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const index = Number(dot.dataset.testimonialsDot)

      scrollToCard(track, index)
      updateDots(dots, index)
    })
  })

  track.addEventListener("scroll", () => {
    window.requestAnimationFrame(() => updateDots(dots, currentCardIndex(track)))
  }, { passive: true })
}

export const initTestimonials = () => {
  document.querySelectorAll("[data-testimonials-section]").forEach(initTestimonialsSection)
}

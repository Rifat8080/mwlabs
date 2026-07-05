const REVEAL_VIEWPORT_RATIO = 0.88
const MAX_TILT_DEGREES = 7
const COUNTER_DURATION_MS = 1400

const initializedElements = new WeakSet()

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches
const hasFinePointer = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches

const initScrollReveal = () => {
  const elements = document.querySelectorAll("[data-reveal]")

  if (!elements.length) return

  if (prefersReducedMotion()) {
    elements.forEach((element) => element.classList.add("reveal-in"))
    return
  }

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return

      entry.target.classList.add("reveal-in")
      entry.target.classList.remove("reveal-pending")
      currentObserver.unobserve(entry.target)
    })
  }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" })

  elements.forEach((element) => {
    if (initializedElements.has(element)) return

    initializedElements.add(element)

    const delay = element.dataset.revealDelay

    if (delay) element.style.setProperty("--reveal-delay", `${delay}ms`)

    // Elements already in view (hero, above the fold) are never hidden,
    // so the LCP element paints immediately.
    if (element.getBoundingClientRect().top < window.innerHeight * REVEAL_VIEWPORT_RATIO) {
      element.classList.add("reveal-in")
    } else {
      element.classList.add("reveal-pending")
      observer.observe(element)
    }
  })
}

const initTiltCards = () => {
  if (!hasFinePointer() || prefersReducedMotion()) return

  document.querySelectorAll("[data-tilt]").forEach((card) => {
    if (initializedElements.has(card)) return

    initializedElements.add(card)

    let frame = null

    const applyTilt = (event) => {
      const rect = card.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width
      const y = (event.clientY - rect.top) / rect.height

      card.style.setProperty("--tilt-x", `${((0.5 - y) * MAX_TILT_DEGREES * 2).toFixed(2)}deg`)
      card.style.setProperty("--tilt-y", `${((x - 0.5) * MAX_TILT_DEGREES * 2).toFixed(2)}deg`)
      card.style.setProperty("--glare-x", `${(x * 100).toFixed(1)}%`)
      card.style.setProperty("--glare-y", `${(y * 100).toFixed(1)}%`)
    }

    card.addEventListener("pointerenter", () => card.classList.add("tilt-active"))

    card.addEventListener("pointermove", (event) => {
      if (frame) return

      frame = window.requestAnimationFrame(() => {
        frame = null
        applyTilt(event)
      })
    })

    card.addEventListener("pointerleave", () => {
      if (frame) {
        window.cancelAnimationFrame(frame)
        frame = null
      }

      card.classList.remove("tilt-active")
      card.style.setProperty("--tilt-x", "0deg")
      card.style.setProperty("--tilt-y", "0deg")
    })
  })
}

const initParallaxScenes = () => {
  if (!hasFinePointer() || prefersReducedMotion()) return

  document.querySelectorAll("[data-parallax-scene]").forEach((scene) => {
    if (initializedElements.has(scene)) return

    initializedElements.add(scene)

    const host = scene.closest("[data-parallax-host]") || scene
    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0
    let frame = null

    const animate = () => {
      currentX += (targetX - currentX) * 0.08
      currentY += (targetY - currentY) * 0.08

      scene.style.setProperty("--scene-ry", `${(currentX * 8).toFixed(2)}deg`)
      scene.style.setProperty("--scene-rx", `${(currentY * -6).toFixed(2)}deg`)
      scene.style.setProperty("--par-x", `${(currentX * 20).toFixed(1)}px`)
      scene.style.setProperty("--par-y", `${(currentY * 14).toFixed(1)}px`)

      const settled = Math.abs(targetX - currentX) < 0.001 && Math.abs(targetY - currentY) < 0.001

      frame = settled ? null : window.requestAnimationFrame(animate)
    }

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(animate)
    }

    host.addEventListener("pointermove", (event) => {
      const rect = host.getBoundingClientRect()

      targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 2
      targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 2
      schedule()
    })

    host.addEventListener("pointerleave", () => {
      targetX = 0
      targetY = 0
      schedule()
    })
  })
}

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)

const animateCounter = (element) => {
  const target = parseInt(element.dataset.counter, 10) || 0
  const suffix = element.dataset.counterSuffix || ""
  let start = null

  const step = (timestamp) => {
    if (!start) start = timestamp

    const progress = Math.min((timestamp - start) / COUNTER_DURATION_MS, 1)

    element.textContent = `${Math.round(easeOutCubic(progress) * target)}${suffix}`

    if (progress < 1) {
      window.requestAnimationFrame(step)
    } else {
      element.dataset.counterDone = "true"
    }
  }

  window.requestAnimationFrame(step)
}

const initCounters = () => {
  const counters = document.querySelectorAll("[data-counter]")

  if (!counters.length || prefersReducedMotion()) return

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return

      currentObserver.unobserve(entry.target)
      animateCounter(entry.target)
    })
  }, { threshold: 0.4 })

  counters.forEach((element) => {
    if (element.dataset.counterDone === "true" || initializedElements.has(element)) return

    initializedElements.add(element)
    observer.observe(element)
  })
}

// Turbo snapshots must never cache the hidden reveal state, otherwise
// restored pages would show invisible sections.
document.addEventListener("turbo:before-cache", () => {
  document.querySelectorAll(".reveal-pending").forEach((element) => {
    element.classList.remove("reveal-pending")
    element.classList.add("reveal-in")
  })
})

export const initLandingEffects = () => {
  initScrollReveal()
  initTiltCards()
  initParallaxScenes()
  initCounters()
}

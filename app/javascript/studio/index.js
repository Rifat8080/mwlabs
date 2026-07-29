import Lenis from "lenis"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export const scrollState = {
  target: 0,
  current: 0,
  materialTarget: 0,
}

const DHAKA_TIME_ZONE = "Asia/Dhaka"
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)"

const updateDhakaTime = (root) => {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: DHAKA_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })

  const render = () => {
    const now = new Date()
    root.querySelectorAll("[data-dhaka-time]").forEach((element) => {
      element.textContent = formatter.format(now)
      if (element.tagName === "TIME") element.dateTime = now.toISOString()
    })
  }

  render()
  const timer = window.setInterval(render, 1000)
  return () => window.clearInterval(timer)
}

const createPreloader = (root) => {
  const element = root.querySelector("[data-studio-preloader]")
  if (!element) return { ready: Promise.resolve(), destroy: () => {} }

  const value = element.querySelector("[data-studio-progress]")
  const fill = element.querySelector("[data-studio-progress-fill]")
  const fonts = [
    ['700 1em "Archivo Expanded"', "Build"],
    ['400 1em "Inter Tight"', "Systems"],
    ['500 1em "Martian Mono"', "01 / Ready"],
  ]

  let complete = 0
  const total = fonts.length
  const setProgress = () => {
    const progress = Math.round((complete / total) * 100)
    value.textContent = String(progress)
    fill.style.transform = `scaleX(${progress / 100})`
  }

  setProgress()
  const ready = Promise.all(
    fonts.map(([font, sample]) =>
      document.fonts.load(font, sample).finally(() => {
        complete += 1
        setProgress()
      }),
    ),
  ).then(async () => {
    await document.fonts.ready
    value.textContent = "100"
    fill.style.transform = "scaleX(1)"
    element.classList.add("is-complete")
    await gsap.to(element, {
      yPercent: -100,
      duration: 0.72,
      ease: "power4.inOut",
    })
    document.documentElement.classList.remove("studio-loading")
  })

  return {
    ready,
    destroy: () => gsap.killTweensOf(element),
  }
}

const setupStaticInteractions = (root, motionAllowed) => {
  const cleanups = []

  cleanups.push(updateDhakaTime(root))

  root.querySelectorAll("[data-studio-material]").forEach((row) => {
    const retarget = () => {
      scrollState.materialTarget = Number(row.dataset.studioMaterial || 0)
    }
    row.addEventListener("pointerenter", retarget)
    row.addEventListener("focus", retarget)
    cleanups.push(() => {
      row.removeEventListener("pointerenter", retarget)
      row.removeEventListener("focus", retarget)
    })
  })

  root.querySelectorAll("[data-back-to-top]").forEach((link) => {
    const handleClick = (event) => {
      event.preventDefault()
      if (motionAllowed && root.__studioLenis) {
        root.__studioLenis.scrollTo(0, { duration: 1.1 })
      } else {
        window.scrollTo({ top: 0, behavior: "auto" })
      }
    }
    link.addEventListener("click", handleClick)
    cleanups.push(() => link.removeEventListener("click", handleClick))
  })

  return () => cleanups.forEach((cleanup) => cleanup())
}

const setupMotion = (root) => {
  const lenis = new Lenis({
    duration: 1.05,
    smoothWheel: true,
    syncTouch: false,
    wheelMultiplier: 0.9,
  })
  root.__studioLenis = lenis

  const updateScrollTrigger = () => ScrollTrigger.update()
  lenis.on("scroll", updateScrollTrigger)

  const tick = (time) => {
    lenis.raf(time * 1000)
  }
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)

  const masterTrigger = ScrollTrigger.create({
    start: 0,
    end: () => ScrollTrigger.maxScroll(window),
    invalidateOnRefresh: true,
    onUpdate: ({ progress }) => {
      scrollState.target = progress
    },
  })

  const positioningWords = root.querySelectorAll("[data-positioning-line] .studio-positioning-word")
  if (positioningWords.length) {
    gsap.from(positioningWords, {
      opacity: 0.12,
      yPercent: 45,
      stagger: 0.045,
      duration: 0.58,
      ease: "power3.out",
      scrollTrigger: {
        trigger: "[data-positioning-line]",
        start: "top 78%",
        once: true,
      },
    })
  }

  root.querySelectorAll("[data-work-chapter]").forEach((chapter) => {
    gsap.from(chapter, {
      opacity: 0,
      y: 72,
      duration: 0.82,
      ease: "power3.out",
      scrollTrigger: {
        trigger: chapter,
        start: "top 82%",
        once: true,
      },
    })
  })

  const processRule = root.querySelector("[data-process-rule]")
  if (processRule) {
    const mobile = window.matchMedia("(max-width: 900px)").matches
    gsap.from(processRule, {
      scaleX: mobile ? 1 : 0,
      scaleY: mobile ? 0 : 1,
      duration: 1.15,
      ease: "power2.inOut",
      scrollTrigger: {
        trigger: processRule.parentElement,
        start: "top 76%",
        once: true,
      },
    })
  }

  const marqueeTrack = root.querySelector("[data-studio-marquee-track]")
  const marquee = marqueeTrack
    ? gsap.to(marqueeTrack, {
        xPercent: -50,
        duration: 42,
        ease: "none",
        repeat: -1,
      })
    : null

  return () => {
    marquee?.kill()
    masterTrigger.kill()
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    gsap.ticker.remove(tick)
    lenis.off("scroll", updateScrollTrigger)
    lenis.destroy()
    delete root.__studioLenis
  }
}

export const mountStudio = async (root) => {
  if (window.__studioLoaderFallback) {
    window.clearTimeout(window.__studioLoaderFallback)
    delete window.__studioLoaderFallback
  }

  const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches
  const preloader = createPreloader(root)
  const destroyStaticInteractions = setupStaticInteractions(root, !reducedMotion)
  const destroyMotion = reducedMotion ? () => {} : setupMotion(root)

  await preloader.ready

  return () => {
    preloader.destroy()
    destroyMotion()
    destroyStaticInteractions()
  }
}

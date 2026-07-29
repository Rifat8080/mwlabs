import Lenis from "lenis"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export const scrollState = {
  target: 0,
  current: 0,
  materialTarget: 0,
  materialInfluence: 0,
}

const DHAKA_TIME_ZONE = "Asia/Dhaka"
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)"

const supportsWebGL2 = () => {
  const testCanvas = document.createElement("canvas")
  return Boolean(testCanvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true }))
}

const canRenderStudioScene = (root, reducedMotion = false) => {
  const hasScene = Boolean(root.querySelector("[data-studio-scene]"))
  const memory = navigator.deviceMemory
  const lowMemory = typeof memory === "number" && memory < 4
  const coarseSmall = window.matchMedia("(pointer: coarse) and (max-width: 720px)").matches

  return hasScene && !reducedMotion && !lowMemory && !coarseSmall && supportsWebGL2()
}

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

const createPreloader = (root, assetsEnabled = false) => {
  const element = root.querySelector("[data-studio-preloader]")
  if (!element) {
    return {
      fontsReady: Promise.resolve(),
      setAssetProgress: () => {},
      finish: () => Promise.resolve(),
      destroy: () => {},
    }
  }

  const value = element.querySelector("[data-studio-progress]")
  const fill = element.querySelector("[data-studio-progress-fill]")
  const fonts = [
    ['700 1em "Archivo Expanded"', "Build"],
    ['400 1em "Inter Tight"', "Systems"],
    ['500 1em "Martian Mono"', "01 / Ready"],
  ]

  let complete = 0
  const total = fonts.length
  let assetProgress = assetsEnabled ? 0 : 1
  const setProgress = () => {
    const fontProgress = complete / total
    const progress = Math.round(
      assetsEnabled ? fontProgress * 25 + assetProgress * 75 : fontProgress * 100,
    )
    value.textContent = String(progress)
    fill.style.transform = `scaleX(${progress / 100})`
  }

  setProgress()
  const fontsReady = Promise.all(
    fonts.map(([font, sample]) =>
      document.fonts.load(font, sample).finally(() => {
        complete += 1
        setProgress()
      }),
    ),
  ).then(() => document.fonts.ready)

  const finish = async () => {
    value.textContent = "100"
    fill.style.transform = "scaleX(1)"
    element.classList.add("is-complete")
    await gsap.to(element, {
      yPercent: -100,
      duration: 0.72,
      ease: "power4.inOut",
    })
    document.documentElement.classList.remove("studio-loading")
  }

  return {
    fontsReady,
    setAssetProgress: (progress) => {
      assetProgress = Math.max(assetProgress, Math.min(1, progress))
      setProgress()
    },
    finish,
    destroy: () => gsap.killTweensOf(element),
  }
}

const setupStaticInteractions = (root, motionAllowed) => {
  const cleanups = []

  cleanups.push(updateDhakaTime(root))

  root.querySelectorAll("[data-studio-material]").forEach((row) => {
    const retarget = () => {
      scrollState.materialTarget = Number(row.dataset.studioMaterial || 0)
      scrollState.materialInfluence = 1
    }
    const release = () => {
      scrollState.materialInfluence = 0
    }
    row.addEventListener("pointerenter", retarget)
    row.addEventListener("pointerleave", release)
    row.addEventListener("focus", retarget)
    row.addEventListener("blur", release)
    cleanups.push(() => {
      row.removeEventListener("pointerenter", retarget)
      row.removeEventListener("pointerleave", release)
      row.removeEventListener("focus", retarget)
      row.removeEventListener("blur", release)
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

  root.querySelectorAll("[data-studio-form]").forEach((form) => {
    const status = form.querySelector("[data-form-status]")
    const describeField = (field) => {
      const label = form.querySelector(`label[for="${field.id}"]`)
      return label?.textContent?.trim() || "This field"
    }
    const handleInvalid = (event) => {
      const field = event.target
      field.setAttribute("aria-invalid", "true")
      if (status) status.textContent = `${describeField(field)} needs a valid value before this enquiry can be sent.`
    }
    const handleInput = (event) => {
      const field = event.target
      if (field.checkValidity()) field.removeAttribute("aria-invalid")
      if (status && form.checkValidity()) status.textContent = ""
    }

    form.addEventListener("invalid", handleInvalid, true)
    form.addEventListener("input", handleInput)
    cleanups.push(() => {
      form.removeEventListener("invalid", handleInvalid, true)
      form.removeEventListener("input", handleInput)
    })
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
  const sceneEnabled = canRenderStudioScene(root, reducedMotion)
  const preloader = createPreloader(root, sceneEnabled)
  const destroyStaticInteractions = setupStaticInteractions(root, !reducedMotion)
  const destroyMotion = reducedMotion ? () => {} : setupMotion(root)
  let scene = null

  const sceneReady = sceneEnabled
    ? import(root.dataset.studioSceneBundleValue)
        .then(({ mountStudioScene }) =>
          mountStudioScene(root, scrollState, {
            onProgress: preloader.setAssetProgress,
          }),
        )
        .then((mountedScene) => {
          scene = mountedScene
        })
        .catch((error) => {
          preloader.setAssetProgress(1)
          console.warn("WebGL scene unavailable; using the static ampersand poster.", error)
        })
    : Promise.resolve()

  await Promise.all([preloader.fontsReady, sceneReady])
  await preloader.finish()

  return () => {
    scene?.destroy()
    preloader.destroy()
    destroyMotion()
    destroyStaticInteractions()
  }
}

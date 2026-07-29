import * as THREE from "three"
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js"
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js"
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js"
import gsap from "gsap"

const BRAND = new THREE.Color("#02D8FB")
const PAPER = new THREE.Color("#E8E9E4")
const SURFACE = new THREE.Color("#F5F6F2")
const STEEL = new THREE.Color("#8F969C")
const INK = new THREE.Color("#0D0F12")

const ACTS = [
  { color: STEEL, roughness: 0.56, metalness: 0.82, transmission: 0, thickness: 0.18, env: 1.2 },
  { color: new THREE.Color("#D9DCD9"), roughness: 0.075, metalness: 1, transmission: 0, thickness: 0.16, env: 2.3 },
  { color: SURFACE, roughness: 0.42, metalness: 0, transmission: 0.84, thickness: 1.6, env: 1.45 },
  { color: new THREE.Color("#AAA79F"), roughness: 0.29, metalness: 0.88, transmission: 0, thickness: 0.25, env: 1.7 },
]

const compactViewport = () => window.matchMedia("(max-width: 899px)").matches

const normalizeGeometry = (geometry) => {
  geometry.computeBoundingBox()
  const bounds = geometry.boundingBox
  const center = new THREE.Vector3()
  const size = new THREE.Vector3()
  bounds.getCenter(center)
  bounds.getSize(size)
  geometry.translate(-center.x, -center.y, -center.z)
  const scale = 3.15 / Math.max(size.x, size.y)
  geometry.scale(scale, -scale, scale)
  geometry.computeVertexNormals()
  geometry.computeBoundingSphere()
  return geometry
}

const geometryFromShapes = (shapes, compact, dense = false) => {
  const geometry = new THREE.ExtrudeGeometry(shapes, {
    depth: compact ? 8 : 12,
    curveSegments: compact ? 10 : dense ? 38 : 24,
    bevelEnabled: true,
    bevelSize: compact ? 0.42 : 0.6,
    bevelThickness: compact ? 0.42 : 0.62,
    bevelSegments: compact ? 2 : dense ? 6 : 4,
    steps: compact ? 1 : dense ? 3 : 2,
  })

  return normalizeGeometry(mergeVertices(geometry, 1e-4))
}

const createEnvironment = (renderer, compact) => {
  const target = new THREE.WebGLCubeRenderTarget(compact ? 128 : 256, {
    type: THREE.HalfFloatType,
    generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter,
  })
  const cubeCamera = new THREE.CubeCamera(0.1, 20, target)
  const environmentScene = new THREE.Scene()
  environmentScene.background = PAPER

  const panels = [
    { size: [6, 4], position: [-3.8, 4.2, 3.2], rotation: [0.2, -0.8, -0.2], color: "#FFFFFF", intensity: 3.2 },
    { size: [4, 3], position: [4.4, 0.8, 1.8], rotation: [0, 0.9, 0.1], color: "#DCE8F1", intensity: 1.55 },
    { size: [7, 0.28], position: [0, 2.3, -3.8], rotation: [0, 0, 0], color: "#FFFFFF", intensity: 4.4 },
    { size: [2.2, 2.2], position: [0, -3.8, 2], rotation: [-1.3, 0, 0], color: "#F1EEE5", intensity: 1.1 },
  ]

  panels.forEach((panel) => {
    const material = new THREE.MeshBasicMaterial({
      color: panel.color,
      side: THREE.DoubleSide,
      toneMapped: false,
    })
    material.color.multiplyScalar(panel.intensity)
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(...panel.size), material)
    mesh.position.set(...panel.position)
    mesh.rotation.set(...panel.rotation)
    environmentScene.add(mesh)
  })

  environmentScene.add(cubeCamera)
  cubeCamera.update(renderer, environmentScene)
  environmentScene.traverse((object) => {
    object.geometry?.dispose()
    object.material?.dispose()
  })

  return target
}

const createLightingRig = (scene, compact) => {
  RectAreaLightUniformsLib.init()

  const key = new THREE.RectAreaLight("#FFFFFF", compact ? 6 : 8, 5.5, 4)
  key.position.set(-3.8, 4.5, 5.5)
  key.lookAt(0, 0, 0)

  const fill = new THREE.RectAreaLight("#D8E5ED", 3.2, 4, 3)
  fill.position.set(4.5, 0.6, 3)
  fill.lookAt(0, 0, 0)

  const rim = new THREE.RectAreaLight("#FFFFFF", 7.5, 2.2, 0.35)
  rim.position.set(1, 3.8, -4)
  rim.lookAt(0, 0.2, 0)

  const strip = new THREE.RectAreaLight("#FFFFFF", 0, 7, 0.22)
  strip.position.set(-4.8, 1.6, 3.8)
  strip.lookAt(0, 0, 0)

  const shadowKey = new THREE.DirectionalLight("#FFFFFF", 2.4)
  shadowKey.position.set(-3.4, 6, 4.2)
  shadowKey.castShadow = true
  shadowKey.shadow.mapSize.set(compact ? 512 : 1024, compact ? 512 : 1024)
  shadowKey.shadow.camera.left = -5
  shadowKey.shadow.camera.right = 5
  shadowKey.shadow.camera.top = 5
  shadowKey.shadow.camera.bottom = -5
  shadowKey.shadow.bias = -0.0004
  shadowKey.shadow.radius = compact ? 3 : 6

  scene.add(new THREE.HemisphereLight("#F5F6F2", "#8F969C", 1.1), key, fill, rim, strip, shadowKey)
  return { key, fill, rim, strip, shadowKey }
}

const makeAmpersandMaterial = (environment) =>
  new THREE.MeshPhysicalMaterial({
    color: ACTS[0].color,
    roughness: ACTS[0].roughness,
    metalness: ACTS[0].metalness,
    transmission: ACTS[0].transmission,
    thickness: ACTS[0].thickness,
    ior: 1.46,
    clearcoat: 0.12,
    clearcoatRoughness: 0.28,
    envMap: environment.texture,
    envMapIntensity: ACTS[0].env,
    transparent: true,
    opacity: 1,
    side: THREE.DoubleSide,
  })

const createInternalStructure = (geometry) => {
  const structure = new THREE.Group()
  const edges = new THREE.EdgesGeometry(geometry, 18)

  for (let index = 0; index < 7; index += 1) {
    const line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({
        color: BRAND,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    )
    const scale = 0.62 + index * 0.045
    line.scale.setScalar(scale)
    line.position.z = -0.28 + index * 0.09
    structure.add(line)
  }

  return structure
}

const loadAmpersand = (manager, compact) =>
  new Promise((resolve, reject) => {
    new SVGLoader(manager).load(
      "/brand/ampersand.svg",
      (data) => {
        const shapes = data.paths.flatMap((path) => SVGLoader.createShapes(path))
        if (!shapes.length) {
          reject(new Error("The ampersand SVG did not contain a closed shape."))
          return
        }

        const standard = geometryFromShapes(shapes, compact, false)
        const dense = compact ? standard.clone() : geometryFromShapes(shapes, false, true)
        resolve({ standard, dense })
      },
      undefined,
      reject,
    )
  })

const interpolateAct = (material, progress) => {
  const scaled = THREE.MathUtils.clamp(progress, 0, 0.9999) * 3
  const index = Math.floor(scaled)
  const mix = THREE.MathUtils.smoothstep(scaled - index, 0, 1)
  const from = ACTS[index]
  const to = ACTS[Math.min(index + 1, ACTS.length - 1)]

  material.color.copy(from.color).lerp(to.color, mix)
  material.roughness = THREE.MathUtils.lerp(from.roughness, to.roughness, mix)
  material.metalness = THREE.MathUtils.lerp(from.metalness, to.metalness, mix)
  material.transmission = THREE.MathUtils.lerp(from.transmission, to.transmission, mix)
  material.thickness = THREE.MathUtils.lerp(from.thickness, to.thickness, mix)
  material.envMapIntensity = THREE.MathUtils.lerp(from.env, to.env, mix)
  material.opacity = 1 - material.transmission * 0.18

  return { act: scaled, index, mix }
}

const fitRenderer = (renderer, camera, container) => {
  const rect = container.getBoundingClientRect()
  const width = Math.max(1, rect.width)
  const height = Math.max(1, rect.height)
  renderer.setSize(width, height, false)
  camera.aspect = width / height
  camera.position.z = width < 640 ? 6.8 : 5.8
  camera.updateProjectionMatrix()
}

export const mountStudioScene = async (root, scrollState, { onProgress = () => {} } = {}) => {
  const container = root.querySelector("[data-studio-scene]")
  const poster = container.querySelector("[data-studio-poster]")
  const compact = compactViewport()
  const canvas = document.createElement("canvas")
  canvas.className = "studio-scene-canvas"
  canvas.setAttribute("aria-hidden", "true")
  container.appendChild(canvas)

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: !compact,
    powerPreference: "high-performance",
  })
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.08
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  let pixelRatio = THREE.MathUtils.clamp(window.devicePixelRatio || 1, 1, 1.75)
  renderer.setPixelRatio(pixelRatio)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 100)
  camera.position.set(0, 0.1, compact ? 6.8 : 5.8)

  const environment = createEnvironment(renderer, compact)
  scene.environment = environment.texture
  const lights = createLightingRig(scene, compact)

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 14),
    new THREE.ShadowMaterial({ color: INK, opacity: 0.16, transparent: true }),
  )
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -1.76
  ground.receiveShadow = true
  scene.add(ground)

  const manager = new THREE.LoadingManager()
  manager.onStart = () => onProgress(0)
  manager.onProgress = (_url, loaded, total) => onProgress(total ? loaded / total : 0)
  manager.onLoad = () => onProgress(1)
  manager.onError = () => onProgress(1)

  const { standard, dense } = await loadAmpersand(manager, compact)
  const material = makeAmpersandMaterial(environment)
  const standardMesh = new THREE.Mesh(standard, material)
  standardMesh.castShadow = true
  standardMesh.receiveShadow = true

  const denseMaterial = material.clone()
  const denseMesh = new THREE.Mesh(dense, denseMaterial)
  denseMesh.castShadow = true
  denseMesh.receiveShadow = true
  denseMesh.visible = false

  const lod = new THREE.LOD()
  lod.autoUpdate = false
  lod.addLevel(standardMesh, 0)
  lod.addLevel(denseMesh, 7)
  lod.rotation.set(-0.08, -0.28, -0.05)
  lod.position.y = 0.08
  scene.add(lod)

  const constructionEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(standard, 16),
    new THREE.LineBasicMaterial({
      color: BRAND,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    }),
  )
  constructionEdges.scale.setScalar(1.006)
  lod.add(constructionEdges)

  const internal = createInternalStructure(standard)
  lod.add(internal)

  fitRenderer(renderer, camera, container)

  let active = true
  let visible = true
  let lastTime = 0
  let frameCount = 0
  let frameWindowStart = performance.now()
  let lowQuality = false

  const handleVisibility = () => {
    active = !document.hidden
  }
  document.addEventListener("visibilitychange", handleVisibility)

  const intersectionObserver = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting
    },
    { threshold: 0.01 },
  )
  intersectionObserver.observe(canvas)

  const resizeObserver = new ResizeObserver(() => fitRenderer(renderer, camera, container))
  resizeObserver.observe(container)

  const render = (time) => {
    if (!active || !visible) return

    const delta = Math.min(0.05, lastTime ? time - lastTime : 1 / 60)
    lastTime = time
    scrollState.current = THREE.MathUtils.damp(scrollState.current, scrollState.target, 4.6, delta)
    const serviceProgress = (scrollState.materialTarget % 4) / 3
    const progress = THREE.MathUtils.lerp(
      scrollState.current,
      serviceProgress,
      scrollState.materialInfluence * 0.76,
    )
    const actState = interpolateAct(material, progress)
    denseMaterial.copy(material)

    const automateWeight = Math.max(0, 1 - Math.abs(actState.act - 2))
    internal.children.forEach((line, index) => {
      line.material.opacity = THREE.MathUtils.damp(
        line.material.opacity,
        automateWeight * (0.22 + index * 0.055),
        5,
        delta,
      )
      line.rotation.z += delta * (0.04 + index * 0.007) * automateWeight
    })

    constructionEdges.material.opacity = THREE.MathUtils.damp(
      constructionEdges.material.opacity,
      Math.max(0.06, 0.92 - actState.act * 0.52),
      5,
      delta,
    )

    const growthWeight = THREE.MathUtils.smoothstep(progress, 0.76, 0.94)
    standardMesh.visible = growthWeight < 0.52
    denseMesh.visible = growthWeight >= 0.52
    lod.scale.setScalar(1 + growthWeight * 0.2)
    lod.rotation.y += delta * (0.12 + progress * 0.08)
    lod.rotation.x = -0.08 + Math.sin(time * 0.22) * 0.035
    lod.rotation.z = -0.05 + Math.cos(time * 0.17) * 0.025

    const marketWeight = Math.max(0, 1 - Math.abs(actState.act - 1))
    lights.strip.intensity = THREE.MathUtils.damp(lights.strip.intensity, marketWeight * 18, 6, delta)
    lights.strip.position.x = THREE.MathUtils.lerp(-4.8, 4.8, (Math.sin(time * 1.35) + 1) / 2)
    lights.key.intensity = 8 + growthWeight * 3
    lights.key.color.copy(new THREE.Color("#FFFFFF")).lerp(new THREE.Color("#FFF0DA"), growthWeight)

    renderer.render(scene, camera)

    if (!container.classList.contains("has-webgl")) {
      container.classList.add("has-webgl")
      root.classList.add("studio-webgl")
      poster.hidden = true
    }

    frameCount += 1
    const now = performance.now()
    if (!lowQuality && now - frameWindowStart > 2400) {
      const fps = (frameCount * 1000) / (now - frameWindowStart)
      if (fps < 42) {
        lowQuality = true
        pixelRatio = 1
        renderer.setPixelRatio(pixelRatio)
        renderer.shadowMap.enabled = false
        fitRenderer(renderer, camera, container)
      }
      frameCount = 0
      frameWindowStart = now
    }
  }

  gsap.ticker.add(render)
  renderer.render(scene, camera)
  onProgress(1)

  return {
    destroy: () => {
      gsap.ticker.remove(render)
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      document.removeEventListener("visibilitychange", handleVisibility)
      scene.traverse((object) => {
        object.geometry?.dispose()
        if (Array.isArray(object.material)) {
          object.material.forEach((item) => item.dispose())
        } else {
          object.material?.dispose()
        }
      })
      environment.dispose()
      renderer.dispose()
      canvas.remove()
      poster.hidden = false
      container.classList.remove("has-webgl")
      root.classList.remove("studio-webgl")
    },
  }
}

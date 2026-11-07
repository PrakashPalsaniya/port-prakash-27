import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

export function createReactor(canvas) {
  const touchScreen = matchMedia('(pointer: coarse)').matches
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, touchScreen ? 1.5 : 2))
  renderer.setClearColor(0x000000, 0)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(32, 1, .1, 20)
  camera.position.set(0, 0, 4.9)
  const pmrem = new THREE.PMREMGenerator(renderer)
  const studioCanvas = document.createElement('canvas')
  studioCanvas.width = 1024
  studioCanvas.height = 512
  const studio = studioCanvas.getContext('2d')
  const studioBackground = studio.createLinearGradient(0, 0, 0, 512)
  studioBackground.addColorStop(0, '#2c4658')
  studioBackground.addColorStop(.5, '#1c3547')
  studioBackground.addColorStop(1, '#31576a')
  studio.fillStyle = studioBackground
  studio.fillRect(0, 0, 1024, 512)
  for (const [x, y, width, height, color] of [[540, 80, 160, 320, '#e7f6ff'], [890, 95, 90, 310, '#779dab'], [710, 175, 120, 210, '#54b4c9'], [270, 20, 550, 75, '#d7f6ff']]) {
    const reflection = studio.createLinearGradient(x, 0, x + width, 0)
    reflection.addColorStop(0, '#243e4c')
    reflection.addColorStop(.25, color)
    reflection.addColorStop(.6, color)
    reflection.addColorStop(1, '#243e4c')
    studio.fillStyle = reflection
    studio.fillRect(x, y, width, height)
  }
  const studioTexture = new THREE.CanvasTexture(studioCanvas)
  studioTexture.mapping = THREE.EquirectangularReflectionMapping
  studioTexture.colorSpace = THREE.SRGBColorSpace
  const environment = pmrem.fromEquirectangular(studioTexture)
  scene.environment = environment.texture
  scene.environmentIntensity = 1.25
  studioTexture.dispose()
  pmrem.dispose()

  const key = new THREE.DirectionalLight(0xf1f6ff, 2)
  key.position.set(-3, 4, 5)
  scene.add(key)
  const fill = new THREE.DirectionalLight(0x62d6ee, .8)
  fill.position.set(3, -2, 3)
  scene.add(fill)
  const coreLight = new THREE.PointLight(0x8eeeff, 2.2, 3, 2)
  coreLight.position.set(0, 0, .55)
  scene.add(coreLight)

  const model = new THREE.Group()
  model.rotation.set(.055, -.065, 0)
  scene.add(model)
  const scratchCanvas = document.createElement('canvas')
  scratchCanvas.width = scratchCanvas.height = 256
  const scratchContext = scratchCanvas.getContext('2d')
  let seed = 37
  for (let y = 0; y < 256; y++) {
    seed = (seed * 16807) % 2147483647
    const gray = 120 + seed % 32
    scratchContext.fillStyle = `rgb(${gray},${gray},${gray})`
    scratchContext.fillRect(0, y, 256, 1)
  }
  const scratches = new THREE.CanvasTexture(scratchCanvas)
  scratches.wrapS = scratches.wrapT = THREE.RepeatWrapping
  scratches.repeat.set(3, 1)
  const steel = new THREE.MeshPhysicalMaterial({ color: 0xc0d1dc, metalness: 1, roughness: .14, bumpMap: scratches, bumpScale: .0008, clearcoat: 1, clearcoatRoughness: .06 })
  const titanium = new THREE.MeshStandardMaterial({ color: 0x526b7d, metalness: .95, roughness: .24, bumpMap: scratches, bumpScale: .0015 })
  const black = new THREE.MeshStandardMaterial({ color: 0x090e14, metalness: .35, roughness: .6 })
  const panels = new THREE.MeshPhysicalMaterial({ color: 0x81b7c5, metalness: .65, roughness: .32, clearcoat: .7, clearcoatRoughness: .08 })
  const lightMaterial = new THREE.MeshBasicMaterial({ color: 0x62e9ff, toneMapped: false })
  const whiteLight = new THREE.MeshBasicMaterial({ color: 0xe5ffff, toneMapped: false })

  function mesh(geometry, material, parent = model) {
    const item = new THREE.Mesh(geometry, material)
    parent.add(item)
    return item
  }
  function ring(outer, inner, depth, z, material, parent = model) {
    const shape = new THREE.Shape()
    shape.absarc(0, 0, outer, 0, Math.PI * 2, false)
    const hole = new THREE.Path()
    hole.absarc(0, 0, inner, 0, Math.PI * 2, true)
    shape.holes.push(hole)
    const item = mesh(new THREE.ExtrudeGeometry(shape, { depth, curveSegments: 96, bevelEnabled: true, bevelSize: .008, bevelThickness: .009, bevelSegments: 2, steps: 1 }), material, parent)
    item.position.z = z
    return item
  }
  function torus(radius, tube, z, material, parent = model) {
    const item = mesh(new THREE.TorusGeometry(radius, tube, 12, 128), material, parent)
    item.position.z = z
    return item
  }
  function screw(x, y, z, radius = .025, parent = model) {
    const item = mesh(new THREE.CylinderGeometry(radius, radius, .018, 20), steel, parent)
    item.rotation.x = Math.PI / 2
    item.position.set(x, y, z)
    const slot = mesh(new THREE.BoxGeometry(radius * 1.2, .005, .002), black, parent)
    slot.position.set(x, y, z + .010)
  }

  function roundedSupport(parent) {
    const geometry = new RoundedBoxGeometry(.22, .295, .065, 6, .027)
    const positions = geometry.attributes.position
    const normals = geometry.attributes.normal
    const normal = new THREE.Vector3()
    for (let index = 0; index < positions.count; index++) {
      const x = positions.getX(index), y = positions.getY(index), z = positions.getZ(index)
      if (z > 0) {
        const across = Math.max(0, 1 - (x / .11) ** 2)
        const along = Math.max(0, 1 - (y / .1475) ** 2)
        positions.setZ(index, z + .052 * across * along)
        // Preserve the continuous bevel normals while curving the polished front.
        normal.fromBufferAttribute(normals, index)
        normal.x += .104 * x / .11 ** 2 * along * normal.z
        normal.y += .104 * y / .1475 ** 2 * across * normal.z
        normal.normalize()
        normals.setXYZ(index, normal.x, normal.y, normal.z)
      }
    }
    const item = mesh(geometry, steel, parent)
    item.position.set(0, .925, .16)
  }

  function innerSupport(parent) {
    const shape = new THREE.Shape()
    shape.moveTo(-.10, .84)
    shape.lineTo(.10, .84)
    shape.lineTo(.092, .55)
    shape.quadraticCurveTo(.092, .526, .07, .524)
    shape.lineTo(-.07, .524)
    shape.quadraticCurveTo(-.092, .526, -.092, .55)
    shape.closePath()
    const plate = mesh(new THREE.ExtrudeGeometry(shape, { depth: .025, bevelSize: .008, bevelThickness: .009, bevelSegments: 3, curveSegments: 12 }), steel, parent)
    plate.position.z = .125
    const positions = new Float32Array([
      -.095,.831,.158, .095,.831,.158, .083,.544,.165, -.083,.544,.158,
    ])
    const facets = new THREE.BufferGeometry()
    facets.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    facets.setIndex([0,2,1, 0,3,2])
    const flatFacets = facets.toNonIndexed()
    flatFacets.computeVertexNormals()
    facets.dispose()
    mesh(flatFacets, steel, parent)
  }

  ring(1.13, 1.015, .22, -.13, titanium)
  ring(1.102, 1.027, .037, .10, steel)
  torus(1.125, .014, .13, steel)
  torus(1.092, .007, .149, whiteLight)
  torus(1.031, .012, .14, steel)
  ring(1.023, .786, .029, .046, lightMaterial)
  // Radial falloff supplies the broad cyan bands and soft white light of the reference.
  const bandCanvas = document.createElement('canvas')
  bandCanvas.width = bandCanvas.height = 512
  const bandContext = bandCanvas.getContext('2d')
  const bandGradient = bandContext.createRadialGradient(256, 256, 0, 256, 256, 256)
  for (const [stop, color] of [[0, '#288cba'], [.76, '#288cba'], [.79, '#45dbf9'], [.835, '#b2faff'], [.86, '#edffff'], [.88, '#adf8ff'], [.91, '#58e7fa'], [.94, '#c5fcff'], [.965, '#edffff'], [1, '#1bcaed']]) bandGradient.addColorStop(stop, color)
  bandContext.fillStyle = bandGradient
  bandContext.fillRect(0, 0, 512, 512)
  const bandTexture = new THREE.CanvasTexture(bandCanvas)
  bandTexture.colorSpace = THREE.SRGBColorSpace
  const band = mesh(new THREE.RingGeometry(.793, 1.023, 128), new THREE.MeshBasicMaterial({ map: bandTexture, toneMapped: false }))
  band.position.z = .085
  torus(.796, .012, .12, steel)
  ring(.785, .51, .028, .085, panels)

  for (let index = 0; index < 10; index++) {
    const angle = Math.PI / 2 + index / 10 * Math.PI * 2
    const support = new THREE.Group()
    support.rotation.z = angle - Math.PI / 2
    model.add(support)
    roundedSupport(support)
    innerSupport(support)
    screw(Math.cos(angle + Math.PI / 10) * 1.065, Math.sin(angle + Math.PI / 10) * 1.065, .142, .012)
  }

  ring(.518, .374, .056, .105, titanium)
  torus(.522, .012, .17, steel)
  torus(.503, .008, .179, lightMaterial)
  for (let index = 0; index < 32; index++) {
    const angle = index / 32 * Math.PI * 2
    const pad = mesh(new THREE.BoxGeometry(.067, .10, .014), whiteLight)
    pad.position.set(Math.cos(angle) * .445, Math.sin(angle) * .445, .181)
    pad.rotation.z = angle - Math.PI / 2
  }
  torus(.39, .01, .196, steel)
  ring(.379, .323, .027, .165, steel)
  torus(.363, .010, .205, lightMaterial)
  torus(.328, .009, .209, whiteLight)

  const emitterCanvas = document.createElement('canvas')
  emitterCanvas.width = emitterCanvas.height = 256
  const emitterContext = emitterCanvas.getContext('2d')
  const gradient = emitterContext.createRadialGradient(116, 110, 8, 128, 128, 132)
  gradient.addColorStop(0, '#ffffff')
  gradient.addColorStop(.65, '#f7ffff')
  gradient.addColorStop(.88, '#cbf8ff')
  gradient.addColorStop(1, '#74d9ed')
  emitterContext.fillStyle = gradient
  emitterContext.fillRect(0, 0, 256, 256)
  emitterContext.strokeStyle = '#398aa51d'
  emitterContext.lineWidth = .55
  for (let row = 0; row < 44; row++) for (let column = 0; column < 36; column++) {
    const x = column * 7.1 + (row % 2 ? 3.55 : 0)
    const y = row * 6.15
    emitterContext.beginPath()
    for (let corner = 0; corner < 6; corner++) {
      const angle = Math.PI / 3 * corner + Math.PI / 6
      const px = x + Math.cos(angle) * 4.1, py = y + Math.sin(angle) * 4.1
      if (corner === 0) emitterContext.moveTo(px, py)
      else emitterContext.lineTo(px, py)
    }
    emitterContext.closePath()
    emitterContext.stroke()
  }
  const emitterTexture = new THREE.CanvasTexture(emitterCanvas)
  emitterTexture.colorSpace = THREE.SRGBColorSpace
  const emitter = mesh(new THREE.CircleGeometry(.319, 96), new THREE.MeshBasicMaterial({ map: emitterTexture, toneMapped: false }))
  emitter.position.z = .184
  const lens = mesh(new THREE.SphereGeometry(.319, 64, 32), new THREE.MeshPhysicalMaterial({ color: 0xf3fcff, metalness: 0, roughness: .08, transparent: true, opacity: .18, clearcoat: 1, clearcoatRoughness: .035 }))
  lens.scale.z = .145
  lens.position.z = .185

  const glowCanvas = document.createElement('canvas')
  glowCanvas.width = glowCanvas.height = 128
  const glowContext = glowCanvas.getContext('2d')
  const glowGradient = glowContext.createRadialGradient(64, 64, 5, 64, 64, 64)
  glowGradient.addColorStop(0, '#82edff18')
  glowGradient.addColorStop(.27, '#82edff16')
  glowGradient.addColorStop(.58, '#20d5ff08')
  glowGradient.addColorStop(.68, '#21dfff45')
  glowGradient.addColorStop(.74, '#2de7ff64')
  glowGradient.addColorStop(.8, '#21dfff32')
  glowGradient.addColorStop(1, '#21dfff00')
  glowContext.fillStyle = glowGradient
  glowContext.fillRect(0, 0, 128, 128)
  const glowTexture = new THREE.CanvasTexture(glowCanvas)
  glowTexture.colorSpace = THREE.SRGBColorSpace
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, transparent: true, opacity: .8, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, toneMapped: false }))
  glow.scale.set(2.9, 2.9, 1)
  glow.position.z = .25
  model.add(glow)

  let disposed = false
  let visible = true
  let frame = 0
  let lastRender = 0
  const motion = matchMedia('(prefers-reduced-motion: reduce)')
  const target = { x: .055, y: -.065 }
  function render(time = 0) {
    if (disposed) return
    if (!motion.matches) {
      model.rotation.x += (target.x - model.rotation.x) * .06
      model.rotation.y += (target.y - model.rotation.y) * .06
      coreLight.intensity = 2.2 + Math.sin(time * .0009) * .08
      glow.material.opacity = .8 + Math.sin(time * .0009) * .025
    }
    renderer.render(scene, camera)
  }
  function animate(time) {
    frame = 0
    canvas.dataset.motion = motion.matches ? 'reduced' : 'animated'
    if (disposed || !visible || motion.matches) return
    if (!touchScreen || time - lastRender >= 1000 / 30) { render(time); lastRender = time }
    frame = requestAnimationFrame(animate)
  }
  function restart() {
    canvas.dataset.motion = motion.matches ? 'reduced' : 'animated'
    if (frame) cancelAnimationFrame(frame)
    frame = 0
    render()
    if (visible && !document.hidden && !motion.matches && !disposed) frame = requestAnimationFrame(animate)
  }
  const observer = new ResizeObserver(() => {
    const { width, height } = canvas.getBoundingClientRect()
    if (width && height) {
      renderer.setSize(Math.ceil(width), Math.ceil(height), false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      render()
    }
  })
  observer.observe(canvas)
  const intersection = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; restart() })
  intersection.observe(canvas)
  const surface = canvas.closest('.system-visual')
  const pointer = event => {
    if (motion.matches) return
    const rect = surface.getBoundingClientRect()
    target.x = .055 - ((event.clientY - rect.top) / rect.height - .5) * .06
    target.y = -.065 + ((event.clientX - rect.left) / rect.width - .5) * .07
  }
  const reset = () => { target.x = .055; target.y = -.065 }
  surface.addEventListener('pointermove', pointer)
  surface.addEventListener('pointerleave', reset)
  motion.addEventListener('change', restart)
  document.addEventListener('visibilitychange', restart)
  const contextLost = () => {
    visible = false
    if (frame) cancelAnimationFrame(frame)
    frame = 0
  }
  canvas.addEventListener('webglcontextlost', contextLost)
  restart()

  return {
    exportPng(size = 768) {
      const pixelRatio = renderer.getPixelRatio()
      const currentSize = renderer.getSize(new THREE.Vector2())
      renderer.setPixelRatio(1)
      renderer.setSize(size, size, false)
      camera.aspect = 1
      camera.updateProjectionMatrix()
      renderer.render(scene, camera)
      const data = canvas.toDataURL('image/png')
      renderer.setPixelRatio(pixelRatio)
      renderer.setSize(currentSize.x, currentSize.y, false)
      camera.aspect = currentSize.x / currentSize.y
      camera.updateProjectionMatrix()
      return data
    },
    dispose() {
      disposed = true
      cancelAnimationFrame(frame)
      observer.disconnect()
      intersection.disconnect()
      surface.removeEventListener('pointermove', pointer)
      surface.removeEventListener('pointerleave', reset)
      motion.removeEventListener('change', restart)
      document.removeEventListener('visibilitychange', restart)
      canvas.removeEventListener('webglcontextlost', contextLost)
      const geometries = new Set()
      const materials = new Set()
      scene.traverse(item => { if (item.geometry) geometries.add(item.geometry); if (item.material) materials.add(item.material) })
      geometries.forEach(geometry => geometry.dispose())
      materials.forEach(material => material.dispose())
      scratches.dispose()
      emitterTexture.dispose()
      bandTexture.dispose()
      glowTexture.dispose()
      environment.dispose()
      renderer.dispose()
    },
  }
}

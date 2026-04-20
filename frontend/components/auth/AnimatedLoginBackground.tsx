'use client'

import { useEffect, useRef } from 'react'

/**
 * AnimatedLoginBackground Component
 * 
 * Creates a 3D animated background using Three.js with brand colors:
 * - Emerald green (#10b981)
 * - Beige (#f5f5dc)
 * 
 * Features:
 * - Rotating geometric shapes (icosahedron and tetrahedron particles)
 * - Gradient background from emerald to beige
 * - Smooth animations with requestAnimationFrame
 * - Responsive to window resize
 */
export function AnimatedLoginBackground() {
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    // Dynamically import Three.js to avoid SSR issues
    import('three').then((THREE) => {
      if (!canvasRef.current) return

      // Setup renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setPixelRatio(window.devicePixelRatio || 1)
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.autoClear = false
      renderer.setClearColor(0x000000, 0.0)
      canvasRef.current.appendChild(renderer.domElement)

      // Setup scene and camera
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        1,
        1000
      )
      camera.position.z = 400
      camera.position.x = -200 // Move camera to the left so shapes appear on the right

      // Create object groups
      const circle = new THREE.Object3D()
      const skelet = new THREE.Object3D()
      const particle = new THREE.Object3D()

      scene.add(circle)
      scene.add(skelet)
      scene.add(particle)

      // Particle geometry
      const geometry = new THREE.TetrahedronGeometry(2, 0)
      const material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        flatShading: true,
      })

      // Create 1000 particles
      for (let i = 0; i < 1000; i++) {
        const mesh = new THREE.Mesh(geometry, material)
        const position = new THREE.Vector3(
          Math.random() - 0.5,
          Math.random() - 0.5,
          Math.random() - 0.5
        ).normalize()
        position.multiplyScalar(90 + Math.random() * 700)
        mesh.position.copy(position)
        mesh.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2)
        particle.add(mesh)
      }

      // Main planet (solid)
      const geom = new THREE.IcosahedronGeometry(7, 1)
      const mat = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        flatShading: true,
      })
      const planet = new THREE.Mesh(geom, mat)
      planet.scale.set(16, 16, 16)
      circle.add(planet)

      // Wireframe planet
      const geom2 = new THREE.IcosahedronGeometry(15, 1)
      const mat2 = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        wireframe: true,
        side: THREE.DoubleSide,
      })
      const planet2 = new THREE.Mesh(geom2, mat2)
      planet2.scale.set(10, 10, 10)
      skelet.add(planet2)

      // Lighting
      const ambientLight = new THREE.AmbientLight(0x999999)
      scene.add(ambientLight)

      // Directional lights with brand colors
      const lights: THREE.DirectionalLight[] = []
      lights[0] = new THREE.DirectionalLight(0xffffff, 1)
      lights[0].position.set(1, 0, 0)

      // Emerald green light (#174731)
      lights[1] = new THREE.DirectionalLight(0x174731, 1)
      lights[1].position.set(0.75, 1, 0.5)

      // Beige light (#e2d2b1)
      lights[2] = new THREE.DirectionalLight(0xe2d2b1, 1)
      lights[2].position.set(-0.75, -1, 0.5)

      scene.add(lights[0])
      scene.add(lights[1])
      scene.add(lights[2])

      // Handle window resize
      const onWindowResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
      }
      window.addEventListener('resize', onWindowResize, false)

      // Animation loop
      let animationId: number
      const animate = () => {
        animationId = requestAnimationFrame(animate)

        particle.rotation.y -= 0.004
        circle.rotation.x -= 0.002
        circle.rotation.y -= 0.003
        skelet.rotation.x -= 0.001
        skelet.rotation.y += 0.002

        renderer.clear()
        renderer.render(scene, camera)
      }
      animate()

      // Cleanup
      return () => {
        cancelAnimationFrame(animationId)
        window.removeEventListener('resize', onWindowResize)
        if (canvasRef.current && renderer.domElement) {
          canvasRef.current.removeChild(renderer.domElement)
        }
        renderer.dispose()
      }
    })
  }, [])

  return (
    <>
      {/* Gradient background */}
      <div
        className="fixed inset-0 -z-20"
        style={{
          background: 'linear-gradient(to bottom, #002d10ff 0%, #011306ff 100%)',
        }}
      />
      {/* Three.js canvas container */}
      <div ref={canvasRef} className="fixed inset-0 -z-10" />
    </>
  )
}

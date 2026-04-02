'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PresentationControls, Stars } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import { createNoise3D } from 'simplex-noise'
import { useLanguage } from './LanguageProvider'

type PlanetType = 'Earth' | 'Saturn' | 'Neptune'

type PlanetVoxel = {
  position: [number, number, number]
  color: THREE.Color
}

type PlanetInstance = {
  position: THREE.Vector3
  morphPosition: THREE.Vector3
  targetPosition: THREE.Vector3
  color: THREE.Color
  targetColor: THREE.Color
  scale: number
  targetScale: number
}

const PLANETS: PlanetType[] = ['Earth', 'Saturn', 'Neptune']
const PLANET_SEEDS: Record<PlanetType, number> = {
  Earth: 101,
  Saturn: 202,
  Neptune: 303,
}
const MAX_INSTANCES = 25000

let globalEarthData: ImageData | null = null
let earthDataCallbacks: Array<(data: ImageData) => void> = []
let earthTextureRequested = false

const planetCache: Record<string, PlanetVoxel[]> = {}

function createBlankInstance(): PlanetInstance {
  return {
    position: new THREE.Vector3(),
    morphPosition: new THREE.Vector3(),
    targetPosition: new THREE.Vector3(),
    color: new THREE.Color('#000000'),
    targetColor: new THREE.Color('#000000'),
    scale: 0,
    targetScale: 0,
  }
}

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffleInPlace<T>(items: T[], random: () => number) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[items[index], items[swapIndex]] = [items[swapIndex], items[index]]
  }

  return items
}

function ensureEarthDataLoaded() {
  if (typeof window === 'undefined' || globalEarthData || earthTextureRequested) {
    return
  }

  earthTextureRequested = true

  const image = new window.Image()
  image.crossOrigin = 'anonymous'
  image.src =
    'https://cdn.jsdelivr.net/gh/mrdoob/three.js@master/examples/textures/planets/earth_atmos_2048.jpg'

  image.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 256

    const context = canvas.getContext('2d')
    if (!context) {
      earthTextureRequested = false
      return
    }

    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    globalEarthData = context.getImageData(0, 0, canvas.width, canvas.height)
    earthDataCallbacks.forEach((callback) => callback(globalEarthData!))
    earthDataCallbacks = []
  }

  image.onerror = () => {
    earthTextureRequested = false
  }
}

function generatePlanet(type: PlanetType, isMobile: boolean, earthData: ImageData | null = null) {
  const cacheKey = `${type}-${isMobile}-${earthData ? 'loaded' : 'unloaded'}`
  if (planetCache[cacheKey]) {
    return planetCache[cacheKey]
  }

  const random = mulberry32(PLANET_SEEDS[type])
  const noise3D = createNoise3D(random)
  const voxels: PlanetVoxel[] = []
  const maxDistance = isMobile ? 20 : 26

  for (let x = -maxDistance; x <= maxDistance; x += 1) {
    for (let y = -maxDistance; y <= maxDistance; y += 1) {
      for (let z = -maxDistance; z <= maxDistance; z += 1) {
        const distance = Math.sqrt(x * x + y * y + z * z)
        if (distance > maxDistance) {
          continue
        }

        let color = new THREE.Color('#ffffff')
        let isSolid = false

        if (type === 'Earth') {
          const radius = isMobile ? 10 : 13
          if (!earthData) {
            continue
          }

          if (distance > radius + 2 || distance === 0) {
            continue
          }

          const nx = x / distance
          const ny = y / distance
          const nz = z / distance

          const latitude = Math.asin(ny)
          const longitude = Math.atan2(nx, nz)
          let u = 0.5 + longitude / (2 * Math.PI)
          const v = 0.5 - latitude / Math.PI
          u = (u + 0.25) % 1

          const pixelX = Math.floor(u * (earthData.width - 1))
          const pixelY = Math.floor(v * (earthData.height - 1))
          const pixelIndex = (pixelY * earthData.width + pixelX) * 4

          const red = earthData.data[pixelIndex] / 255
          const green = earthData.data[pixelIndex + 1] / 255
          const blue = earthData.data[pixelIndex + 2] / 255

          const isOcean = blue > red * 1.2 && blue > green * 1.1 && red < 0.8
          const elevation = isOcean ? radius : radius + 1

          if (distance <= elevation) {
            isSolid = true

            if (distance > elevation - 1) {
              color.setRGB(red * 1.1, green * 1.1, blue * 1.1)
            } else if (distance < radius * 0.4) {
              color.set('#ff4500')
            } else if (distance < radius * 0.7) {
              color.set('#8b0000')
            } else {
              color.set('#8b4513')
            }
          }
        }

        if (type === 'Neptune') {
          const radius = isMobile ? 10 : 13

          if (distance <= radius) {
            isSolid = true

            if (distance > radius - 1) {
              const band = Math.sin(y * 0.8 + noise3D(x * 0.1, y * 0.1, z * 0.1))
              const cloud = noise3D(x * 0.2, y * 0.2, z * 0.2)

              if (cloud > 0.6) {
                color.set('#ffffff')
              } else if (band > 0.5) {
                color.set('#3e66a8')
              } else {
                color.set('#274687')
              }
            } else {
              color.set('#1a2b56')
            }
          }
        }

        if (type === 'Saturn') {
          const radius = isMobile ? 6 : 8

          if (distance <= radius) {
            isSolid = true

            if (distance > radius - 1) {
              const band =
                Math.sin(y * 1.2 + noise3D(x * 0.05, y * 0.05, z * 0.05) * 0.5)

              if (band > 0.6) {
                color.set('#ead6b8')
              } else if (band > 0.2) {
                color.set('#d5b996')
              } else if (band > -0.2) {
                color.set('#ceb8b8')
              } else if (band > -0.6) {
                color.set('#c3a171')
              } else {
                color.set('#e0c8b0')
              }
            } else {
              color.set('#a68b6a')
            }
          }

          const innerRingRadius = radius + 2
          const outerRingRadius = radius + (isMobile ? 6 : 8)
          const planeDistance = Math.sqrt(x * x + z * z)

          if (
            Math.abs(y) <= 0.5 &&
            planeDistance >= innerRingRadius &&
            planeDistance <= outerRingRadius
          ) {
            const ringNoise = Math.sin(planeDistance * 2)

            if (ringNoise > -0.5) {
              isSolid = true

              if (ringNoise > 0.8) {
                color.set('#a89c82')
              } else if (ringNoise > 0.2) {
                color.set('#d8ca9d')
              } else {
                color.set('#e8d8b0')
              }
            }
          }
        }

        if (isSolid) {
          voxels.push({
            position: [x, y, z],
            color,
          })
        }
      }
    }
  }

  const result = shuffleInPlace(voxels, random).slice(0, MAX_INSTANCES)
  planetCache[cacheKey] = result
  return result
}

function VoxelPlanet({ type, isMobile }: { type: PlanetType; isMobile: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const instancesRef = useRef<PlanetInstance[]>([])
  const [earthData, setEarthData] = useState<ImageData | null>(globalEarthData)
  const raycaster = useThree((state) => state.raycaster)

  const motionState = useMemo(
    () => ({
      dummy: new THREE.Object3D(),
      targetPosition: new THREE.Vector3(),
      direction: new THREE.Vector3(),
      swirl: new THREE.Vector3(),
      closestPoint: new THREE.Vector3(),
      inverseMatrix: new THREE.Matrix4(),
      localRay: new THREE.Ray(),
    }),
    []
  )

  useEffect(() => {
    if (type !== 'Earth' || earthData) {
      return
    }

    if (globalEarthData) {
      setEarthData(globalEarthData)
      return
    }

    ensureEarthDataLoaded()
    earthDataCallbacks.push(setEarthData)

    return () => {
      earthDataCallbacks = earthDataCallbacks.filter((callback) => callback !== setEarthData)
    }
  }, [type, earthData])

  useEffect(() => {
    if (instancesRef.current.length === 0) {
      instancesRef.current = Array.from({ length: MAX_INSTANCES }, () => createBlankInstance())
    }

    const voxels = generatePlanet(type, isMobile, earthData)

    instancesRef.current.forEach((instance, index) => {
      const voxel = voxels[index]

      if (!voxel) {
        instance.targetScale = 0
        instance.targetPosition.set(0, 0, 0)
        return
      }

      instance.targetPosition.set(...voxel.position)
      instance.targetColor.copy(voxel.color)
      instance.targetScale = 1

      if (instance.scale === 0 && instance.position.lengthSq() === 0) {
        instance.position.set(...voxel.position)
        instance.morphPosition.set(...voxel.position)
        instance.color.copy(voxel.color)
      }
    })
  }, [type, isMobile, earthData])

  useFrame((state, delta) => {
    if (!meshRef.current || instancesRef.current.length === 0) {
      return
    }

    const { dummy, targetPosition, direction, swirl, closestPoint, inverseMatrix, localRay } =
      motionState

    raycaster.setFromCamera(state.pointer, state.camera)
    inverseMatrix.copy(meshRef.current.matrixWorld).invert()
    localRay.copy(raycaster.ray).applyMatrix4(inverseMatrix)

    const repelRadius = isMobile ? 5 : 8

    instancesRef.current.forEach((instance, index) => {
      instance.morphPosition.lerp(instance.targetPosition, delta * 2.5)
      instance.color.lerp(instance.targetColor, delta * 2.5)

      let desiredScale = instance.targetScale
      targetPosition.copy(instance.morphPosition)

      if (instance.scale > 0) {
        localRay.closestPointToPoint(instance.morphPosition, closestPoint)
        const distance = closestPoint.distanceTo(instance.morphPosition)

        if (distance < repelRadius) {
          direction.subVectors(instance.morphPosition, closestPoint).normalize()
          swirl.crossVectors(direction, localRay.direction).normalize()

          const force = Math.pow((repelRadius - distance) / repelRadius, 2) * 1.5
          targetPosition.add(direction.multiplyScalar(force))
          targetPosition.add(swirl.multiplyScalar(force * 0.15))
          targetPosition.addScaledVector(localRay.direction, force * 0.05)
          desiredScale = instance.targetScale * (0.8 + 0.2 * (distance / repelRadius))
        }
      }

      instance.scale = THREE.MathUtils.lerp(instance.scale, desiredScale, delta * 12)
      instance.position.lerp(targetPosition, delta * 15)

      dummy.position.copy(instance.position)
      dummy.scale.setScalar(instance.scale)
      dummy.updateMatrix()

      meshRef.current!.setMatrixAt(index, dummy.matrix)
      meshRef.current!.setColorAt(index, instance.color)
    })

    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true
    }

    meshRef.current.rotation.y += delta * 0.1
    meshRef.current.rotation.x += delta * 0.05
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, MAX_INSTANCES]} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.72} metalness={0.08} />
    </instancedMesh>
  )
}

function CameraRig() {
  const { size, viewport } = useThree()
  const isMobile = size.width < 768

  useFrame((state) => {
    if (isMobile) {
      state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, 0, 0.05)
      state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, 0, 0.05)
    } else {
      const targetX = (state.pointer.x * viewport.width) / 50
      const targetY = (state.pointer.y * viewport.height) / 50
      state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, 0.05)
      state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.05)
    }

    state.camera.lookAt(0, 0, 0)
  })

  return null
}

function PlanetContainer({ activePlanet }: { activePlanet: PlanetType }) {
  const { size, viewport } = useThree()
  const isMobile = size.width < 768
  const groupRef = useRef<THREE.Group>(null)

  const targetPosition = useMemo(
    () => new THREE.Vector3(isMobile ? 0 : viewport.width * 0.22, 0, 0),
    [isMobile, viewport.width]
  )
  const targetScale = useMemo(
    () => new THREE.Vector3(isMobile ? 1.25 : 1.08, isMobile ? 1.25 : 1.08, isMobile ? 1.25 : 1.08),
    [isMobile]
  )

  useEffect(() => {
    ensureEarthDataLoaded()
    PLANETS.forEach((planet) => {
      generatePlanet(planet, isMobile, planet === 'Earth' ? globalEarthData : null)
    })
  }, [isMobile])

  useFrame((_, delta) => {
    if (!groupRef.current) {
      return
    }

    groupRef.current.position.lerp(targetPosition, delta * 5)
    groupRef.current.scale.lerp(targetScale, delta * 5)
  })

  return (
    <group ref={groupRef}>
      <PresentationControls
        global
        cursor
        rotation={[0, 0, 0]}
        polar={[-Math.PI / 2, Math.PI / 2]}
        azimuth={[-Infinity, Infinity]}
      >
        <mesh>
          <sphereGeometry args={[isMobile ? 18 : 24, 32, 32]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
        <VoxelPlanet type={activePlanet} isMobile={isMobile} />
      </PresentationControls>
    </group>
  )
}

function CosmosScene({ activePlanet }: { activePlanet: PlanetType }) {
  return (
    <Canvas
      className="h-full w-full"
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 0, 60], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.45} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.45}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-10, -10, -10]} intensity={0.32} color="#7a8aa2" />

      <PlanetContainer activePlanet={activePlanet} />
      <Stars radius={58} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
      <CameraRig />

      <EffectComposer>
        <Bloom intensity={1.1} luminanceThreshold={0.4} luminanceSmoothing={0.9} />
      </EffectComposer>
    </Canvas>
  )
}

export default function CosmosExperience() {
  const { t } = useLanguage()
  const [activePlanet, setActivePlanet] = useState<PlanetType>('Earth')

  return (
    <section className="relative isolate min-h-screen overflow-hidden bg-[#05070d] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(74,90,116,0.72),_transparent_48%),linear-gradient(180deg,_#9AA5B3_0%,_#354150_34%,_#111722_68%,_#05070d_100%)]" />
      <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="absolute inset-0">
        <CosmosScene activePlanet={activePlanet} />
      </div>

      <div className="pointer-events-none relative z-10 flex min-h-screen flex-col px-6 pb-10 pt-28 md:px-12 md:pb-12 md:pt-32 lg:px-20">
        <div className="grid flex-1 items-start gap-12">
          <div className="max-w-4xl">
            <div className="mb-5 flex items-center gap-4">
              <div className="h-px w-10 bg-[#e8d0a5]" />
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#e8d0a5]">
                {t('cosmos.kicker')}
              </span>
            </div>

            <h1 className="max-w-4xl font-serif text-5xl font-light leading-[0.98] tracking-tight text-white md:text-7xl lg:text-[5.3rem]">
              {t('cosmos.title')}
            </h1>

            <div className="mt-8 max-w-2xl border-l border-white/15 pl-6 text-base leading-7 text-slate-300 md:text-lg">
              <p>{t('cosmos.subtitle')}</p>
            </div>

            <div className="mt-14 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-[28px] border border-white/10 bg-black/18 px-5 py-5 backdrop-blur-md">
                <div className="text-3xl font-serif font-light">3</div>
                <div className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                  {t('cosmos.stat.planets')}
                </div>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-black/18 px-5 py-5 backdrop-blur-md">
                <div className="text-3xl font-serif font-light">25K</div>
                <div className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                  {t('cosmos.stat.voxels')}
                </div>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-black/18 px-5 py-5 backdrop-blur-md">
                <div className="text-3xl font-serif font-light">60fps</div>
                <div className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                  {t('cosmos.stat.realtime')}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto flex flex-col items-center gap-4 pb-2 pt-12">
          <p className="pointer-events-none text-center text-xs uppercase tracking-[0.22em] text-slate-300/80">
            {t('cosmos.hint')}
          </p>

          <div className="pointer-events-auto flex max-w-[90vw] flex-wrap items-center justify-center gap-2 rounded-full border border-white/10 bg-black/20 p-2 backdrop-blur-xl">
            {PLANETS.map((planet) => {
              const isActive = activePlanet === planet

              return (
                <button
                  key={planet}
                  type="button"
                  onClick={() => setActivePlanet(planet)}
                  aria-pressed={isActive}
                  className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 md:px-6 ${
                    isActive
                      ? 'bg-white/15 text-white shadow-[0_8px_30px_rgba(15,23,42,0.18)]'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {t(`cosmos.planet.${planet.toLowerCase()}`)}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

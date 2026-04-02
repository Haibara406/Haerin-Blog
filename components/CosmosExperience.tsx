'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PresentationControls, Stars } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import { createNoise3D } from 'simplex-noise'
import { useLanguage } from './LanguageProvider'

type PlanetType =
  | 'Sun'
  | 'Mercury'
  | 'Venus'
  | 'Earth'
  | 'Mars'
  | 'Jupiter'
  | 'Saturn'
  | 'Uranus'
  | 'Neptune'

type PlanetVoxel = {
  position: [number, number, number]
  color: THREE.Color
}

type PlanetInstance = {
  position: THREE.Vector3
  morphPosition: THREE.Vector3
  basePosition: THREE.Vector3
  chargePosition: THREE.Vector3
  explodedPosition: THREE.Vector3
  targetPosition: THREE.Vector3
  color: THREE.Color
  targetColor: THREE.Color
  scale: number
  targetScale: number
}

type ExplosionPhase = 'restored' | 'charging' | 'exploded'

type PlanetMaterialOptions = {
  emissive?: string
  emissiveIntensity?: number
  metalness: number
  roughness: number
}

const PLANETS: PlanetType[] = [
  'Sun',
  'Mercury',
  'Venus',
  'Earth',
  'Mars',
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
]
const PLANET_SEEDS: Record<PlanetType, number> = {
  Sun: 11,
  Mercury: 22,
  Venus: 33,
  Earth: 101,
  Mars: 404,
  Jupiter: 505,
  Saturn: 202,
  Uranus: 707,
  Neptune: 303,
}
const MAX_INSTANCES = 25000
const MAX_CORE_INSTANCES = 1600

let globalEarthData: ImageData | null = null
let earthDataCallbacks: Array<(data: ImageData) => void> = []
let earthTextureRequested = false

const planetCache: Record<string, PlanetVoxel[]> = {}
const coreCache: Record<string, PlanetVoxel[]> = {}

function createBlankInstance(): PlanetInstance {
  return {
    position: new THREE.Vector3(),
    morphPosition: new THREE.Vector3(),
    basePosition: new THREE.Vector3(),
    chargePosition: new THREE.Vector3(),
    explodedPosition: new THREE.Vector3(),
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

        if (type === 'Sun') {
          const radius = isMobile ? 12 : 16

          if (distance <= radius) {
            isSolid = true

            if (distance > radius - 1) {
              const flare = noise3D(x * 0.14, y * 0.14, z * 0.14)
              const granulation = noise3D(x * 0.3, y * 0.3, z * 0.3)

              if (granulation > 0.62) {
                color.set('#fff6b0')
              } else if (flare > 0.34) {
                color.set('#ffc14d')
              } else if (flare > -0.1) {
                color.set('#ff9726')
              } else {
                color.set('#ff6a00')
              }
            } else if (distance > radius * 0.72) {
              color.set('#ff7d12')
            } else if (distance > radius * 0.48) {
              color.set('#ff5a00')
            } else {
              color.set('#db3200')
            }
          }
        }

        if (type === 'Mercury') {
          const radius = isMobile ? 7 : 9

          if (distance <= radius) {
            isSolid = true

            if (distance > radius - 1) {
              const craterA = noise3D(x * 0.24, y * 0.24, z * 0.24)
              const craterB = noise3D(x * 0.58, y * 0.58, z * 0.58)

              if (craterB > 0.68) {
                color.set('#7a7670')
              } else if (craterA > 0.35) {
                color.set('#b2aba1')
              } else {
                color.set('#918a80')
              }
            } else {
              color.set('#5a544d')
            }
          }
        }

        if (type === 'Venus') {
          const radius = isMobile ? 9 : 11

          if (distance <= radius) {
            isSolid = true

            if (distance > radius - 1) {
              const cloudBand = Math.sin(y * 0.9 + noise3D(x * 0.08, y * 0.08, z * 0.08))
              const haze = noise3D(x * 0.18, y * 0.18, z * 0.18)

              if (haze > 0.48) {
                color.set('#f3ddb0')
              } else if (cloudBand > 0.45) {
                color.set('#d8b57b')
              } else {
                color.set('#b98a52')
              }
            } else {
              color.set('#83562f')
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

        if (type === 'Mars') {
          const radius = isMobile ? 8 : 10

          if (distance <= radius) {
            isSolid = true

            if (distance > radius - 1) {
              const terrainNoise = noise3D(x * 0.16, y * 0.16, z * 0.16)
              const craterNoise = noise3D(x * 0.42, y * 0.42, z * 0.42)
              const dustNoise = noise3D(x * 0.08, y * 0.08, z * 0.08)

              if (craterNoise > 0.66) {
                color.set('#7c341d')
              } else if (terrainNoise > 0.34) {
                color.set('#cf6940')
              } else if (dustNoise > 0.18) {
                color.set('#b64b2b')
              } else {
                color.set('#96301d')
              }
            } else {
              color.set('#5a1a12')
            }
          }
        }

        if (type === 'Jupiter') {
          const radius = isMobile ? 13 : 17

          if (distance <= radius) {
            isSolid = true

            if (distance > radius - 1) {
              const band = Math.sin(y * 0.6 + noise3D(x * 0.05, y * 0.05, z * 0.05))
              const spotDistance = Math.sqrt(
                Math.pow(x - radius * 0.6, 2) +
                  Math.pow(y + radius * 0.3, 2) +
                  Math.pow(z - radius * 0.6, 2)
              )

              if (spotDistance < radius * 0.25) {
                color.set('#ce5a2b')
              } else if (band > 0.7) {
                color.set('#dfd0af')
              } else if (band > 0.3) {
                color.set('#b87a47')
              } else if (band > -0.2) {
                color.set('#cd9654')
              } else if (band > -0.6) {
                color.set('#efe1c8')
              } else {
                color.set('#8d5734')
              }
            } else {
              color.set('#5c3a21')
            }
          }
        }

        if (type === 'Uranus') {
          const radius = isMobile ? 10 : 13

          if (distance <= radius) {
            isSolid = true

            if (distance > radius - 1) {
              const band = Math.sin(y * 0.7 + noise3D(x * 0.06, y * 0.06, z * 0.06))
              const mist = noise3D(x * 0.14, y * 0.14, z * 0.14)

              if (mist > 0.52) {
                color.set('#e5fff8')
              } else if (band > 0.3) {
                color.set('#a7e7de')
              } else {
                color.set('#78c9c6')
              }
            } else {
              color.set('#4f9c9a')
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

function getPlanetMaterialOptions(type: PlanetType): PlanetMaterialOptions {
  if (type === 'Sun') {
    return {
      emissive: '#ff7a1a',
      emissiveIntensity: 0.85,
      metalness: 0.02,
      roughness: 0.5,
    }
  }

  if (type === 'Mars') {
    return {
      emissive: '#2d0803',
      emissiveIntensity: 0.05,
      metalness: 0.04,
      roughness: 0.82,
    }
  }

  return {
    metalness: 0.08,
    roughness: 0.72,
  }
}

function generateCore(type: PlanetType, isMobile: boolean) {
  const cacheKey = `${type}-${isMobile}`
  if (coreCache[cacheKey]) {
    return coreCache[cacheKey]
  }

  const random = mulberry32(PLANET_SEEDS[type] * 97)
  const voxels: PlanetVoxel[] = []
  const radius = isMobile ? 3 : 4

  const palette: Record<PlanetType, [string, string, string]> = {
    Sun: ['#fff7c5', '#ffb84d', '#ff5a00'],
    Mercury: ['#f0ddd0', '#bca08a', '#6e5a4e'],
    Venus: ['#ffe3a3', '#d89f55', '#8b5125'],
    Earth: ['#ffe88a', '#ff7b2f', '#8b0d16'],
    Mars: ['#ffd38c', '#c94f2b', '#61140b'],
    Jupiter: ['#f4e2b6', '#c98f4f', '#6a4726'],
    Saturn: ['#f2dfba', '#cda67a', '#6f5944'],
    Uranus: ['#edfffb', '#8de0d6', '#377d83'],
    Neptune: ['#d7f1ff', '#4f87d6', '#14295f'],
  }

  for (let x = -radius; x <= radius; x += 1) {
    for (let y = -radius; y <= radius; y += 1) {
      for (let z = -radius; z <= radius; z += 1) {
        const distance = Math.sqrt(x * x + y * y + z * z)
        if (distance > radius) {
          continue
        }

        const wobble = random() * 0.45
        if (distance > radius - 0.3 + wobble) {
          continue
        }

        let color = palette[type][2]
        if (distance < radius * 0.33) {
          color = palette[type][0]
        } else if (distance < radius * 0.7) {
          color = palette[type][1]
        }

        voxels.push({
          position: [x, y, z],
          color: new THREE.Color(color),
        })
      }
    }
  }

  const result = shuffleInPlace(voxels, random).slice(0, MAX_CORE_INSTANCES)
  coreCache[cacheKey] = result
  return result
}

function getExplodedPosition(
  type: PlanetType,
  source: [number, number, number],
  index: number,
  isMobile: boolean
) {
  const base = new THREE.Vector3(...source)
  const radius = Math.max(base.length(), 1)
  const outward = base.clone().normalize()
  const random = mulberry32(PLANET_SEEDS[type] + index * 17 + (isMobile ? 3 : 11))
  const tangent = new THREE.Vector3(
    random() * 2 - 1,
    random() * 2 - 1,
    random() * 2 - 1
  ).normalize()
  const radiusFactor = THREE.MathUtils.clamp(radius / (isMobile ? 12 : 16), 0.3, 1.2)
  const spread = (isMobile ? 10 : 16) + radiusFactor * (isMobile ? 12 : 20)
  const wobble = (random() * 2 - 1) * (isMobile ? 2.2 : 3.4)

  return base
    .clone()
    .add(outward.multiplyScalar(spread))
    .add(tangent.multiplyScalar(wobble))
}

function getChargePosition(
  type: PlanetType,
  source: [number, number, number],
  index: number,
  isMobile: boolean
) {
  const base = new THREE.Vector3(...source)
  const inward = base.clone().multiplyScalar(isMobile ? 0.84 : 0.82)
  const random = mulberry32(PLANET_SEEDS[type] + index * 29 + (isMobile ? 5 : 13))
  const jitter = new THREE.Vector3(
    random() * 2 - 1,
    random() * 2 - 1,
    random() * 2 - 1
  ).multiplyScalar(isMobile ? 0.22 : 0.35)

  return inward.add(jitter)
}

function VoxelPlanet({
  type,
  isMobile,
  explosionPhase,
}: {
  type: PlanetType
  isMobile: boolean
  explosionPhase: ExplosionPhase
}) {
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
  const materialOptions = useMemo(() => getPlanetMaterialOptions(type), [type])

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

      instance.basePosition.set(...voxel.position)
      instance.chargePosition.copy(getChargePosition(type, voxel.position, index, isMobile))
      instance.explodedPosition.copy(getExplodedPosition(type, voxel.position, index, isMobile))

      if (explosionPhase === 'charging') {
        instance.targetPosition.copy(instance.chargePosition)
        instance.targetScale = 0.9
      } else if (explosionPhase === 'exploded') {
        instance.targetPosition.copy(instance.explodedPosition)
        instance.targetScale = 1
      } else {
        instance.targetPosition.copy(instance.basePosition)
        instance.targetScale = 1
      }

      instance.targetColor.copy(voxel.color)

      if (instance.scale === 0 && instance.position.lengthSq() === 0) {
        instance.position.set(...voxel.position)
        instance.morphPosition.set(...voxel.position)
        instance.color.copy(voxel.color)
      }
    })
  }, [type, isMobile, earthData, explosionPhase])

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
    const morphLerp = explosionPhase === 'charging' ? 7.5 : explosionPhase === 'exploded' ? 8.5 : 2.8
    const positionLerp = explosionPhase === 'charging' ? 18 : explosionPhase === 'exploded' ? 24 : 15
    const scaleLerp = explosionPhase === 'charging' ? 14 : explosionPhase === 'exploded' ? 18 : 12

    instancesRef.current.forEach((instance, index) => {
      instance.morphPosition.lerp(instance.targetPosition, delta * morphLerp)
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

      instance.scale = THREE.MathUtils.lerp(instance.scale, desiredScale, delta * scaleLerp)
      instance.position.lerp(targetPosition, delta * positionLerp)

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
      <meshStandardMaterial
        roughness={materialOptions.roughness}
        metalness={materialOptions.metalness}
        emissive={materialOptions.emissive}
        emissiveIntensity={materialOptions.emissiveIntensity}
      />
    </instancedMesh>
  )
}

function VoxelCore({
  type,
  isMobile,
  explosionPhase,
}: {
  type: PlanetType
  isMobile: boolean
  explosionPhase: ExplosionPhase
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const coreVoxels = useMemo(() => generateCore(type, isMobile), [type, isMobile])
  const materialOptions = useMemo(() => getPlanetMaterialOptions(type), [type])

  useEffect(() => {
    if (!meshRef.current) {
      return
    }

    const dummy = new THREE.Object3D()
    coreVoxels.forEach((voxel, index) => {
      dummy.position.set(...voxel.position)
      dummy.scale.setScalar(0.9)
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(index, dummy.matrix)
      meshRef.current!.setColorAt(index, voxel.color)
    })

    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true
    }
  }, [coreVoxels])

  useFrame((_, delta) => {
    if (!groupRef.current) {
      return
    }

    const targetScale =
      explosionPhase === 'restored' ? 0 : explosionPhase === 'charging' ? (isMobile ? 0.72 : 0.78) : 1
    groupRef.current.visible = explosionPhase !== 'restored' || groupRef.current.scale.x > 0.01
    groupRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      delta * 8
    )
    groupRef.current.rotation.y += delta * 0.45
    groupRef.current.rotation.x += delta * 0.18
  })

  return (
    <group ref={groupRef} scale={0.001}>
      <instancedMesh ref={meshRef} args={[undefined, undefined, MAX_CORE_INSTANCES]}>
        <boxGeometry args={[0.9, 0.9, 0.9]} />
        <meshStandardMaterial
          roughness={0.45}
          metalness={0.08}
          emissive={materialOptions.emissive ?? '#f2c67a'}
          emissiveIntensity={type === 'Sun' ? 1.35 : 0.45}
        />
      </instancedMesh>
    </group>
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

function PlanetContainer({
  activePlanet,
  explosionPhase,
}: {
  activePlanet: PlanetType
  explosionPhase: ExplosionPhase
}) {
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
        <VoxelCore type={activePlanet} isMobile={isMobile} explosionPhase={explosionPhase} />
        <VoxelPlanet type={activePlanet} isMobile={isMobile} explosionPhase={explosionPhase} />
      </PresentationControls>
    </group>
  )
}

function CosmosScene({
  activePlanet,
  explosionPhase,
}: {
  activePlanet: PlanetType
  explosionPhase: ExplosionPhase
}) {
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

      <PlanetContainer activePlanet={activePlanet} explosionPhase={explosionPhase} />
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
  const [explosionPhase, setExplosionPhase] = useState<ExplosionPhase>('restored')
  const explodeTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (explodeTimerRef.current !== null) {
        window.clearTimeout(explodeTimerRef.current)
      }
    }
  }, [])

  return (
    <section className="relative isolate min-h-screen overflow-hidden bg-[#05070d] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(74,90,116,0.72),_transparent_48%),linear-gradient(180deg,_#9AA5B3_0%,_#354150_34%,_#111722_68%,_#05070d_100%)]" />
      <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="absolute inset-0">
        <CosmosScene activePlanet={activePlanet} explosionPhase={explosionPhase} />
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
                <div className="text-3xl font-serif font-light">{PLANETS.length}</div>
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

            <div className="mt-8 pointer-events-auto">
              <button
                type="button"
                onClick={() => {
                  if (explosionPhase === 'charging') {
                    return
                  }

                  if (explosionPhase === 'exploded') {
                    setExplosionPhase('restored')
                    return
                  }

                  setExplosionPhase('charging')
                  if (explodeTimerRef.current !== null) {
                    window.clearTimeout(explodeTimerRef.current)
                  }

                  explodeTimerRef.current = window.setTimeout(() => {
                    setExplosionPhase((current) =>
                      current === 'charging' ? 'exploded' : current
                    )
                    explodeTimerRef.current = null
                  }, 240)
                }}
                aria-pressed={explosionPhase !== 'restored'}
                className={`inline-flex items-center rounded-full border px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
                  explosionPhase === 'exploded'
                    ? 'border-[#f2c67a] bg-[#f2c67a] text-slate-950 shadow-[0_10px_40px_rgba(242,198,122,0.18)]'
                    : 'border-white/15 bg-black/20 text-slate-100 hover:border-white/30 hover:bg-black/28'
                }`}
              >
                {explosionPhase === 'exploded' ? t('cosmos.restore') : t('cosmos.explode')}
              </button>
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

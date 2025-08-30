'use client'

import { useGLTF } from '@react-three/drei'
import { useEffect } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { addShapeKeysAtom, modelVisibilityAtom, setModelVisibleAtom } from 'app/store/playground'
import type { Mesh } from 'three'

interface GLTFModelProps {
  name: string
  url: string
  defaultVisible?: boolean
  scale?: number
}

// Load a GLTF and register its morph targets into the global store.
export default function GLTFModel({ name, url, defaultVisible, scale }: GLTFModelProps) {
  const { scene } = useGLTF(url)
  const addShapeKeys = useSetAtom(addShapeKeysAtom)
  const setVisible = useSetAtom(setModelVisibleAtom)
  const visibilityMap = useAtomValue(modelVisibilityAtom)
  const isVisible = visibilityMap[name] ?? !!defaultVisible

  useEffect(() => {
    // Apply instance name and optional scale. Enable cast/receive shadows.
    scene.name = name
    if (scale) scene.scale.setScalar(scale)
    scene.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
        if (child.geometry) {
          child.geometry.computeBoundingSphere?.()
          child.geometry.computeBoundingBox?.()
        }
      }
    })

    // Collect morph targets: each name → list of { mesh, index }
    const collected: Record<string, { mesh: Mesh; index: number }[]> = {}
    scene.traverse((o: any) => {
      if (o.isMesh && o.morphTargetInfluences && o.morphTargetDictionary) {
        Object.entries<number>(o.morphTargetDictionary).forEach(([key, idx]) => {
          ;(collected[key] ||= []).push({ mesh: o as Mesh, index: idx })
        })
      }
    })
    if (Object.keys(collected).length) addShapeKeys(collected)
    // Ensure initial visibility is honored once the asset is ready
    setVisible({ name, visible: isVisible })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, name])

  return <primitive object={scene} visible={isVisible} />
}

useGLTF.preload('/models/female_new_model.glb')
useGLTF.preload('/models/bodice.glb')
useGLTF.preload('/models/shirt.glb')
useGLTF.preload('/models/skirt.glb')



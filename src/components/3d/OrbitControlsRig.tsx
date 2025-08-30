'use client'

import { OrbitControls } from '@react-three/drei'
import { useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

import { zoomValueAtom } from 'app/store/playground'
import { Vector3 } from 'three'

// Orbit controls with camera distance coupled to the zoom slider value.
export default function OrbitControlsRig() {
  const zoom = useAtomValue(zoomValueAtom)
  const { camera, controls } = useThree((state) => ({ camera: state.camera, controls: state.controls as any }))

  // Keep camera distance aligned with UI zoom slider.
  useEffect(() => {
    const target = (controls?.target as Vector3) ?? (camera as any).target ?? { x: 0, y: 1, z: 0 }
    const targetVec = new Vector3((target as any).x, (target as any).y, (target as any).z)
    const currentDir = new Vector3().subVectors(camera.position as any, targetVec).normalize()
    const distance = 6.5 - zoom // 0.5->6, 6->0.5
    const newPos = targetVec.clone().add(currentDir.multiplyScalar(distance))
    camera.position.copy(newPos)
    ;(controls as any)?.update?.()
  }, [zoom, camera, controls])

  return (
    <OrbitControls
      enableDamping
      dampingFactor={0.05}
      screenSpacePanning={false}
      minDistance={1}
      maxDistance={10}
      target={[0, 1, 0]}
      makeDefault
    />
  )
}



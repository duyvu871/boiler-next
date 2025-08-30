'use client'

import { Canvas, type GLProps as CanvasProps } from '@react-three/fiber'
import { Suspense, type ReactNode } from 'react'
import { AdaptiveDpr, Preload } from '@react-three/drei'
import { Perf } from 'r3f-perf'
import { useAtomValue } from 'jotai'
import { showPerfAtom } from 'app/store/playground'

interface SceneCanvasProps extends Omit<CanvasProps, 'children'> {
  children: ReactNode
}

// Thin wrapper around R3F Canvas with sensible defaults for this project.
export default function SceneCanvas({ children, ...rest }: SceneCanvasProps) {
  const showPerf = useAtomValue(showPerfAtom)
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      camera={{ fov: 75, near: 0.1, far: 1000, position: [0, 1.5, 2] }}
      {...rest}
    >
      {showPerf && <Perf position="top-left" />}
      <AdaptiveDpr pixelated />
      <Suspense fallback={null}>{children}</Suspense>
      <Preload all />
    </Canvas>
  )
}



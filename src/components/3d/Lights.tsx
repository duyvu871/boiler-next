'use client'

/**
 * Lights – kết hợp preset "anti-chói lưng" với màu nền interior
 * - Giữ background slate (#0f1216) + contact shadows
 * - Giảm sáng phía sau model
 * - Ánh sáng dịu, trung tính (studio interior)
 */

import * as THREE from 'three'
import { Environment, Lightformer, ContactShadows } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'

// Giảm envMapIntensity toàn cục (IBL dịu → lưng không bị sáng quá)
function DampEnvMapIntensity({ value = 0.55 }: { value?: number }) {
  const { scene } = useThree()
  useEffect(() => {
    scene.traverse((o: any) => {
      if (o?.isMesh) {
        const m = o.material
        if (Array.isArray(m)) m.forEach((mm) => (mm.envMapIntensity = value))
        else if (m) m.envMapIntensity = value
      }
    })
  }, [scene, value])
  return null
}

export default function Lights() {
  return (
    <>
      {/* Nền tối nhẹ, tạo cảm giác interior studio */}
      {/* <color attach="background" args={['#0f1216']} /> */}

      <DampEnvMapIntensity value={0.55} />

      {/* Ambient / Hemisphere dịu hơn để tránh wash-out */}
      <hemisphereLight intensity={0.2} color={0xfff2e5} groundColor={0x444444} />
      <ambientLight intensity={0.1} />

      {/* Key light: phía trước-phải, ấm dịu */}
      <directionalLight
        color={0xfff0da}
        intensity={0.55}
        position={[3, 5.5, 4]}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.00015}
      />

      {/* Fill light: từ bên-trước trái, mát nhẹ, giảm để không chiếu lưng */}
      <directionalLight
        color={0xe4ecff}
        intensity={0.18}
        position={[-6, 3, 2]}
        castShadow
        shadow-bias={-0.0001}
      />

      {/* Rim light: rất nhẹ từ trên, hơi lệch, không quá sau lưng */}
      <spotLight
        color={0xf0f6ff}
        intensity={0.12}
        position={[0.2, 8.2, -0.5]}
        angle={0.25}
        penumbra={0.5}
        decay={2}
        castShadow
      />

      {/* Environment studio + Lightformers → ánh sáng mềm, không gắt từ sau */}
      <Environment preset="apartment" resolution={256}>
        <Lightformer
          form="rect"
          intensity={0.5}
          color="#f2f5fa"
          scale={[6, 3, 1]}
          position={[0, 6, 2]}
          rotation={[0.12, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={0.45}
          color="#f2f5fa"
          scale={[5, 2.5, 1]}
          position={[0, 3.3, 7]}
          rotation={[0.1, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={0.18}
          color="#f2f5fa"
          scale={[2.2, 3, 1]}
          position={[6, 3, 1]}
          rotation={[0, -Math.PI / 2.2, 0]}
        />
        <Lightformer
          form="rect"
          intensity={0.18}
          color="#f2f5fa"
          scale={[2.2, 3, 1]}
          position={[-6, 3, 1]}
          rotation={[0, Math.PI / 2.2, 0]}
        />
      </Environment>

      {/* Bóng tiếp xúc mềm dưới chân để model “dính” với nền */}
      <ContactShadows
        opacity={0.35}
        scale={12}
        blur={2.6}
        far={8}
        resolution={1024}
        color="#000000"
      />
    </>
  )
}

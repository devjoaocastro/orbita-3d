import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import {
  Environment,
  Float,
  Lightformer,
  Line,
  MeshDistortMaterial,
  RoundedBox,
  Sparkles,
  Trail,
  useCursor,
  useScroll,
} from '@react-three/drei'
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing'
import { easing, inSphere } from '../lib/easing'
import { PAGES, setScrollEl } from '../scrollBus'

/* ------------------------------------------------------------------ */
/* Section wrapper — fades/scales/rotates its content as it enters     */
/* and leaves the viewport while we scroll through the 3D world.       */
/* ------------------------------------------------------------------ */

function Section({ index, z = 0, children }: { index: number; z?: number; children: ReactNode }) {
  const inner = useRef<THREE.Group>(null!)
  const scroll = useScroll()
  const vh = useThree((s) => s.viewport.height)

  useFrame((_, delta) => {
    const progress = scroll.offset * (PAGES - 1) - index // 0 when section centered
    const visibility = Math.max(0, 1 - Math.abs(progress)) // 1 visible → 0 offscreen
    easing.damp3(inner.current.scale, 0.75 + visibility * 0.25, 0.2, delta)
    inner.current.rotation.y = progress * 0.3
    inner.current.position.z = z - (1 - visibility) * 1.8
  })

  return (
    <group position={[0, -index * vh, 0]}>
      <group ref={inner}>{children}</group>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Hero — liquid blob that reacts to hover + orbiting wireframe rings  */
/* ------------------------------------------------------------------ */

function HeroBlob() {
  const mesh = useRef<THREE.Mesh>(null!)
  const mat = useRef<any>(null)
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)

  useFrame((_, delta) => {
    mesh.current.rotation.y += delta * 0.25
    if (mat.current) {
      easing.damp(mat.current, 'distort', hovered ? 0.62 : 0.38, 0.2, delta)
      easing.dampC(mat.current.color, hovered ? '#22d3ee' : '#8b5cf6', 0.25, delta)
      easing.damp(mat.current, 'emissiveIntensity', hovered ? 0.8 : 0.35, 0.2, delta)
    }
  })

  return (
    <mesh
      ref={mesh}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[1.7, 64, 64]} />
      <MeshDistortMaterial
        ref={mat}
        color="#8b5cf6"
        emissive="#3b0a64"
        emissiveIntensity={0.35}
        distort={0.38}
        speed={2.2}
        roughness={0.15}
        metalness={0.85}
      />
    </mesh>
  )
}

function HeroRings() {
  const a = useRef<THREE.Mesh>(null!)
  const b = useRef<THREE.Mesh>(null!)
  const scroll = useScroll()

  useFrame((state) => {
    const t = state.clock.elapsedTime
    a.current.rotation.x = t * 0.18 + scroll.offset * 4
    a.current.rotation.y = t * 0.12
    b.current.rotation.x = -t * 0.14 - scroll.offset * 3
    b.current.rotation.z = t * 0.1
  })

  return (
    <group>
      <mesh ref={a} scale={2.6}>
        <torusGeometry args={[1.1, 0.012, 8, 96]} />
        <meshBasicMaterial color="#22d3ee" wireframe transparent opacity={0.5} />
      </mesh>
      <mesh ref={b} scale={3.2}>
        <torusGeometry args={[1.1, 0.008, 8, 96]} />
        <meshBasicMaterial color="#8b5cf6" wireframe transparent opacity={0.4} />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Manifesto — gyroscope of nested rings, spins faster on hover        */
/* ------------------------------------------------------------------ */

function Gyroscope() {
  const r1 = useRef<THREE.Mesh>(null!)
  const r2 = useRef<THREE.Mesh>(null!)
  const r3 = useRef<THREE.Mesh>(null!)
  const core = useRef<THREE.Mesh>(null!)
  const speed = useRef({ v: 1 })
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)

  useFrame((_, delta) => {
    easing.damp(speed.current, 'v', hovered ? 3.4 : 1, 0.25, delta)
    const k = speed.current.v
    r1.current.rotation.x += delta * 0.5 * k
    r1.current.rotation.y += delta * 0.2 * k
    r2.current.rotation.y += delta * 0.7 * k
    r2.current.rotation.z += delta * 0.3 * k
    r3.current.rotation.x -= delta * 0.4 * k
    r3.current.rotation.z -= delta * 0.6 * k
    core.current.rotation.y += delta * 0.8 * k
  })

  return (
    <group
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={() => setHovered(false)}
    >
      <mesh ref={r1}>
        <torusGeometry args={[1.7, 0.035, 16, 96]} />
        <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.5} metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh ref={r2}>
        <torusGeometry args={[1.35, 0.035, 16, 96]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.5} metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh ref={r3}>
        <torusGeometry args={[1.0, 0.035, 16, 96]} />
        <meshStandardMaterial color="#f472b6" emissive="#f472b6" emissiveIntensity={0.5} metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh ref={core}>
        <icosahedronGeometry args={[0.45, 1]} />
        <meshStandardMaterial color="#f5f3ff" emissive="#a78bfa" emissiveIntensity={1.6} metalness={0.6} roughness={0.1} flatShading />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Services — floating primitives that grow and spin on hover          */
/* ------------------------------------------------------------------ */

function ServiceShape({
  position,
  color,
  children,
}: {
  position: [number, number, number]
  color: string
  children: ReactNode
}) {
  const mesh = useRef<THREE.Mesh>(null!)
  const mat = useRef<THREE.MeshStandardMaterial>(null!)
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)

  useFrame((_, delta) => {
    mesh.current.rotation.x += delta * (hovered ? 1.6 : 0.35)
    mesh.current.rotation.y += delta * (hovered ? 2.2 : 0.5)
    easing.damp3(mesh.current.scale, hovered ? 1.3 : 1, 0.18, delta)
    easing.damp(mat.current, 'emissiveIntensity', hovered ? 1.0 : 0.3, 0.2, delta)
  })

  return (
    <Float speed={1.6} rotationIntensity={0.3} floatIntensity={0.6}>
      <mesh
        ref={mesh}
        position={position}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
        }}
        onPointerOut={() => setHovered(false)}
      >
        {children}
        <meshStandardMaterial ref={mat} color={color} emissive={color} emissiveIntensity={0.3} metalness={0.7} roughness={0.2} />
      </mesh>
    </Float>
  )
}

/* ------------------------------------------------------------------ */
/* Work — 3D cards with curated imagery, lifting and tilting towards   */
/* the cursor on hover. Texture loads imperatively so an offline       */
/* failure degrades to the colored card instead of crashing the scene. */
/* ------------------------------------------------------------------ */

function useSafeTexture(url: string) {
  const [tex, setTex] = useState<THREE.Texture | null>(null)

  useEffect(() => {
    let alive = true
    const loader = new THREE.TextureLoader()
    loader.setCrossOrigin('anonymous')
    loader.load(
      url,
      (t) => {
        if (!alive) return
        t.colorSpace = THREE.SRGBColorSpace
        setTex(t)
      },
      undefined,
      () => {}, // network failure → keep colored fallback
    )
    return () => {
      alive = false
    }
  }, [url])

  return tex
}

function WorkCard({
  position,
  rotation,
  color,
  image,
}: {
  position: [number, number, number]
  rotation: [number, number, number]
  color: string
  image: string
}) {
  const group = useRef<THREE.Group>(null!)
  const mat = useRef<THREE.MeshStandardMaterial>(null!)
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)
  const texture = useSafeTexture(image)

  useFrame((state, delta) => {
    const target: [number, number, number] = hovered
      ? [-state.pointer.y * 0.45, state.pointer.x * 0.45, 0]
      : rotation
    easing.dampE(group.current.rotation, target, 0.2, delta)
    easing.damp3(
      group.current.position,
      hovered ? [position[0], position[1] + 0.15, position[2] + 0.7] : position,
      0.2,
      delta,
    )
    easing.damp(mat.current, 'emissiveIntensity', hovered ? 0.7 : 0.18, 0.2, delta)
  })

  return (
    <group
      ref={group}
      position={position}
      rotation={rotation}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={() => setHovered(false)}
    >
      <RoundedBox args={[2.2, 3, 0.12]} radius={0.08} smoothness={4}>
        <meshStandardMaterial ref={mat} color={color} emissive={color} emissiveIntensity={0.18} metalness={0.6} roughness={0.25} />
      </RoundedBox>
      {texture && (
        <mesh position={[0, 0, 0.08]}>
          <planeGeometry args={[2.0, 2.8]} />
          <meshBasicMaterial map={texture} />
        </mesh>
      )}
      {/* glowing accent dot, like a logo mark */}
      <mesh position={[-0.75, 1.15, 0.13]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Studio — particle galaxy with glowing core                          */
/* ------------------------------------------------------------------ */

function Galaxy({ count = 2400 }: { count?: number }) {
  const points = useRef<THREE.Points>(null!)
  const positions = useMemo(() => inSphere(new Float32Array(count * 3), 3.4), [count])

  useFrame((_, delta) => {
    points.current.rotation.y += delta * 0.06
    points.current.rotation.x += delta * 0.02
  })

  return (
    <group>
      <points ref={points}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.022} color="#7dd3fc" sizeAttenuation transparent opacity={0.85} depthWrite={false} />
      </points>
      <mesh>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color="#e0f2fe" emissive="#22d3ee" emissiveIntensity={2.2} />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Contact — metal torus knot, click to give it a spin impulse         */
/* ------------------------------------------------------------------ */

function ContactKnot() {
  const mesh = useRef<THREE.Mesh>(null!)
  const mat = useRef<THREE.MeshStandardMaterial>(null!)
  const impulse = useRef(0)
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)

  useFrame((_, delta) => {
    impulse.current = THREE.MathUtils.damp(impulse.current, 0, 1.5, delta)
    mesh.current.rotation.y += delta * (0.3 + impulse.current)
    mesh.current.rotation.x += delta * 0.1
    easing.damp(mat.current, 'emissiveIntensity', hovered ? 0.9 : 0.25, 0.2, delta)
  })

  return (
    <mesh
      ref={mesh}
      position={[0, -0.3, -1.5]}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={() => setHovered(false)}
      onClick={() => (impulse.current += 6)}
    >
      <torusKnotGeometry args={[1.3, 0.38, 256, 48]} />
      <meshStandardMaterial ref={mat} color="#c4b5fd" emissive="#8b5cf6" emissiveIntensity={0.25} metalness={1} roughness={0.18} />
    </mesh>
  )
}

/* ------------------------------------------------------------------ */
/* ScrollLine — a tube of light that DRAWS ITSELF along a path snaking */
/* through every section as you scroll. Custom shader: white-hot       */
/* drawing tip, energy pulse running down the line, dim persistent     */
/* memory of where you've been, faint dashed hint of what's ahead.     */
/* ------------------------------------------------------------------ */

function ScrollLine() {
  const scroll = useScroll()
  const vh = useThree((s) => s.viewport.height)
  const vw = useThree((s) => s.viewport.width)
  const head = useRef<THREE.Mesh>(null!)
  const aura = useRef<THREE.Group>(null!)

  const curve = useMemo(() => {
    const pts: THREE.Vector3[] = []
    for (let i = 0; i < PAGES; i++) {
      const side = i % 2 === 0 ? 1 : -1
      pts.push(new THREE.Vector3(side * vw * 0.3, -i * vh + vh * 0.2, -1.4))
      pts.push(new THREE.Vector3(-side * vw * 0.16, -i * vh - vh * 0.34, -0.9))
    }
    return new THREE.CatmullRomCurve3(pts)
  }, [vh, vw])

  const pathPoints = useMemo(() => curve.getPoints(260), [curve])

  const tube = useMemo(() => new THREE.TubeGeometry(curve, 480, 0.022, 8, false), [curve])
  useEffect(() => () => tube.dispose(), [tube])

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uProgress: { value: 0 },
          uTime: { value: 0 },
        },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uProgress;
          uniform float uTime;
          varying vec2 vUv;
          void main() {
            float t = vUv.x;
            if (t > uProgress + 0.001) discard;
            vec3 violet = vec3(0.545, 0.361, 0.965);
            vec3 hot = vec3(1.0, 0.96, 0.9);
            // white-hot right at the drawing tip
            float headGlow = smoothstep(uProgress - 0.05, uProgress, t);
            // the line behind the tip slowly dims into a memory
            float tail = smoothstep(uProgress - 0.4, uProgress - 0.08, t);
            // energy pulse racing down the drawn line
            float pulse = 0.5 + 0.5 * sin(t * 140.0 - uTime * 7.0);
            vec3 col = mix(violet, hot, headGlow);
            col += violet * pulse * 0.3 * tail;
            float alpha = mix(0.07, 1.0, tail);
            gl_FragColor = vec4(col * (1.0 + headGlow * 2.5), alpha);
          }
        `,
      }),
    [],
  )

  useFrame((state) => {
    const o = THREE.MathUtils.clamp(scroll.offset, 0.001, 1)
    material.uniforms.uProgress.value = o
    material.uniforms.uTime.value = state.clock.elapsedTime
    const p = curve.getPoint(o)
    head.current.position.copy(p)
    aura.current.position.copy(p)
    // tip breathes
    const s = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.18
    head.current.scale.setScalar(s)
  })

  return (
    <group>
      {/* faint dashed hint of the journey ahead */}
      <Line points={pathPoints} color="#8b5cf6" transparent opacity={0.12} lineWidth={1} dashed dashSize={0.08} gapSize={0.14} />
      {/* the self-drawing tube of light */}
      <mesh geometry={tube} material={material} />
      {/* white-hot tip + streak when scrolling fast */}
      <Trail width={3} length={9} color="#ffffff" attenuation={(w) => w * w}>
        <mesh ref={head}>
          <sphereGeometry args={[0.075, 16, 16]} />
          <meshBasicMaterial color="#fff7ed" toneMapped={false} />
        </mesh>
      </Trail>
      {/* aura around the tip: sparks + light */}
      <group ref={aura}>
        <pointLight intensity={14} distance={8} color="#c4b5fd" />
        <Sparkles count={24} scale={1.5} size={3} speed={0.6} color="#e9d5ff" opacity={0.9} />
      </group>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Experience root — camera rig + sections + lights + post FX          */
/* ------------------------------------------------------------------ */

export default function Experience() {
  const scroll = useScroll()
  const vh = useThree((s) => s.viewport.height)
  const vw = useThree((s) => s.viewport.width)
  const lightRig = useRef<THREE.Group>(null!)

  useEffect(() => {
    setScrollEl(scroll.el)
  }, [scroll.el])

  useFrame((state, delta) => {
    const o = scroll.offset
    const y = -o * vh * (PAGES - 1)
    // travel down the world + mouse parallax
    easing.damp3(state.camera.position, [state.pointer.x * 0.7, y - state.pointer.y * 0.35, 10], 0.28, delta)
    state.camera.lookAt(0, y, 0)
    if (lightRig.current) lightRig.current.position.y = y
    // feed the DOM progress bar
    document.documentElement.style.setProperty('--scroll', o.toFixed(4))
  })

  const x = (f: number) => vw * f

  return (
    <>
      <ambientLight intensity={0.3} />
      <group ref={lightRig}>
        <pointLight position={[6, 2, 6]} intensity={60} color="#8b5cf6" />
        <pointLight position={[-6, -2, 4]} intensity={45} color="#22d3ee" />
      </group>

      {/* studio-style reflections without any network fetch */}
      <Environment resolution={64}>
        <group rotation={[-Math.PI / 3, 0, 0]}>
          <Lightformer intensity={4} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={[10, 10, 1]} />
          <Lightformer color="#8b5cf6" intensity={2} position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[20, 1, 1]} />
          <Lightformer color="#22d3ee" intensity={2} position={[10, 1, 0]} rotation-y={-Math.PI / 2} scale={[20, 1, 1]} />
        </group>
      </Environment>

      {/* ambient dust across the whole scroll length */}
      <Sparkles
        count={260}
        scale={[vw * 1.6, vh * PAGES, 10]}
        position={[0, (-vh * (PAGES - 1)) / 2, -2]}
        size={1.6}
        speed={0.25}
        color="#a78bfa"
        opacity={0.5}
      />

      {/* self-drawing line of light that follows the scroll */}
      <ScrollLine />

      {/* 0 — Hero */}
      <Section index={0}>
        <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.9}>
          <HeroBlob />
        </Float>
        <HeroRings />
        <Sparkles count={90} scale={[8, 5, 6]} size={2.4} speed={0.35} color="#22d3ee" opacity={0.7} />
      </Section>

      {/* 1 — Manifesto */}
      <Section index={1}>
        <group position={[x(0.2), 0, 0]}>
          <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.4}>
            <Gyroscope />
          </Float>
        </group>
      </Section>

      {/* 2 — Serviços */}
      <Section index={2}>
        <group position={[x(0.2), 0, 0]}>
          <ServiceShape position={[-1.5, 1.3, 0]} color="#22d3ee">
            <icosahedronGeometry args={[0.75, 0]} />
          </ServiceShape>
          <ServiceShape position={[1.5, 1.3, 0]} color="#8b5cf6">
            <torusKnotGeometry args={[0.45, 0.16, 128, 32]} />
          </ServiceShape>
          <ServiceShape position={[-1.5, -1.3, 0]} color="#f472b6">
            <octahedronGeometry args={[0.8, 0]} />
          </ServiceShape>
          <ServiceShape position={[1.5, -1.3, 0]} color="#facc15">
            <torusGeometry args={[0.55, 0.2, 32, 64]} />
          </ServiceShape>
        </group>
      </Section>

      {/* 3 — Work */}
      <Section index={3} z={0.5}>
        <WorkCard
          position={[-x(0.18), -0.3, 0]}
          rotation={[0, 0.35, -0.04]}
          color="#312e81"
          image="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=900&q=80"
        />
        <WorkCard
          position={[0, -0.1, 0.4]}
          rotation={[0, 0, 0.03]}
          color="#0e7490"
          image="https://images.unsplash.com/photo-1620121692029-d088224ddc74?auto=format&fit=crop&w=900&q=80"
        />
        <WorkCard
          position={[x(0.18), -0.3, 0]}
          rotation={[0, -0.35, 0.04]}
          color="#9d174d"
          image="https://images.unsplash.com/photo-1614850715649-1d0106293bd1?auto=format&fit=crop&w=900&q=80"
        />
      </Section>

      {/* 4 — Estúdio */}
      <Section index={4}>
        <Galaxy />
      </Section>

      {/* 5 — Contacto */}
      <Section index={5}>
        <Float speed={1.2} rotationIntensity={0.5} floatIntensity={0.7}>
          <ContactKnot />
        </Float>
        <Sparkles count={120} scale={[9, 6, 6]} size={2} speed={0.3} color="#f472b6" opacity={0.6} />
      </Section>

      <EffectComposer>
        <Bloom intensity={0.55} luminanceThreshold={0.25} luminanceSmoothing={0.7} mipmapBlur />
        <Noise opacity={0.05} />
        <Vignette offset={0.15} darkness={0.85} />
      </EffectComposer>
    </>
  )
}

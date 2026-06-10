import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { ScrollControls, Scroll } from '@react-three/drei'
import Experience from './components/Experience'
import Interface from './components/Interface'
import Cursor from './components/Cursor'
import { PAGES, scrollToPage } from './scrollBus'

const NAV = ['Manifesto', 'Services', 'Work', 'Studio', 'Contact']

export default function App() {
  return (
    <>
      <header className="header">
        <button className="logo" onClick={() => scrollToPage(0)}>
          ÓRBITA<span className="logo__reg">®</span>
        </button>
        <nav className="nav">
          {NAV.map((label, i) => (
            <button key={label} onClick={() => scrollToPage(i + 1)}>
              {label}
            </button>
          ))}
        </nav>
      </header>

      <div className="progress" aria-hidden="true">
        <div className="progress__bar" />
      </div>

      <Cursor />

      <Canvas camera={{ position: [0, 0, 10], fov: 42 }} dpr={[1, 2]}>
        <color attach="background" args={['#050509']} />
        <fog attach="fog" args={['#050509', 16, 36]} />
        <Suspense fallback={null}>
          <ScrollControls pages={PAGES} damping={0.18}>
            <Experience />
            <Scroll html style={{ width: '100%' }}>
              <Interface />
            </Scroll>
          </ScrollControls>
        </Suspense>
      </Canvas>
    </>
  )
}

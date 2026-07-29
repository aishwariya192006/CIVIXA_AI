import { useCallback } from 'react'
import { Particles, ParticlesProvider } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import type { Engine } from '@tsparticles/engine'

const PARTICLE_OPTIONS = {
  background: { color: { value: 'transparent' } },
  fpsLimit: 60,
  interactivity: {
    events: {
      onHover: { enable: true, mode: 'grab' },
      onClick: { enable: true, mode: 'push' }
    },
    modes: {
      grab: { distance: 140, links: { opacity: 0.3 } },
      push: { quantity: 3 }
    }
  },
  particles: {
    color: { value: ['#00D4FF', '#FF8C32', '#00C853', '#FFC857'] },
    links: { color: '#00D4FF', distance: 120, enable: true, opacity: 0.12, width: 1 },
    move: {
      direction: 'none' as const,
      enable: true,
      outModes: { default: 'bounce' as const },
      random: true,
      speed: 0.8,
      straight: false
    },
    number: { value: 80 },
    opacity: {
      value: { min: 0.05, max: 0.15 },
      animation: { enable: true, speed: 1 }
    },
    shape: { type: 'circle' },
    size: { value: { min: 1, max: 3 } }
  },
  detectRetina: true
}

function ParticlesInner() {
  return (
    <Particles
      id="tsparticles"
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}
      options={PARTICLE_OPTIONS}
    />
  )
}

export default function ParticleBackground() {
  const initEngine = useCallback(async (engine: Engine) => {
    await loadSlim(engine)
  }, [])

  return (
    <ParticlesProvider init={initEngine}>
      <ParticlesInner />
    </ParticlesProvider>
  )
}

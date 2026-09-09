/**
 * Wind map widget (WEATHER featured): the reference's signature — an animated
 * wind-particle field over a deep navy pressure field, with the kt color
 * legend and a mini forecast timeline (play control, amber time badge, day
 * ticks). Replaces the WORLD VIEW globe slot.
 *
 * Particles drift along a synthetic flow field (angle from layered sine
 * fields, seeded per particle), leaving pale cyan-white streamlines that fade
 * via a destination-out trail pass — the same visual language as the
 * reference's wind layer. The kt scale uses the measured legend stops; the
 * timeline echoes the reference's bottom strip (white circular play button
 * with the red triangle, amber HH:MM badge, 1px day rules, blinking playhead).
 */
import { useEffect, useRef, useState } from 'react'
import type { RightWidgetHooks } from '../../widgets/types.ts'
import css from './WindMapWidget.module.css'

/** The measured kt legend gradient stops (left → right). */
const LEGEND_STOPS = ['#6271b8', '#4a93a0', '#4ca24f', '#8f903d', '#a28245', '#8f4165', '#5e6aa0'] as const

/** Legend tick labels (kt). */
const LEGEND_TICKS = ['0', '5', '10', '20', '30', '40', '60'] as const

/** Timeline day ticks (short labels above 1px rules). */
const DAY_TICKS = ['WED', 'THU', 'FRI', 'SAT', 'SUN'] as const

/** One wind particle: seeded position + age. */
interface Particle {
  x: number
  y: number
  age: number
  maxAge: number
}

/** Particle count (kept modest — the widget is ~300px tall). */
const PARTICLE_COUNT = 150

/** Deterministic PRNG so the field is stable across boots (LCG). */
function seeded(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 0x100000000
  }
}

/** The flow-field angle at (nx, ny in 0..1) and time t (ms): layered sines drift slowly east. */
function flowAngle(nx: number, ny: number, t: number): number {
  const a =
    Math.sin(nx * 4.1 + t * 0.00012) * 0.9 +
    Math.cos(ny * 3.3 - t * 0.00009) * 0.7 +
    Math.sin((nx + ny) * 2.2 + t * 0.00007) * 0.5
  return a * 1.1
}

/** The animated wind-field canvas: particles + fading trails. */
function WindField(): React.ReactElement {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const host = hostRef.current
    const canvas = canvasRef.current
    if (host === null || canvas === null) return
    const ctx = canvas.getContext('2d')
    if (ctx === null) return

    let width = 0
    let height = 0
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const resize = (): void => {
      const rect = host.getBoundingClientRect()
      width = Math.max(60, Math.floor(rect.width))
      height = Math.max(60, Math.floor(rect.height))
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(host)

    const random = seeded(20260909)
    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: random(),
      y: random(),
      age: random() * 90,
      maxAge: 90 + random() * 80,
    }))

    let raf = 0
    let disposed = false
    const step = (t: number): void => {
      if (disposed) return
      // Fade previous trails toward transparent (the CSS pressure field shows through).
      ctx.globalCompositeOperation = 'destination-out'
      ctx.fillStyle = 'rgba(0, 0, 0, 0.055)'
      ctx.fillRect(0, 0, width, height)
      ctx.globalCompositeOperation = 'source-over'
      ctx.lineWidth = 1
      ctx.strokeStyle = 'rgba(214, 238, 246, 0.5)'
      for (const particle of particles) {
        const angle = flowAngle(particle.x, particle.y, t)
        const speed = 0.0022 + 0.0016 * Math.sin(particle.x * 7.3 + particle.y * 5.1)
        const nx = particle.x + Math.cos(angle) * speed
        const ny = particle.y + Math.sin(angle) * speed * 0.7
        ctx.beginPath()
        ctx.moveTo(particle.x * width, particle.y * height)
        ctx.lineTo(nx * width, ny * height)
        ctx.stroke()
        particle.x = nx
        particle.y = ny
        particle.age += 1
        if (particle.age > particle.maxAge || particle.x < 0 || particle.x > 1 || particle.y < 0 || particle.y > 1) {
          particle.x = random()
          particle.y = random()
          particle.age = 0
          particle.maxAge = 90 + random() * 80
        }
      }
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return (
    <div ref={hostRef} className={css.field} data-testid="edex-wind-map">
      <canvas ref={canvasRef} className={css.canvas} aria-hidden="true" />
    </div>
  )
}

/** HH:MM from a Date (the amber badge). */
function badgeTime(date: Date): string {
  const pad = (value: number): string => String(value).padStart(2, '0')
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** Wind map widget: particle field + legend + mini forecast timeline. */
export function WindMapWidget({ useNetwork }: RightWidgetHooks) {
  const network = useNetwork(s => s)
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => { clearInterval(timer) }
  }, [])

  return (
    <div className={css.pane}>
      <WindField />
      <div className={css.live}>
        <span className={css.liveKey}>LINK</span>
        <span className={css.liveValue}>{network.ok ? network.network.state.toUpperCase() : '—'}</span>
        <span className={css.liveKey}>PING</span>
        <span className={css.liveValue}>{network.network.pingMs === null ? '—' : `${network.network.pingMs.toFixed(0)}MS`}</span>
      </div>
      <div className={css.legend}>
        <div className={css.legendBar} style={{ background: `linear-gradient(to right, ${LEGEND_STOPS.join(', ')})` }} />
        <div className={css.legendTicks}>
          {LEGEND_TICKS.map(tick => <span key={tick}>{tick}</span>)}
          <span className={css.legendUnit}>KT</span>
        </div>
      </div>
      <div className={css.timeline}>
        <span className={css.playBtn} aria-hidden="true"><span className={css.playTri} /></span>
        <span className={css.badge}>{badgeTime(now)}</span>
        <div className={css.days}>
          {DAY_TICKS.map((day, index) => (
            <span key={day} className={index === 1 ? css.dayActive : css.day}>{day}</span>
          ))}
          <span className={css.playhead} aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}

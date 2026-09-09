/**
 * Wind profile widget (WEATHER): the reference's kt color-scale legend over a
 * live throughput trace — the scale bar uses the measured legend stops
 * (blue → cyan → green → olive → amber → magenta → violet), the download
 * trace rides the map cyan and the upload trace the amber, over the light
 * grid. Header rates stay real (up/down MB/s).
 */
import { useEffect, useRef, useState } from 'react'
import type { RightWidgetHooks } from '../../widgets/types.ts'
import css from './TrafficWidget.module.css'

/** The measured kt legend gradient stops (left → right). */
const LEGEND_STOPS = ['#6271b8', '#4a93a0', '#4ca24f', '#8f903d', '#a28245', '#8f4165', '#5e6aa0'] as const

/** Legend tick labels (kt). */
const LEGEND_TICKS = ['0', '5', '10', '20', '30', '40', '60'] as const

/** Dual live trace with a light grid overlay. The height is dynamic: the
 *  section flex-fills the bar's leftover space, and a ResizeObserver sizes
 *  the SVG viewBox to match the box 1:1, so strokes render cleanly at any
 *  size. */
function TrafficChart({ up, down }: { up: readonly number[]; down: readonly number[] }) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const [size, setSize] = useState({ w: 316, h: 160 })

  useEffect(() => {
    const host = hostRef.current
    if (host === null) return
    const measure = (): void => {
      const rect = host.getBoundingClientRect()
      setSize({ w: Math.max(80, Math.floor(rect.width)), h: Math.max(48, Math.floor(rect.height)) })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(host)
    return () => { ro.disconnect() }
  }, [])

  const { w, h } = size
  const PAD = 2  // viewBox padding so lines at the extremes never clip (stroke extends ±0.75px)
  const toPoints = (series: readonly number[]): string => {
    const max = Math.max(1, ...series)
    return series
      .map((value, index) => {
        const x = series.length <= 1 ? 0 : (index / (series.length - 1)) * w
        const y = PAD + (1 - value / max) * (h - 2 * PAD)
        return `${x.toFixed(1)},${y.toFixed(1)}`
      })
      .join(' ')
  }
  // Light grid: 4 horizontal bands × 8 vertical columns (1:1 viewBox = 1px strokes).
  const horizontalLines = [0.25, 0.5, 0.75].map(f => PAD + f * (h - 2 * PAD))
  const verticalLines = Array.from({ length: 7 }, (_, i) => (w / 8) * (i + 1))
  return (
    <div ref={hostRef} className={css.trafficChart}>
      <svg
        className={css.traffic}
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <g stroke="currentColor" strokeOpacity="0.18" strokeWidth="1">
          {horizontalLines.map(y => <line key={`h${y}`} x1="0" y1={y} x2={w} y2={y} />)}
          {verticalLines.map(x => <line key={`v${x}`} x1={x} y1="0" x2={x} y2={h} />)}
        </g>
        <polyline className={css.trafficDown} points={toPoints(down)} fill="none" strokeWidth="1.5" opacity="0.9" />
        <polyline className={css.trafficUp} points={toPoints(up)} fill="none" strokeWidth="1.5" opacity="0.9" />
      </svg>
    </div>
  )
}

/** Wind profile widget: live rates + kt scale + dual trace. */
export function TrafficWidget({ useNetwork }: RightWidgetHooks) {
  const network = useNetwork(s => s)
  return (
    <>
      <div className={css.trafficHeader}>
        <span><span className={css.key}>GUSTS</span> {network.upMbs.toFixed(2)} MB/s</span>
        <span><span className={css.key}>MEAN</span> {network.downMbs.toFixed(2)} MB/s</span>
      </div>
      <div className={css.legend}>
        <div className={css.legendBar} style={{ background: `linear-gradient(to right, ${LEGEND_STOPS.join(', ')})` }} />
        <div className={css.legendTicks}>
          {LEGEND_TICKS.map(tick => <span key={tick}>{tick}</span>)}
          <span className={css.legendUnit}>KT</span>
        </div>
      </div>
      <TrafficChart up={network.upHistory} down={network.downHistory} />
    </>
  )
}

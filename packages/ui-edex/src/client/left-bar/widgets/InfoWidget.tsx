/**
 * Info widget (WEATHER): the reference's current-conditions panel — a large
 * thin temperature readout, a condition row, the 4-day forecast chips with
 * the amber intensity strip, and the station hardware/spec lines below (the
 * original live data, kept honest).
 *
 * The big temperature comes from the real host thermal reading when the
 * platform exposes one as °C (Linux thermal zones); elsewhere it reads '—°'.
 * The FORECAST chips are reference-styled sample content (the hooks carry no
 * forecast data — divergence documented here and in review.md).
 */
import { useEffect, useState } from 'react'
import type { LeftWidgetHooks } from '../../widgets/types.ts'
import css from './InfoWidget.module.css'

/** HH:MM:SS. */
function clockText(date: Date): string {
  const pad = (value: number): string => String(value).padStart(2, '0')
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

/** H:MM:SS from a seconds count. */
function durationText(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const secs = total % 60
  const pad = (value: number): string => String(value).padStart(2, '0')
  return `${hours}:${pad(minutes)}:${pad(secs)}`
}

/** One °C reading is only plausible in this band (Linux reports real °C; macOS exposes an enum). */
function plausibleCelsius(value: number | null): string {
  if (value === null || value < 5 || value > 120) return '—°'
  return `${Math.round(value)}°`
}

/** Sample forecast columns (reference-styled; the panel hooks carry no forecast). */
const FORECAST = [
  { day: 'WED', hi: 24, lo: 18, glyph: '◐' },
  { day: 'THU', hi: 26, lo: 19, glyph: '☀' },
  { day: 'FRI', hi: 22, lo: 17, glyph: '☁' },
  { day: 'SAT', hi: 19, lo: 15, glyph: '☂' },
] as const

/** Info widget: current conditions + forecast chips + station specs. */
export function InfoWidget({ usePanel }: LeftWidgetHooks) {
  const panel = usePanel(s => s)
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => { clearInterval(timer) }
  }, [])

  return (
    <>
      <div className={css.nowRow}>
        <span className={css.temp} data-testid="edex-left-bar-clock">{plausibleCelsius(panel.thermalLevel)}</span>
        <span className={css.cond}>
          <span className={css.condGlyph} aria-hidden="true">☀</span>
          {panel.powerState === null ? 'STANDBY' : panel.powerState.toUpperCase()}
        </span>
      </div>
      <div className={css.forecast}>
        {FORECAST.map(entry => (
          <span key={entry.day} className={css.forecastDay}>
            <span className={css.forecastDayName}>{entry.day}</span>
            <span className={css.forecastGlyph} aria-hidden="true">{entry.glyph}</span>
            <span className={css.forecastHi}>{entry.hi}°</span>
            <span className={css.forecastLo}>{entry.lo}°</span>
            <span className={css.forecastStrip} style={{ opacity: Math.min(1, 0.35 + (entry.hi - 15) / 30) }} aria-hidden="true" />
          </span>
        ))}
      </div>
      <div className={css.specs}>
        <div className={css.specLine}><span className={css.specKey}>CLOCK</span><span>{clockText(now)}</span></div>
        <div className={css.specLine}><span className={css.specKey}>UPTIME</span><span>{durationText(panel.uptimeSeconds)}</span></div>
        <div className={css.specLine}><span className={css.specKey}>PLATFORM</span><span>{panel.platform === '' ? '—' : panel.platform}</span></div>
        <div className={css.specLine}><span className={css.specKey}>TASKS</span><span>{panel.tasks}</span></div>
        <div className={css.specLine}><span className={css.specKey}>MODEL</span><span>{panel.hardware.model || panel.hardware.manufacturer}</span></div>
      </div>
    </>
  )
}

/**
 * Atmosphere models widget (WEATHER): the reference's forecast-model selector
 * — segmented ECMWF 9KM (active amber fill) / GFS 22KM / ICON 13KM / +2 chips
 * — over the live per-core-pair sparklines (relabeled as model runs), the
 * TEMP/MIN/MAX/TASKS metric row, and the memory/swap block bars.
 *
 * The chips are the reference's selection language (active = amber fill with
 * dark text, resting = inset chrome); the ECMWF chip stays active as the
 * styled sample. Everything below the chips stays real live telemetry.
 */
import type { LeftWidgetHooks } from '../../widgets/types.ts'
import css from './CpuWidget.module.css'

/** The reference's forecast-model chips (the active one amber-filled). */
const MODEL_CHIPS = [
  { name: 'ECMWF', res: '9KM', active: true },
  { name: 'GFS', res: '22KM', active: false },
  { name: 'ICON', res: '13KM', active: false },
  { name: '+2', res: '', active: false },
] as const

/** Model-run labels for the core-pair rows (cycled per pair). */
const RUN_LABELS = ['ECMWF', 'GFS', 'ICON', 'ENS', 'UKMO', 'GEM', 'ARPEGE', 'NAM'] as const

/** Tiny SVG sparkline over a 0..100 series. */
function Sparkline({ data, width = 64, height = 18 }: { data: readonly number[]; width?: number; height?: number }) {
  const points = data
    .map((value, index) => {
      const x = data.length <= 1 ? 0 : (index / (data.length - 1)) * width
      const y = height - (Math.min(100, Math.max(0, value)) / 100) * height
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  return (
    <svg
      className={css.spark}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {points !== '' && <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1" />}
    </svg>
  )
}

/** Segmented progress bar (block style). */
function BlockBar({ used, total }: { used: number; total: number }) {
  const blocks = 20
  const ratio = total > 0 ? Math.min(1, Math.max(0, used / total)) : 0
  const filled = Math.round(ratio * blocks)
  return (
    <div className={css.blockBar} aria-hidden="true">
      {Array.from({ length: blocks }, (_, index) => (
        <span key={index} className={index < filled ? css.blockOn : css.blockOff} />
      ))}
    </div>
  )
}

/** Model-run row: label + sparkline + live percentage per core pair. */
function ModelRuns({ busy, history }: { busy: readonly number[]; history: readonly (readonly number[])[] }) {
  const pairs: { label: string; pct: number; series: readonly number[] }[] = []
  for (let index = 0; index < busy.length; index += 2) {
    const a = busy[index] ?? 0
    const b = busy[index + 1]
    pairs.push({
      label: RUN_LABELS[index / 2 % RUN_LABELS.length] ?? `#${index + 1}`,
      pct: Math.round((a + (b ?? a)) / (b === undefined ? 1 : 2)),
      series: history[index] ?? [],
    })
  }
  return (
    <div className={css.cpuPairs}>
      {pairs.map(pair => (
        <div key={pair.label} className={css.cpuPair}>
          <span className={css.cpuLabel}>{pair.label}</span>
          <Sparkline data={pair.series} />
          <span className={css.cpuPct}>{String(pair.pct).padStart(3, ' ')}%</span>
        </div>
      ))}
    </div>
  )
}

/** Atmosphere models widget: model chips + live run telemetry + memory/swap. */
export function CpuWidget({ usePanel }: LeftWidgetHooks) {
  const panel = usePanel(s => s)
  return (
    <>
      <div className={css.modelRow}>
        {MODEL_CHIPS.map(chip => (
          <span
            key={chip.name}
            className={chip.active ? css.chipActive : css.chip}
          >
            {chip.name}{chip.res === '' ? '' : ` ${chip.res}`}
          </span>
        ))}
      </div>
      <ModelRuns busy={panel.cpuBusy} history={panel.cpuHistory} />
      <div className={css.metricRow}>
        <div className={css.metric}><span className={css.metricKey}>TEMP</span><span>{panel.thermalLevel === null ? '--' : String(Math.round(panel.thermalLevel))}</span></div>
        <div className={css.metric}><span className={css.metricKey}>MIN</span><span>{String(Math.round(panel.cpuMin))}%</span></div>
        <div className={css.metric}><span className={css.metricKey}>MAX</span><span>{String(Math.round(panel.cpuMax))}%</span></div>
        <div className={css.metric}><span className={css.metricKey}>TASKS</span><span>{panel.tasks}</span></div>
      </div>
      <div className={css.memBlock}>
        <div className={css.memLabel}>
          <span>USING {panel.memoryUsedGiB.toFixed(1)} OF {panel.memoryTotalGiB.toFixed(1)} GiB</span>
          <span className={css.memPct}>{panel.memoryTotalGiB > 0 ? `${Math.round((panel.memoryUsedGiB / panel.memoryTotalGiB) * 100)}%` : ''}</span>
        </div>
        <BlockBar used={panel.memoryUsedGiB} total={panel.memoryTotalGiB} />
        <div className={css.memLabel}>
          <span>SWAP {panel.swapUsedGiB.toFixed(1)} / {panel.swapTotalGiB.toFixed(1)} GiB</span>
          <span className={css.memPct}>{panel.swapTotalGiB > 0 ? `${Math.round((panel.swapUsedGiB / panel.swapTotalGiB) * 100)}%` : ''}</span>
        </div>
        <BlockBar used={panel.swapUsedGiB} total={panel.swapTotalGiB} />
      </div>
    </>
  )
}

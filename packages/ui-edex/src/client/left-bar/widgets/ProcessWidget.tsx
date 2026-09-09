/**
 * Station observations widget (WEATHER): the reference's city temperature
 * readouts as a station feed — the top-processes table restyled as station
 * rows (name reads as the station id, live CPU% as the highlighted value),
 * with the loadavg footer beneath.
 *
 * Data stays real (the process sample); only the presentation adopts the
 * reference's station-readout language (dim meta columns, amber values).
 */
import type { ProcessSample } from '@danielng23/dsh-host-system-metrics/types'
import type { LeftWidgetHooks } from '../../widgets/types.ts'
import css from './ProcessWidget.module.css'

/** Station rows: the live process sample styled as station readouts. */
function StationTable({ processes }: { processes: readonly ProcessSample[] }) {
  return (
    <table className={css.procTable}>
      <thead>
        <tr>
          <th>PID</th>
          <th>STATION</th>
          <th className={css.num}>CPU%</th>
          <th className={css.num}>MEM%</th>
        </tr>
      </thead>
      <tbody>
        {processes.map(proc => (
          <tr key={proc.pid}>
            <td className={css.meta}>{proc.pid}</td>
            <td className={css.procName}>{proc.name}</td>
            <td className={proc.cpuPct > 25 ? `${css.num} ${css.hot}` : css.num}>{proc.cpuPct.toFixed(1)}</td>
            <td className={css.num}>{proc.memPct.toFixed(1)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/** Station observations widget: live station rows + loadavg footer. */
export function ProcessWidget({ usePanel }: LeftWidgetHooks) {
  const processes = usePanel(s => s.processes)
  const loadavg = usePanel(s => s.loadavg)
  return (
    <>
      <div className={css.body}>
        <StationTable processes={processes} />
      </div>
      <div className={css.foot}>
        <span className={css.footText}>loadavg {loadavg.map(value => value.toFixed(2)).join(' ')}</span>
      </div>
    </>
  )
}

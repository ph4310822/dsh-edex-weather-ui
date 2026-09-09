/**
 * Map layers widget (WEATHER): the reference's layer rail — selectable
 * map-layer rows (Weather radar, Satellite, Wind, Rain/thunder, Temperature)
 * with circular layer dots and the Wind row active (amber fill, dark text).
 * The live interface/ping readout rides beneath as the link status line.
 */
import type { RightWidgetHooks } from '../../widgets/types.ts'
import css from './NetworkStatusWidget.module.css'

/** The layer rail entries (Wind active, as in the reference capture). */
const LAYERS = [
  { name: 'WEATHER RADAR', active: false },
  { name: 'SATELLITE', active: false },
  { name: 'WIND', active: true },
  { name: 'RAIN, THUNDER', active: false },
  { name: 'TEMPERATURE', active: false },
] as const

/** Layer colors for the rail dots (the map palette per layer). */
const LAYER_DOTS = ['#a71c20', '#5e6aa0', '#4a93a0', '#4ca24f', '#d49500'] as const

/** Map layers widget: selectable layer rail + live link line. */
export function NetworkStatusWidget({ useNetwork }: RightWidgetHooks) {
  const network = useNetwork(s => s)
  const up = network.ok && network.network.state.toLowerCase() === 'up'
  return (
    <>
      <div className={css.rail}>
        {LAYERS.map((layer, index) => (
          <div key={layer.name} className={layer.active ? css.layerActive : css.layer}>
            <span
              className={css.layerDot}
              style={{ background: LAYER_DOTS[index % LAYER_DOTS.length] }}
              aria-hidden="true"
            />
            <span className={css.layerName}>{layer.name}</span>
            {layer.active && <span className={css.layerOn}>ON</span>}
          </div>
        ))}
      </div>
      <div className={css.specs}>
        <div className={css.specLine}><span className={css.key}>LINK</span><span className={up ? css.linkUp : css.linkDown}>{network.network.state.toUpperCase()}</span></div>
        <div className={css.specLine}><span className={css.key}>INTERFACE</span><span>{network.network.interfaceName}</span></div>
        <div className={css.specLine}><span className={css.key}>IP</span><span>{network.network.ip ?? '—'}</span></div>
        <div className={css.specLine}><span className={css.key}>PING</span><span>{network.network.pingMs === null ? '—' : `${network.network.pingMs.toFixed(0)}ms`}</span></div>
      </div>
    </>
  )
}

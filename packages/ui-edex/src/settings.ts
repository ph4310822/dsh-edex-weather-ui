/**
 * eDEX theme-color setting: the single durable accent that drives both the
 * shell frame's palette (`--edex-*`) and the terminal token override layer
 * over the original UI (`--dsw-alias-*`). One color in, a full family out —
 * primary, dim midtone, and the pinned chrome surfaces — while the semantic
 * accents (amber warn, red error, cyan info) stay fixed.
 *
 * WEATHER (windy.com wind-map command center): the accent is the reference's
 * amber/gold selection color; the frame surfaces are the pinned measured
 * chrome (translucent dark-gray panels over a deep navy map shadow) rather
 * than accent-derived tones, so the neutral chrome never tints amber.
 * Shared by the Host loader entry (schema registration) and the browser half
 * (scope binding, token overrides, and the settings row).
 */
import z from '@deepseek-ai/schemastery'
import type { ThemeTokenOverrides } from '@deepseek-ai/dsh-client-ui-theme/client'

/** Settings namespace owned by the eDEX shell plugin. */
export const EDEX_SETTINGS_NAMESPACE = 'ui-edex'

/** Field carrying the selected theme color. */
export const THEME_COLOR_FIELD = 'themeColor'

/** The default theme color — Windy's amber/gold selection accent. */
export const DEFAULT_THEME_COLOR = '#d49500'

/**
 * The measured reference surfaces (windy.com capture, 1600×900). Pinned as
 * module-level constants instead of derived from the accent: the chrome is a
 * neutral translucent gray family over a deep navy map shadow, and deriving
 * border/panel tones from the amber accent would amber-cast the frame.
 */
export const WEATHER_SURFACES = Object.freeze({
  /** Deep map-shadow navy — the canvas behind the floating chrome panels. */
  canvas: '#000722',
  /** Translucent dark-chrome card fill (the panel tone). */
  panel: '#4d4d4e',
  /** Slightly deeper chrome used by the control cluster / title strip. */
  chromeDeep: '#4c4d4d',
  /** Inset wells (composer input, model chips resting state). */
  inset: '#3f3f41',
  /** Hairline chrome edge (1px low-contrast card border). */
  border: '#6a6a6c',
  /** Faint 1px rules (timeline day-cell separators, cluster dividers). */
  divider: '#616163',
  /** Secondary label gray (light gray text on chrome). */
  textSecondary: '#a8a8a8',
  /** Primary label white (Windy's labels are near-white on chrome). */
  textPrimary: '#f8f8f8',
})

/** Durable theme-color section shared by the Host schema and the browser scope. */
export interface EdexSettings {
  /** The accent color driving the whole eDEX palette. */
  themeColor: string
}

/** Durable theme-color schema; also the wire envelope the browser scope validates against. */
export const EdexSettingsSchema: z<EdexSettings> = z.object({
  [THEME_COLOR_FIELD]: z.string().default(DEFAULT_THEME_COLOR),
})

/** One selectable preset swatch. */
export interface ThemeColorPreset {
  /** Stable preset id (the swatch key). */
  id: string
  /** Locale key for the swatch's accessible name. */
  labelKey: string
  /** The accent color this preset applies. */
  color: string
}

/** Preset swatches offered in the Theme Color settings row. */
export const THEME_COLOR_PRESETS: readonly ThemeColorPreset[] = Object.freeze([
  { id: 'analyzed', labelKey: 'edex.preset.analyzed', color: '#d49500' },
  { id: 'terminal', labelKey: 'edex.preset.terminal', color: '#46f282' },
  { id: 'amber', labelKey: 'edex.preset.amber', color: '#e6c85c' },
  { id: 'cyan', labelKey: 'edex.preset.cyan', color: '#4a94a2' },
  { id: 'blue', labelKey: 'edex.preset.blue', color: '#536bae' },
])

/**
 * The semantic accents that stay fixed across theme colors — measured from
 * the reference: alert red (play triangle / hamburger #9d0300), the brighter
 * amber partner (#dca82f), the map cyan (#4a94a2), map green (#53a554), the
 * city-frame blue (#536bae), and the brand red (#a71c20).
 */
export const FIXED_ACCENTS = Object.freeze({
  amber: '#dca82f',
  red: '#9d0300',
  cyan: '#4a94a2',
  success: '#53a554',
  blue: '#536bae',
  brandRed: '#a71c20',
})

/** The full eDEX palette derived from one accent color. */
export interface EdexPalette {
  /** The primary accent (text, icons, fills). */
  primary: string
  /** Muted midtone (secondary text, icon tints). */
  dim: string
  /** Dark border tone. */
  border: string
  /** Faint tinted panel background. */
  panel2: string
}

/** Normalize an #rgb/#rrggbb hex to lowercase #rrggbb, or null when invalid. */
export function normalizeHex(value: string): string | null {
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value.trim())
  if (match === null) return null
  const hex = match[1] as string
  if (hex.length === 3) return `#${hex.split('').map(c => c + c).join('')}`.toLowerCase()
  return `#${hex}`.toLowerCase()
}

function clamp(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)))
}

function channel(value: number): string {
  return clamp(value).toString(16).padStart(2, '0')
}

/** #rrggbb → 0..255 channels (the caller has already normalized). */
function hexToRgb(color: string): { r: number; g: number; b: number } {
  return {
    r: Number.parseInt(color.slice(1, 3), 16),
    g: Number.parseInt(color.slice(3, 5), 16),
    b: Number.parseInt(color.slice(5, 7), 16),
  }
}

/**
 * Derive one tone from a hex color at a target lightness (0..100) with the
 * saturation scaled down toward black — the accent family desaturates as it
 * darkens, mirroring the original green's dim/border/panel tones rather than
 * keeping the accent's full saturation at every step.
 */
function tone(color: string, lightness: number, saturationScale: number): string {
  const { r, g, b } = hexToRgb(normalizeHex(color) ?? DEFAULT_THEME_COLOR)
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  let h = 0
  let s = 0
  if (max !== min) {
    const delta = max - min
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min)
    if (max === rn) h = ((gn - bn) / delta) % 6
    else if (max === gn) h = (bn - rn) / delta + 2
    else h = (rn - gn) / delta + 4
    h *= 60
    if (h < 0) h += 360
  }
  s *= saturationScale
  const target = clamp(lightness) / 100
  const q = target < 0.5 ? target * (1 + s) : target + s - target * s
  const p = 2 * target - q
  const hue = (value: number): number => {
    let t = value
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }
  return `#${channel(hue(h / 360 + 1 / 3) * 255)}${channel(hue(h / 360) * 255)}${channel(hue(h / 360 - 1 / 3) * 255)}`
}

/**
 * Derive the family from one accent color. The dim midtone stays accent-
 * derived (muted amber); the border and panel tones resolve to the PINNED
 * measured chrome surfaces — the reference's chrome is a neutral translucent
 * gray family, and accent-derived dark tones would amber-cast every frame
 * surface (the derivation stays for arbitrary custom accents).
 */
export function paletteFor(color: string): EdexPalette {
  const primary = normalizeHex(color) ?? DEFAULT_THEME_COLOR
  return {
    primary,
    dim: tone(primary, 45, 0.67),
    border: WEATHER_SURFACES.border,
    panel2: WEATHER_SURFACES.panel,
  }
}

/** The eDEX shell frame's CSS variables for one palette (semantic accents stay in the stylesheet). */
export function shellVarsFor(palette: EdexPalette): Record<string, string> {
  return {
    '--edex-green': palette.primary,
    '--edex-dim': palette.dim,
    '--edex-border': WEATHER_SURFACES.border,
    '--edex-panel-2': WEATHER_SURFACES.panel,
  }
}

/**
 * The full `--edex-*` variable set for the ORIGINAL UI (the composer, sidebar,
 * and conversation scrollbar live outside the shell frame, so the theme CSS
 * resolves these from `body` — set there by the browser half, with the static
 * accents joining the dynamic palette). The shell frame defines its own copy
 * on `.shell` and overrides it inline, so the two never fight.
 */
export function bodyVarsFor(palette: EdexPalette): Record<string, string> {
  return {
    ...shellVarsFor(palette),
    '--edex-amber': FIXED_ACCENTS.amber,
    '--edex-red': FIXED_ACCENTS.red,
    '--edex-cyan': FIXED_ACCENTS.cyan,
    '--edex-brand-red': FIXED_ACCENTS.brandRed,
    '--edex-blue': FIXED_ACCENTS.blue,
    '--edex-map-green': FIXED_ACCENTS.success,
    '--edex-divider': WEATHER_SURFACES.divider,
    '--edex-text': WEATHER_SURFACES.textPrimary,
    '--edex-chrome': WEATHER_SURFACES.panel,
  }
}

/** One override-layer token value pair; both palettes carry the same value (the terminal skin is scheme-invariant). */
function both(value: string): { light: string; dark: string } {
  return { light: value, dark: value }
}

/**
 * The token override layer that recolors the whole original UI — every label
 * token that feeds icon glyphs included — from one palette. `label-tertiary`
 * and `label-caption` are the specific tokens behind the small icons beside
 * tool names (Bash / Read / Think / …) and their separators, so overriding
 * them is what makes those glyphs theme-colored like every other icon.
 *
 * Backgrounds resolve to the measured chrome surface (#4d4d4e) — the workspace
 * must read as the same dark-chrome surface as the floating panels, not pure
 * black (the reference's panels are the chrome family over the map shadow).
 */
export function tokenOverridesFor(palette: EdexPalette): ThemeTokenOverrides {
  return {
    // Backgrounds share the chrome card surface (the workspace follows the
    // reference's dark-chrome panels, never pure black).
    '--dsw-alias-bg-base': both(WEATHER_SURFACES.panel),
    '--dsw-alias-bg-layer-1': both(WEATHER_SURFACES.panel),
    '--dsw-alias-bg-layer-2': both(WEATHER_SURFACES.panel),
    '--dsw-alias-bg-overlay': both(WEATHER_SURFACES.panel),
    '--dsw-alias-border-l1': both(WEATHER_SURFACES.border),
    '--dsw-alias-border-l2': both(WEATHER_SURFACES.divider),
    '--dsw-alias-border-l3': both(palette.primary),
    '--dsw-alias-brand-primary': both(palette.primary),
    '--dsw-alias-label-primary': both(WEATHER_SURFACES.textPrimary),
    '--dsw-alias-label-primary-bluish': both(WEATHER_SURFACES.textPrimary),
    '--dsw-alias-label-primary-dimmed': both(WEATHER_SURFACES.textSecondary),
    '--dsw-alias-label-secondary': both(WEATHER_SURFACES.textSecondary),
    '--dsw-alias-label-tertiary': both(WEATHER_SURFACES.textSecondary),
    '--dsw-alias-label-caption': both(WEATHER_SURFACES.textSecondary),
    '--dsw-alias-state-error-primary': both(FIXED_ACCENTS.red),
    '--dsw-alias-state-success-primary': both(FIXED_ACCENTS.success),
    '--dsw-alias-state-warn-primary': both(palette.primary),
    '--dsw-alias-state-business-primary': both(FIXED_ACCENTS.blue),
    '--dsw-alias-button-info-fill': both(palette.primary),
    '--dsw-alias-button-info-hover': both(palette.dim),
    '--dsw-specific-sidebar-fill': both(WEATHER_SURFACES.panel),
    '--dsw-specific-input-major': both(WEATHER_SURFACES.inset),
  }
}

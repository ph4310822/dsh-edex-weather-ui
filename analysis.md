# Analysis — WEATHER (`weather-windy-ops`)

**Reference**: web-discovered — [Windy.com](https://www.windy.com/) wind map & weather forecast (`direction 14: weather command center`, query "weather radar map web app dark theme"), captured at 1600×900 → `reference-shot.png`. Step 1 item 0 skipped per web-discovered-reference rule; `metadata.url` set.

**Analysis method**: vision-first — native `vision_glance` 503 (decommissioned upstream) → CLI `scripts/vision-call-file.sh` (gpt-5.5) for glance/ground/inventory + native `vision_dominant_colors` on 5 regions + BMP pipeline (`analyze-ui.py` frame pass, `measure-accent2.py` hue buckets, two targeted pixel scans for legend stops/rules/reds). Programmatic measurement only sharpened vision values.

## Theme

Windy is a **full-viewport meteorological map** — the map is the canvas, everything else is translucent dark chrome floating on it.

| Token | Value | Evidence |
|---|---|---|
| Background (canvas) | `#000722` | near-black navy in map shading; deep map shadow `#000722` measured |
| Panel tone (chrome) | `#4d4d4e` | mode of top-left region 26.3%; bottom bar `#4f5152` 19%; cluster `#4c4d4d` 13.8% |
| Primary accent | `#d49500` | Go Premium pill 65.1%, time badge 75.4% (`#D49500` exact) |
| Secondary accent | `#dca82f` | amber gradient partner in pills |
| Text primary | `#f8f8f8` | hamburger button icon white share 15.7% |
| Text secondary | `#a8a8a8` | light-gray labels |
| Success | `#53a554` | map green family (modal `#41a241`, UI green) |
| Warn | `#d49500` | amber selection states |
| Error / alert red | `#9d0300` | play triangle + hamburger button (exact modal) |
| Brand red | `#a71c20` | Windy logo circle (exact modal) |
| Info / map blue | `#536bae` | city-frame blues `#536BB0` 13.9% |
| Cyan | `#4a94a2` | legend cyan stop + map cyan |

**Key nuance**: chrome surfaces are *translucent gray* (`rgba` over the map — low-sat averages read `#515151`–`#606060` depending on what's beneath; interior card fill target `#4d4d4e`). Windy's UI accents are **warm amber/gold + alert red** over a **cool blue/cyan/green data field**. Little to no glow: depth = translucency + soft black drop shadows.

## Border language

- **Frame**: none — no outer app frame; panels anchor to viewport edges. Panel cells stay the canvas (no card borders at panel level).
- **Cards/widgets**: closed rounded surfaces — **1px `#6a6a6c` full border, 10px radius**, soft black drop shadow (no glow). Compact labels/pills 18–22px; icon buttons fully circular (measured red button r≈21px).
- **Dividers**: 1px faint vertical rules between timeline day cells (BMP: ~+18 luminance over `#4d4d4d`); separator bars in the control cluster.
- **Inputs**: pill-shaped (20px radius); Windy's search is a WHITE field with dark text — a light-field divergence the terminal composer does not copy (keeps dark well, adopts the radius).
- **Active indicators**: **fill-based, not bars** — selected layer brighter chrome, active model amber `#d49500` fill with dark text, selected dates amber text, current time amber badge. No left accent bars anywhere.

## Widgets (reconciliation plan)

| Reference widget | → eDEX slot | Treatment |
|---|---|---|
| CURRENT CONDITIONS FORECAST (28° + 4-day columns + amber strip) | `info` | current-conditions panel, hi/lo rows |
| MODEL SELECTOR (ECMWF 9km active amber / GFS 22km / ICON 13km) | `cpu` | segmented model panel + resolution gauges |
| STATION OBSERVATIONS (city + temp readouts) | `processes` | city station rows (temp/wind kt) |
| LAYER RAIL (Weather radar/Satellite/Wind/… selectable) | `network-status` | selectable layer rows with live kt/Δ values |
| COLOR LEGEND (kt gradient 0–60) | `traffic` | wind-profile scale + live area trace in legend colors |
| **WIND PARTICLE FIELD** (animated wind streamlines over the map) | **featured → `globe` (WORLD VIEW)** | **WIND MAP**: navy canvas, drifting pale-cyan particles along a flow field, kt legend bar, mini forecast timeline (white play button, red triangle, amber time badge, day ticks) |

FORECAST TIMELINE, SEARCH FIELD, NOTIFICATION CARD, NAV PILLS: no slots — their language folds into chrome (timeline → featured widget; search pill → input radius; cards → widget chrome).

## DOM granularity mapping (per Lessons Learned)

- Per-widget card chrome (1px `#6a6a6c`, 10px radius, soft shadow, `#4d4d4e` fill, amber title text) → `WidgetSection.module.css` boxes — **one per widget**, with the mandatory `[data-widget='center']` transparent reset.
- Panel cells (`.leftBar`/`.rightBar`/`.bottomBar`) → canvas only: `--edex-bg`/`--edex-panel` = `#000722`, no per-cell borders (frame presence: none).
- Center workspace container (`.centerWidget`) carries the same 1px card chrome + title strip; inner section stays transparent; workspace inset below the strip.
- Active = amber fill / amber text — no bars, no brackets (this reference has none; none applied).

## Measurement appendix

- Legend gradient stops (x:1275→1585): `#6271b8 → #4a93a0 → #4ca24f → #8f903d → #a28245 → #8f4165 → #5e6aa0`
- Accent buckets (measure-accent2): red p50 `#9d0300`, orange p50 `#d49500`, yellow p50 `#a6964b`, green p50 `#47a447`, cyan p50 `#4a94a2`, blue p50 `#3a66a1`
- Chrome: forecast panel low-sat avg `#606060` (map bleed), bottom bar `#515151`, cluster `#4c4d4d`, model-inactive `#575755`
- Timeline rules: 1px, detected columns y=866; red button corner scan: radius ≈21px (circular)
- Map field: indigo shadow `#041c49`, deep shadow `#000722`, blue `#3a66a1`, cyan `#4a94a2`, green `#47a447`

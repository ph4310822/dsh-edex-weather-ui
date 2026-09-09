# Review — WEATHER (`dsh-edex-ui-weather` → `dsh-edex-weather-ui`)

**Reference**: windy.com wind-map & weather forecast (web-discovered, direction 14 "weather command center") · **Variant**: `dsh-edex-ui-weather` · **Boot**: DSH_HOME=/tmp/weather-dsh, port 3085 (3084 untouched) · **Verdict: PASS**

## Automated probe (scripts/probe-review.mjs)

| Check | Result |
|---|---|
| Console errors | **0** |
| Shell present | true |
| `--edex-green` (primary accent) | **#d49500** (matches analysis primaryAccent) |
| `--edex-border` | **#6a6a6c** (measured hairline) |
| `--edex-panel-2` | **#4d4d4e** (measured chrome) |
| `--dsw-alias-label-primary` | **#f8f8f8** (measured text) |
| `--dsw-alias-border-l1` | **#6a6a6c** |
| bodyBackground | **rgb(77,77,78) = #4d4d4e** — equals the card/chrome surface the workspace follows (per analysis: the center workspace takes Windy's dark-chrome surface, not the deep navy canvas) |
| Panel cells | transparent, 0 border — canvas-level per analysis (frame presence: none) |
| Per-widget cards (all 9) | 1px rgb(106,106,108) solid **full borders**, **10px radius**, fill **#4d4d4e**, shadow rgba(0,0,0,0.35) 0 2px 8px, gaps 4px/6px — exactly the analysis card language |
| Center widget section | fully transparent (0 border) — workspace never occluded |
| workspacePresent | true (sidebar rail + conversation + composer in DOM; conversation at boot empty-state) |
| worldViewGone | true — `WORLD VIEW`/`edex-world-view` gone |
| Featured widget | `wind-map` registered (WIND MAP replacing the globe slot); widgetIds: info, cpu, processes, network-status, wind-map, traffic, files, preview, terminal, center |

## Vision checks (vision-first; native glance/ground 503 → scripts/vision-call-file.sh gpt-5.5)

- **Composite compare** (reference top / render bottom): same theme — deep navy canvas, charcoal/gray chrome, amber/gold labels and highlights; same border language — rounded chrome cards, hairline outlines, soft shadows, amber pill/chip active states. Widgets re-imagined and confirmed: wind map, layer rail, model chips (ECMWF/GFS/ICON), kt legend, forecast timeline strip. Noted divergences: no full-canvas live map (the eDEX center stays the DSH text workspace, per the adaptation brief), heavier rectangular density, muted vs the colorful data field.
- **Granularity zoom (left column)**: 4 distinct card boxes — thin muted-light border, rounded corners, medium dark-gray fill, subtle shadow, clear navy gaps between cards; ECMWF chip gold-filled with dark text (resting chips dark gray with gray outlines); forecast columns WED–SAT with glyphs + hi/lo; titles pale gray/white, values gold.
- **Right column zoom**: WIND MAP with particle field + kt scale + amber badge + day ticks confirmed; MAP LAYERS pill rows with WIND active amber; WIND PROFILE kt gradient + chart; card chrome consistent.
- **Center zoom**: DSH WORKSPACE title strip visible, region framed by border, background = chrome surface (not black), sidebar rail + composer visible, **nothing occluded**.

## Pixel diff (vision_pixel_diff, grid 8)

overallDifferencePct **21.4** — dominated by structural differences: the reference is a full-bleed animated meteorological data map (cool blues/cyans/greens fill ~70% of the frame); the adaptation's center is a text workspace on the dark-chrome surface by design (documented divergence from the adaptation brief). Worst regions (37–44%) are the reference's bottom-right map-control cluster and data field, which have no terminal counterpart. Palette/border/widget chrome verified by computed styles + zooms above, which is the binding check for a translucent-map reference.

## Animation Verification (Generic)

Static inventory (grep): 1 CSS `@keyframes` (`playhead-blink`, opacity-only) + canvas rAF particle drift in `WindMapWidget.tsx` — inventory reconciled with the rendered shell.

Runtime probe (scripts/probe-animation.mjs): `errorsZero: true`, `running: true`, `rateOk: true`, `pivotOk: true`, `extentOk: true` → **PASS**. The playhead blink runs 1.6s infinite alternate (samples 0.99 → 0.25 opacity), symmetric 2px box, no rotation (pivot trivially satisfied), bounds confined inside the timeline container (first run failed extent at `top:-3px`; fixed to `top:0/bottom:0` and re-probed PASS). Canvas particle field verified animating (two canvas snapshots 900ms apart differ). The composer/sidebar use no animations.

## GIF

`preview.gif` — 48 frames @ 12fps over 4.0s, 343KB, **0 console errors during capture**. Shows the live shell: particle field drifting, playhead blinking, kt scale, amber badges.

## Widget reconciliation summary (matches from analysis.json)

| Reference widget | Slot | Implementation |
|---|---|---|
| CURRENT CONDITIONS FORECAST | `info` | big thermal readout (real °C where the host exposes it, `—°` otherwise), condition row (real power state), WED–SAT sample forecast chips + amber strips (sample — hooks carry no forecast; documented), real clock/uptime/platform/tasks/model lines |
| MODEL SELECTOR | `cpu` | ECMWF 9KM active amber chip / GFS 22KM / ICON 13KM / +2 + real per-core sparklines relabeled as model runs + TEMP/MIN/MAX/TASKS + real mem/swap block bars |
| STATION OBSERVATIONS | `processes` | live process table restyled as station rows (STATION header, amber hot values >25%), real loadavg footer |
| LAYER RAIL | `network-status` | pill layer rows (WEATHER RADAR/SATELLITE/**WIND active amber**/RAIN THUNDER/TEMPERATURE) with colored dots + real LINK/INTERFACE/IP/PING lines |
| COLOR LEGEND | `traffic` | measured kt gradient scale + ticks over the real dual throughput trace (cyan/amber) |
| **WIND PARTICLE FIELD** (featured) | `globe` → **WIND MAP** | navy pressure-field gradient + canvas wind particles (seeded flow field, trail fade), live LINK/PING readout, kt legend, mini timeline: white play button + red #9d0300 triangle, amber HH:MM badge, day ticks with 1px rules, blinking playhead |

SEARCH FIELD / NOTIFICATION CARD / NAV PILLS / MAP CONTROL CLUSTER: no slots — language folded into chrome (pill input radius 20px, card chrome, pill sidebar rows). FORECAST TIMELINE: folded into the featured widget (bottom slots keep files/preview/terminal function per the divergence rule).

## Divergences (documented)

1. Center workspace = DSH text workspace on the chrome surface (no live map) — per the adaptation brief.
2. Composer/input well stays dark (#3f3f41) — Windy's search field is WHITE with dark text (light-field divergence not copied; pill radius adopted).
3. Forecast chips + active model chip are styled sample content; all other widget data is live host telemetry.
4. translucency: eDEX panels are opaque chrome over the deep-navy canvas rather than rgba-over-map (terminal context).

**PASS** — tokens exact, border language exact, featured widget live, workspace visible, 0 errors, animation PASS.

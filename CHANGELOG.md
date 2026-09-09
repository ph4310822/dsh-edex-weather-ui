# Changelog

All notable changes to `@danielng23/dsh-edex-weather-ui` and its workspace
packages.

## 0.1.1 (2026-09-09)

`@danielng23/dsh-weather-client-ui-edex` and
`@danielng23/dsh-weather-host-system-metrics` only — patch republish:

- **fixed**: three stale `@danielng23/dsh-host-system-metrics` import paths in
  the emitted type artifacts (`lib/types/**/*.d.ts`) — type-only, runtime JS
  was already clean (the published bundle's `lib/client.js` is byte-identical
  between 0.1.0 and 0.1.1)
- **fixed**: `PACKAGE_NAME` invariant constant + module doc in
  `host/system-metrics/src/invariant.ts` now reference the renamed package
- `@danielng23/dsh-edex-weather-ui` (bundle) and
  `@danielng23/dsh-weather-client-ui-theme-terminal` stay at 0.1.0 — their
  0.1.0 tarballs were already name-clean

## 0.1.0 (2026-09-09)

Initial release — **WEATHER**: a windy.com wind-map command center as a
terminal shell.

- Vision analysis of windy.com (web-discovered reference): deep-navy canvas
  `#000722`, translucent gray chrome `#4d4d4e` (cards + workspace share it),
  1px `#6a6a6c` full borders @ 10px radius with soft shadows, amber `#d49500`
  fill-based selection, measured kt legend stops
- Featured **WIND MAP** widget (canvas wind-particle field, kt legend, mini
  forecast timeline with blinking playhead) replaces the WORLD VIEW globe;
  encom-globe dependency removed
- CURRENT CONDITIONS / ATMOSPHERE MODELS / STATION OBSERVATIONS / MAP LAYERS /
  WIND PROFILE reconcile the remaining windy panels to live host telemetry
- Center chrome reduced to a 1px border + `DSH WORKSPACE` title strip over a
  transparent section — the original workspace is never occluded
- Published chain boot-verified from registry.npmjs.org into a fresh
  DSH_HOME profile (byte-identical client.js + typert manifest, identical
  tokens, 0 errors)

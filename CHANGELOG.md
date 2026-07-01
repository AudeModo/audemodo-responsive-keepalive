# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-07-01

### Added

- Initial release.
- `<Responsive>` controlled primitive with `keepAlive` (default) / `swap` strategies
  and `lazy` / `eager` mount.
- `useMediaVariant` and `useResponsiveValue` — viewport resolution from integer px
  breakpoints or raw media-query strings.
- `useContainerVariant` — element-width resolution via ResizeObserver.
- `createResponsive` factory — typed `Responsive`, `Provider`, `Match` gates, and
  pre-bound hooks from a single breakpoint config.
- `useSharedState` and `SharedStateScope` — state shared across layouts that survives
  swaps and remounts.
- SSR support via an `ssr` fallback variant; anti-thrash (`settleMs`) and IME-safe
  (`deferWhileComposing`) switching.
- Graceful fallback to `swap` on React &lt; 19.2.

[Unreleased]: https://github.com/AudeModo/audemodo-responsive-keepalive/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/AudeModo/audemodo-responsive-keepalive/releases/tag/v0.1.0

# Changelog - StreamByte

## [1.0.0] - 2026-03-09

### Added
- **Core Stremio Integration**: Support for multiple manifest URLs (MediaFusion, WebStreamr, StreamVix, etc.).
- **Search System**: Global search across all installed catalogs.
- **Video Player**: Custom HLS-capable player with subtitle selections and quality controls.
- **Personalization**: Local history tracking ("Continue Watching"), Watchlists, and Favorites.
- **UI/UX**: Premium dark theme, glassmorphism sidebar, and Framer Motion transitions.
- **PWA support**: Installable app with custom logo and manifest.
- **Mobile optimization**: Bottom navigation bar and responsive layouts.
- **Performance**: Route-level lazy loading and image optimizations.
- **Resilience**: Caching layer for catalogs and exponential backoff retry logic for addons.
- **Settings**: Debrid API support (Real-Debrid, Premiumize, etc.) and NSFW content filters.

### Fixed
- StreamVix URL configuration issue.
- Sidebar layout on small screens.
- Search result deduplication.
- Initial load time via lazy imports.

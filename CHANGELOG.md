# Changelog

All notable changes to the Gemini Visual Novel Engine Extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Versioning Scheme

- **0.x.x.x** - Pre-release versions (alpha/beta)
- **1.0.0.0** - First stable release with all planned features
- Format: `0.MAJOR.MINOR.PATCH`
  - **MAJOR** - Significant feature additions or architectural changes
  - **MINOR** - Smaller features, improvements, or notable changes
  - **PATCH** - Bug fixes, minor tweaks, documentation updates

---

## [Unreleased]

### Planned
- Extension icons (16x16, 48x48, 128x128)
- Settings popup UI
- Save/Load functionality using browser.storage
- Additional persona sprites
- Mobile responsiveness improvements
- Session scraping (pre-populate backlog from existing DOM)
- Code block viewer interface

---

## [0.1.0.1] - 2026-01-25

### Fixed
- **Save Functionality**: Implemented robust "Pin-to-Rename" workflow to fix save automation failures.
- **Splash Screen Regression**: Fixed issue where the VN stage blocked clicks on the underlying Gemini intro page.
- **Versioning**: Updated versioning scheme to `ProductionRelease.Major.Minor.Patch` for Primary builds.

### Added
- **Debug UI**: Added debug button (🐞) to visualize detected speakers and locations in real-time.

---

## [0.1.0.0] - 2026-01-18

### Added
- **Initial project architecture**
  - Modular ES6 structure with separate Parser, UI, and Engine modules
  - Cross-browser build system using Vite
  - Separate builds for Chrome (Manifest V3) and Firefox (Manifest V2)
  - `webextension-polyfill` for unified browser.* API usage
  
- **Core Features (ported from legacy)**
  - MutationObserver-based text extraction from Gemini
  - Typewriter effect (40 chars/second)
  - Smart pagination with 280-character limit
  - Speaker tag parsing (`[Name]: dialogue`)
  - Character sprite display system
  - Backlog/history viewer
  - Settings menu with sprite scale/offset controls
  - Skip mode for rapid advancement
  - Mobile fullscreen button
  - Keyboard shortcuts (Space/Arrow to advance, ESC to toggle)
  
- **Project Files**
  - `src/content/index.js` - Entry point
  - `src/content/engine.js` - Main controller
  - `src/content/parser.js` - DOM observation & text extraction
  - `src/content/ui.js` - UI management
  - `src/content/style.css` - Extracted styles
  - `src/utils/browser.js` - Polyfill wrapper
  - `vite.config.js` - Base build configuration
  - `vite.chrome.config.js` - Chrome MV3 build
  - `vite.firefox.config.js` - Firefox MV2 build
  - `src/manifest.json` - Base manifest
  - `src/manifest.chrome.json` - Chrome overrides
  - `src/manifest.firefox.json` - Firefox overrides
  - `DEVELOPMENT.md` - Developer guide
  - `README.md` - Project overview
  - `CHANGELOG.md` - This file

### Changed
- Migrated from monolithic userscript to modular extension architecture
- Replaced Tampermonkey-specific APIs (`GM_addStyle`, `GM_xmlhttpRequest`) with standard web APIs
- Converted inline CSS to external stylesheet

### Technical Notes
- Built with Vite 7.3.1
- Uses webextension-polyfill 0.12.0
- Node.js 18.19.1 (Vite recommends 20+)
- Manifest merging implemented via Vite plugins

### Known Limitations
- Extension icons not yet created (manifest references placeholder paths)
- Not yet tested in live browser environment
- Save/Load functionality not implemented
- Popup UI not created
- Only one persona sprite configured ("coder bunny")

---

## [0.0.0.0] - Legacy

### Reference
- Original userscript version: 0.7.9.1
- Platform: Tampermonkey
- Repository: [gemini-web-vn-engine](https://github.com/wyntresparkz/gemini-web-vn-engine)
- Status: Deprecated, superseded by this extension

---

[Unreleased]: https://github.com/wyntresparkz/gvne-ext/compare/v0.1.0.0...HEAD
[0.1.0.0]: https://github.com/wyntresparkz/gvne-ext/releases/tag/v0.1.0.0

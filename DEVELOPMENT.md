# Development Guide - GVNE Extension

## Project Structure

```
gvne-ext/
├── src/
│   ├── content/           # Content scripts
│   │   ├── index.js       # Entry point
│   │   ├── engine.js      # Main engine controller
│   │   ├── ui.js          # UI management
│   │   ├── parser.js      # DOM parsing & observation
│   │   └── style.css      # Styles
│   ├── utils/
│   │   └── browser.js     # Polyfill wrapper
│   ├── manifest.json      # Base manifest
│   ├── manifest.chrome.json   # Chrome MV3 overrides
│   └── manifest.firefox.json  # Firefox MV2 overrides
├── dist/
│   ├── chrome/            # Chrome build output
│   └── firefox/           # Firefox build output
└── _legacyref/            # Legacy userscript reference
```

## Building

### Install Dependencies
```bash
npm install
```

### Build Commands

**Primary Platform: Firefox**
```bash
# Build Firefox only (Manifest V2)
npm run build:firefox

# Build both Firefox and Chrome
npm run build

# Build Chrome only (Manifest V3)
npm run build:chrome
```

### Packaging (Distribution)

Create distributable `.xpi` (Firefox) and `.zip` (Chrome) files:

```bash
# Package both browsers
npm run package

# Package Firefox only
npm run package:firefox

# Package Chrome only  
npm run package:chrome
```

Output: `packages/gvne-firefox-v0.1.0.0.xpi` and `packages/gvne-chrome-v0.1.0.0.zip`

### Development Mode

Watch for changes and rebuild automatically:

```bash
# Watch Firefox build (default)
npm run dev

# Watch Firefox build (explicit)
npm run dev:firefox

# Watch Chrome build
npm run dev:chrome
```

### Testing with web-ext

Firefox-specific testing tools:

```bash
# Run Firefox with extension loaded
npm run start:firefox

# Lint Firefox extension
npm run lint:firefox
```

## Loading the Extension

### Firefox (Primary - Recommended)
**Option 1: Load .xpi package**
1. Run `npm run package:firefox`
2. Navigate to `about:addons`
3. Click gear icon → "Install Add-on From File"
4. Select `packages/gvne-firefox-v0.1.0.0.xpi`

**Option 2: Load unpacked (development)**
1. Navigate to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select `manifest.json` in `dist/firefox`

**Option 3: Use web-ext**
```bash
npm run start:firefox
```

### Chrome/Edge (Secondary)
1. Navigate to `chrome://extensions/` (or `edge://extensions/`)
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `dist/chrome` folder

## Testing

1. Load the extension in your browser
2. Navigate to `https://gemini.google.com`
3. Start a conversation with Gemini
4. The VN overlay should appear automatically

## Cross-Browser Compatibility

This project uses `webextension-polyfill` to ensure the codebase uses the `browser.*` namespace universally. The build system generates separate outputs:

- **Chrome**: Manifest V3 with service workers
- **Firefox**: Manifest V2 with background scripts

The codebase itself is browser-neutral and doesn't use `chrome.*` APIs directly.

## Next Steps

- [ ] Add extension icons (16x16, 48x48, 128x128)
- [ ] Create popup UI for settings
- [ ] Implement save/load functionality using browser.storage
- [ ] Add more persona sprites
- [ ] Improve mobile responsiveness

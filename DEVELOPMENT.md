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
```bash
# Build both Chrome and Firefox versions
npm run build

# Build Chrome only (Manifest V3)
npm run build:chrome

# Build Firefox only (Manifest V2)
npm run build:firefox

# Development mode (watch for changes)
npm run dev
```

## Loading the Extension

### Chrome/Edge
1. Navigate to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `dist/chrome` folder

### Firefox
1. Navigate to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select the `manifest.json` file in `dist/firefox`

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

# Testing Checklist - GVNE Extension v0.1.0.0

## Pre-Test Setup

### Download Files
- [ ] Download the entire `dist/chrome/` folder (for Chrome/Edge testing)
- [ ] Download the entire `dist/firefox/` folder (for Firefox testing)

### Known Issue: Missing Icons
⚠️ **The extension will load but show warnings about missing icons**
- The manifest references `assets/icon16.png`, `assets/icon48.png`, `assets/icon128.png`
- These don't exist yet - this is expected and won't break functionality
- You'll see warnings in the browser console, but the extension will still work

---

## Chrome/Edge Testing

### Installation
1. [ ] Open `chrome://extensions/` (or `edge://extensions/`)
2. [ ] Enable "Developer mode" (toggle in top right)
3. [ ] Click "Load unpacked"
4. [ ] Select the `chrome` folder you downloaded
5. [ ] Verify extension appears in list (may show icon warnings - this is OK)

### Basic Functionality
1. [ ] Navigate to `https://gemini.google.com`
2. [ ] Start a new conversation
3. [ ] Type a message to Gemini
4. [ ] **Expected**: VN overlay should appear over the page
5. [ ] **Expected**: Gemini's response should appear in the dialogue box with typewriter effect

### UI Elements
- [ ] **Stage**: Dark gradient background visible
- [ ] **Dialogue Box**: Black box with purple border at bottom of screen
- [ ] **Typewriter**: Text appears character-by-character (~40 chars/sec)
- [ ] **Settings Icon**: Gear icon (⚙️) in top-left corner
- [ ] **Skip Button**: "SKIP" text in bottom-left of dialogue box

### Controls
- [ ] **Space Bar**: Advances text / skips typewriter
- [ ] **Right Arrow**: Advances text / skips typewriter
- [ ] **Click Dialogue Box**: Advances text
- [ ] **ESC Key**: Toggles VN overlay on/off
- [ ] **Click Skip**: Toggles skip mode (text appears instantly)

### Settings Menu
1. [ ] Click gear icon (⚙️) in top-left
2. [ ] **Expected**: Menu slides in from left
3. [ ] **Expected**: "OPTIONS" label appears
4. [ ] Menu items visible:
   - [ ] Save (not functional yet)
   - [ ] Load (not functional yet)
   - [ ] History
   - [ ] Skip: OFF/ON
   - [ ] Exit Engine
5. [ ] **Scale Slider**: Adjusts sprite size (won't be visible without sprite)
6. [ ] **Offset Slider**: Adjusts sprite position

### History/Backlog
1. [ ] Open settings menu
2. [ ] Click "History"
3. [ ] **Expected**: Backlog overlay appears
4. [ ] **Expected**: Previous dialogue entries shown
5. [ ] **Expected**: Speaker names in green, uppercase
6. [ ] Click "Return to Game"
7. [ ] **Expected**: Returns to main view

### Speaker Tags
Test with this prompt to Gemini:
```
Please respond in this format:

[Alice]: Hello! This is a test of the speaker system.

[Bob]: I agree, this should trigger the namebox feature.
```

- [ ] **Expected**: Namebox appears above dialogue box
- [ ] **Expected**: Speaker name displayed in namebox
- [ ] **Expected**: Dialogue text appears without the `[Name]:` tag

### Mobile/Fullscreen (if testing on mobile or small window)
1. [ ] Resize window to < 850px width
2. [ ] **Expected**: Fullscreen button (⛶) appears in top-right
3. [ ] Click fullscreen button
4. [ ] **Expected**: Page enters fullscreen mode
5. [ ] **Expected**: Button changes to ✖
6. [ ] Click again to exit fullscreen

---

## Firefox Testing

### Installation
1. [ ] Open `about:debugging#/runtime/this-firefox`
2. [ ] Click "Load Temporary Add-on"
3. [ ] Navigate to the `firefox` folder
4. [ ] Select `manifest.json`
5. [ ] Verify extension appears in list

### Repeat All Tests
- [ ] Follow all tests from Chrome section above
- [ ] Verify behavior is identical

---

## Console Checks

### Chrome DevTools
1. [ ] Press F12 to open DevTools
2. [ ] Go to Console tab
3. [ ] Look for:
   - [ ] `[GVNE] Initializing Gemini Visual Novel Engine...`
   - [ ] `[GVNE] Engine initialized successfully!`
4. [ ] Check for errors (icon warnings are expected)

### Expected Console Output
```
[GVNE] Initializing Gemini Visual Novel Engine...
[GVNE] Engine initialized successfully!
```

### Common Warnings (OK to ignore)
- Icon file warnings (we haven't created icons yet)
- `popup.html` not found (we haven't created popup yet)

---

## Known Issues to Watch For

### From Legacy Version
- [ ] Citation removal may cause brief text flicker on final page
- [ ] Some Gemini UI elements may briefly appear during page load
- [ ] Occasional slowdown during typewriter animation

### New Issues to Report
If you encounter any of these, please note:
- [ ] Extension doesn't load at all
- [ ] VN overlay doesn't appear on gemini.google.com
- [ ] Typewriter effect not working
- [ ] Controls (Space, Arrow, Click) not responding
- [ ] Settings menu doesn't open
- [ ] Backlog doesn't show previous messages
- [ ] Console shows errors (other than icon warnings)
- [ ] Page becomes unresponsive

---

## Success Criteria

✅ **Minimum Viable Test**: 
1. Extension loads without critical errors
2. VN overlay appears on gemini.google.com
3. Gemini's response appears in dialogue box
4. Typewriter effect works
5. Can advance text with Space/Click

✅ **Full Feature Test**:
- All controls work (Space, Arrow, Click, ESC, Skip)
- Settings menu opens and closes
- Backlog shows message history
- Speaker tags create namebox
- Can toggle VN mode on/off

---

## Reporting Results

Please note:
- **Browser**: Chrome/Edge/Firefox
- **Version**: (check browser version)
- **What worked**: ✅
- **What didn't work**: ❌
- **Console errors**: (copy/paste any red errors)
- **Screenshots**: (if possible, especially of issues)

---

## Quick Fix: Create Placeholder Icons

If you want to eliminate the icon warnings, you can create simple placeholder icons:

1. Create 3 PNG files (any simple image):
   - `icon16.png` (16x16 pixels)
   - `icon48.png` (48x48 pixels)
   - `icon128.png` (128x128 pixels)

2. Place them in:
   - `dist/chrome/assets/`
   - `dist/firefox/assets/`

3. Reload the extension

Or just ignore the warnings - they won't affect functionality!

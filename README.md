# 🎮 Gemini Visual Novel Engine (GVNE) Extension

![Version](https://img.shields.io/badge/version-0.1.0.0-blue)
![License](https://img.shields.io/badge/license-CC--BY--NC--SA--4.0-green)
![Platform](https://img.shields.io/badge/platform-Cross--Browser-orange)
![Status](https://img.shields.io/badge/status-IN_DEVELOPMENT-yellow)

> **Note**: This project is currently in active development. We are adapting the legacy userscript into a fully modular, cross-compatible browser extension for Firefox and Chrome.

> A Visual Novel interface overlay for Google Gemini, transformed into a powerful browser extension.

**Maintainer**: [wyntresparkz](https://github.com/wyntresparkz)
**Original Co-authors**: Claude & CodeBunny 🤖🐰

---

## 📖 Overview

GVNE Extension aims to transform the standard Gemini web interface into an immersive Visual Novel experience. By intercepting text output from Gemini's generative containers, it reformats content into a classic VN interface complete with character sprites, dialogue boxes, and more.

This extension builds upon the legacy userscript to provide better performance, cleaner architecture, and enhanced features.

### ✨ Planned Features

| Feature | Description |
|---------|-------------|
| **🔌 Cross-Browser Support** | Native support for Firefox and Chrome as a web extension |
| **⌨️ Typewriter Effect** | Smooth text rendering at adjustable speeds |
| **🎭 Dynamic Sprites** | Automatic character sprite display based on `[name]:` tags |
| **📄 Smart Pagination** | Intelligent text splitting for seamless dialogue flow |
| **📜 Backlog System** | Review previous dialogue history in a specialized interface |
| **🧹 Content Sanitization** | Automatic removal of technical metadata and clean narrative presentation |
| **👤 Persistent Identity** | Speaker tracking across multi-page dialogues |
| **⛶ Responsive Design** | Optimized for both Desktop and Mobile views |

---

## 🚀 Installation

*Installation instructions will be available once the first alpha release is published.*

---

## 🗺️ Roadmap

- [ ] **Core Architecture**: Porting legacy logic to Web Extension API
- [ ] **Manifest V3**: Ensuring full compliance and security
- [ ] **Settings UI**: Popup interface for configuring extension options
- [ ] **Asset Management**: Improved handling of sprites and custom assets
- [ ] **Session Management**: Better history and state tracking

---

## 📋 usage Protocol

The extension expects Gemini to follow specific formatting for optimal rendering:

### Speaker Tagging
```
[Speaker Name]: Dialogue text here.
```

- Tag must be at the start of the paragraph.
- Name enclosed in brackets.

### Narrative
Plain text without brackets is treated as narration.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request to the [repository](https://www.github.com/wyntresparkz/gvne-ext).

### Development Setup
```bash
git clone https://www.github.com/wyntresparkz/gvne-ext.git
cd gvne-ext
# Setup instructions coming soon
```

---

## 📜 License

This project is licensed under the **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License**.

---

<div align="center">

**Made with ❤️ for the VN community**

⭐ Star this repo if you find it useful!

</div>

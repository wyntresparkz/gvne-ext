# Versioning Guide

## Current Version: **0.1.0.0**

## Versioning Scheme
This project uses a **4-part semantic versioning** system during pre-release:

```
ProductionRelease.MAJOR.MINOR.PATCH
```

*Note: Canary builds use `Major.Minor.Patch.Hotfix`.*

### Version Components

- **0.x.x.x** - Pre-release indicator (stays at 0 until v1.0.0.0)
- **MAJOR** - Significant feature additions or architectural changes
- **MINOR** - Smaller features, improvements, or notable changes  
- **PATCH** - Bug fixes, minor tweaks, documentation updates

### Examples

- `0.1.0.0` → `0.1.0.1` - Bug fix or documentation update
- `0.1.0.0` → `0.1.1.0` - Small feature added
- `0.1.0.0` → `0.2.0.0` - Major feature completed
- `0.9.9.9` → `1.0.0.0` - **Full release** (all planned features complete)

## When to Increment

### PATCH (0.1.0.X)
- Bug fixes
- Typo corrections
- Documentation updates
- CSS tweaks
- Minor refactoring

### MINOR (0.1.X.0)
- New small features
- UI improvements
- Performance optimizations
- New configuration options
- Additional persona sprites

### MAJOR (0.X.0.0)
- Complete feature implementations
- Architectural changes
- Breaking changes
- Major UI overhauls
- New core functionality

## Roadmap to 1.0.0.0

The following milestones must be completed before v1.0.0.0:

- [ ] **0.2.0.0** - Save/Load system with browser.storage
- [ ] **0.3.0.0** - Settings popup UI
- [ ] **0.4.0.0** - Session scraping (backlog pre-population)
- [ ] **0.5.0.0** - Code block viewer interface
- [ ] **0.6.0.0** - Enhanced mobile support
- [ ] **0.7.0.0** - Custom sprite management
- [ ] **0.8.0.0** - Theme system
- [ ] **0.9.0.0** - Beta testing & polish
- [ ] **1.0.0.0** - **Stable release**

## Updating Version

When releasing a new version:

1. Update `CHANGELOG.md` with changes
2. Update version in:
   - `package.json`
   - `src/manifest.json`
   - `README.md` (badge)
3. Rebuild: `npm run build`
4. Commit: `git commit -m "Release vX.X.X.X"`
5. Tag: `git tag vX.X.X.X`
6. Push: `git push && git push --tags`

## Version History

- **0.1.0.0** (2026-01-18) - Initial modular architecture
- **0.0.0.0** - Legacy userscript (deprecated)

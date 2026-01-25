# Canary Development Rules

## 1. Versioning System
- Canary builds follow a strictly independent versioning system from the main release.
- **Starting Version**: `1.0.0.0`
- **Format**: `Major.Minor.Patch.Hotfix` (e.g., `1.0.0.0`, `1.0.0.1`)
- **Increment Rules**:
    - **Hotfix**: MUST be bumped if **even a single character** is changed in any file.
        - Limit: Up to `999` (e.g., `1.0.0.999`).
    - **Patch**: Bumps when Hotfix exceeds limit or for significant functional updates.
    - **Major/Minor**: Reserved for massive structural changes.

## 2. Source Isolation
- **Main Branch Protection**: NO changes are allowed to `src/content/` (Main files) during Canary development.
- **Working Directory**: All active development occurs in the `canary/` directory structure.

## 3. Build & Backup Procedures
- **Pre-Build**: The `version` in `canary/package.json` MUST be incremented before running a build.
- **Post-Build Backup**:
    - AFTER every successful build, the entire `src/` folder from the canary directory must be backed up.
    - **Location**: `canary/dist/canary/backup/canary.v.<VERSION>/`
    - **Example**: `canary/dist/canary/backup/canary.v.1.0.0.1/`

## 4. Strict Compliance
- These rules are absolute. Failure to follow backup or versioning procedures risks data loss and is unacceptable.

## 5. Merge with Primary
- **Path Adjustment**: Before any files are merged to the primary project directory any path dependencies must be adjusted for use in the primary (e.g., if package.json must be copied from canary all paths must be changed from /canary/xxx to /xxx).
- **Version adjustments**: When moving files to merge with primary, canary versioning must be changed to match primary project versioning rules and must be bumped to show changes made.
- **Changelog**: Changelog MUST include partial diff snippets to show exactly what has changed.

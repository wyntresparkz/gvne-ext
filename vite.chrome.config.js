import { defineConfig, mergeConfig } from 'vite';
import { resolve } from 'path';
import baseConfig from './vite.config.js';
import fs from 'fs';

export default mergeConfig(
    baseConfig,
    defineConfig({
        build: {
            outDir: 'dist/chrome',
            emptyOutDir: true,
        },
        plugins: [
            {
                name: 'copy-manifest',
                closeBundle() {
                    // Read base manifest
                    const baseManifest = JSON.parse(
                        fs.readFileSync(resolve(__dirname, 'src/manifest.json'), 'utf-8')
                    );

                    // Read Chrome-specific overrides
                    const chromeManifest = JSON.parse(
                        fs.readFileSync(resolve(__dirname, 'src/manifest.chrome.json'), 'utf-8')
                    );

                    // Read package.json for version syncing
                    const pkg = JSON.parse(
                        fs.readFileSync(resolve(__dirname, 'package.json'), 'utf-8')
                    );

                    // Merge manifests and override version
                    const finalManifest = {
                        ...baseManifest,
                        ...chromeManifest,
                        version: pkg.version
                    };

                    // Write to dist
                    fs.writeFileSync(
                        resolve(__dirname, 'dist/chrome/manifest.json'),
                        JSON.stringify(finalManifest, null, 2)
                    );

                    // Copy CSS
                    fs.copyFileSync(
                        resolve(__dirname, 'src/content/style.css'),
                        resolve(__dirname, 'dist/chrome/content.css')
                    );

                    // Copy Assets
                    if (fs.existsSync(resolve(__dirname, 'src/assets'))) {
                        fs.cpSync(
                            resolve(__dirname, 'src/assets'),
                            resolve(__dirname, 'dist/chrome/assets'),
                            { recursive: true }
                        );
                    }

                    // Move and cleanup Popup HTML
                    // Check if it exists at src/popup/index.html (Vite output structure)
                    const srcPopupPath = resolve(__dirname, 'dist/chrome/src/popup/index.html');
                    if (fs.existsSync(srcPopupPath)) {
                        // Move to root as popup.html
                        fs.renameSync(srcPopupPath, resolve(__dirname, 'dist/chrome/popup.html'));

                        // Cleanup empty directories (dist/chrome/src/popup and dist/chrome/src)
                        try {
                            fs.rmdirSync(resolve(__dirname, 'dist/chrome/src/popup'));
                            fs.rmdirSync(resolve(__dirname, 'dist/chrome/src'));
                        } catch (e) {
                            // Ignore cleanup errors
                        }
                    }
                },
            },
        ],
    })
);

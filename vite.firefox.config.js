import { defineConfig, mergeConfig } from 'vite';
import { resolve } from 'path';
import baseConfig from './vite.config.js';
import fs from 'fs';

export default mergeConfig(
    baseConfig,
    defineConfig({
        build: {
            outDir: 'dist/firefox',
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

                    // Read Firefox-specific overrides
                    const firefoxManifest = JSON.parse(
                        fs.readFileSync(resolve(__dirname, 'src/manifest.firefox.json'), 'utf-8')
                    );

                    // Read package.json for version syncing
                    const pkg = JSON.parse(
                        fs.readFileSync(resolve(__dirname, 'package.json'), 'utf-8')
                    );

                    // Merge manifests and override version
                    const finalManifest = {
                        ...baseManifest,
                        ...firefoxManifest,
                        version: pkg.version
                    };

                    // Write to dist
                    fs.writeFileSync(
                        resolve(__dirname, 'dist/firefox/manifest.json'),
                        JSON.stringify(finalManifest, null, 2)
                    );

                    // Copy CSS
                    fs.copyFileSync(
                        resolve(__dirname, 'src/content/style.css'),
                        resolve(__dirname, 'dist/firefox/content.css')
                    );

                    // Copy Assets
                    if (fs.existsSync(resolve(__dirname, 'src/assets'))) {
                        fs.cpSync(
                            resolve(__dirname, 'src/assets'),
                            resolve(__dirname, 'dist/firefox/assets'),
                            { recursive: true }
                        );
                    }

                    // Move and cleanup Popup HTML
                    const srcPopupPath = resolve(__dirname, 'dist/firefox/src/popup/index.html');
                    if (fs.existsSync(srcPopupPath)) {
                        fs.renameSync(srcPopupPath, resolve(__dirname, 'dist/firefox/popup.html'));
                        try {
                            fs.rmdirSync(resolve(__dirname, 'dist/firefox/src/popup'));
                            fs.rmdirSync(resolve(__dirname, 'dist/firefox/src'));
                        } catch (e) { }
                    }
                },
            },
        ],
    })
);

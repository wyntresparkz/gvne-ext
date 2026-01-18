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

                    // Merge manifests
                    const finalManifest = { ...baseManifest, ...chromeManifest };

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
                },
            },
        ],
    })
);

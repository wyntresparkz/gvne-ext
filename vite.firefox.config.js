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

                    // Merge manifests
                    const finalManifest = { ...baseManifest, ...firefoxManifest };

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
                    const assetsDir = resolve(__dirname, 'assets');
                    if (fs.existsSync(assetsDir)) {
                        fs.cpSync(
                            assetsDir,
                            resolve(__dirname, 'dist/firefox/assets'),
                            { recursive: true }
                        );
                    }
                },
            },
        ],
    })
);

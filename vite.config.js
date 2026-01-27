import { defineConfig } from 'vite';
import { resolve } from 'path';

// Base configuration shared between Chrome and Firefox
export default defineConfig({
    build: {
        emptyOutDir: false,
        rollupOptions: {
            input: {
                content: resolve(__dirname, 'src/content/index.js'),
                // popup: resolve(__dirname, 'src/popup/index.html'),
            },
            output: {
                entryFileNames: '[name].js',
                chunkFileNames: '[name].js',
                assetFileNames: '[name].[ext]',
                format: 'iife',
            },
        },
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
});

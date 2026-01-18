/**
 * Package script for creating distributable extension files
 * - Firefox: .xpi file
 * - Chrome: .zip file
 */

import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(path.dirname(__filename)); // Go up one level to project root

const DIST_DIR = path.resolve(__dirname, 'dist');
const PACKAGES_DIR = path.resolve(__dirname, 'packages');

// Ensure packages directory exists
if (!fs.existsSync(PACKAGES_DIR)) {
    fs.mkdirSync(PACKAGES_DIR, { recursive: true });
}

/**
 * Create a zip/xpi archive
 */
function createArchive(sourceDir, outputPath, format = 'zip') {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outputPath);
        const archive = archiver(format, {
            zlib: { level: 9 } // Maximum compression
        });

        output.on('close', () => {
            console.log(`✓ Created ${path.basename(outputPath)} (${archive.pointer()} bytes)`);
            resolve();
        });

        archive.on('error', (err) => {
            reject(err);
        });

        archive.pipe(output);
        archive.directory(sourceDir, false);
        archive.finalize();
    });
}

/**
 * Get version from package.json
 */
function getVersion() {
    const packageJson = JSON.parse(
        fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8')
    );
    return packageJson.version;
}

/**
 * Main packaging function
 */
async function packageExtensions() {
    const version = getVersion();
    console.log(`\nPackaging GVNE Extension v${version}...\n`);

    try {
        // Package Firefox (.xpi) - PRIMARY
        const firefoxSource = path.join(DIST_DIR, 'firefox');
        const firefoxOutput = path.join(PACKAGES_DIR, `gvne-firefox-v${version}.xpi`);

        if (fs.existsSync(firefoxSource)) {
            console.log('📦 Packaging Firefox extension...');
            await createArchive(firefoxSource, firefoxOutput, 'zip'); // .xpi is just a renamed .zip
        } else {
            console.error('❌ Firefox build not found. Run `npm run build:firefox` first.');
        }

        // Package Chrome (.zip) - SECONDARY
        const chromeSource = path.join(DIST_DIR, 'chrome');
        const chromeOutput = path.join(PACKAGES_DIR, `gvne-chrome-v${version}.zip`);

        if (fs.existsSync(chromeSource)) {
            console.log('📦 Packaging Chrome extension...');
            await createArchive(chromeSource, chromeOutput, 'zip');
        } else {
            console.error('❌ Chrome build not found. Run `npm run build:chrome` first.');
        }

        console.log(`\n✅ Packaging complete! Files saved to: ${PACKAGES_DIR}\n`);
    } catch (error) {
        console.error('❌ Packaging failed:', error);
        process.exit(1);
    }
}

packageExtensions();

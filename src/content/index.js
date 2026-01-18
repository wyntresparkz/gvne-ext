/**
 * Content Script Entry Point
 * Initializes the Gemini Visual Novel Engine
 */

import { VNEngine } from './engine.js';

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

async function init() {
    console.log('[GVNE] Initializing Gemini Visual Novel Engine...');

    try {
        const engine = new VNEngine();
        await engine.init();
        console.log('[GVNE] Engine initialized successfully!');
    } catch (error) {
        console.error('[GVNE] Failed to initialize engine:', error);
    }
}

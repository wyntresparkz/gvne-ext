import browser from '../utils/browser.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Elements
    const vnModeToggle = document.getElementById('vn-mode-toggle');
    const skipModeToggle = document.getElementById('skip-mode-toggle');
    const textSpeedSlider = document.getElementById('text-speed');
    const speedValueDisplay = document.getElementById('speed-value');
    const versionDisplay = document.getElementById('version-display');
    const resetBtn = document.getElementById('reset-settings');
    const githubBtn = document.getElementById('open-github');

    // Constants
    const STORAGE_KEY_SETTINGS = 'gvne_settings';
    const DEFAULT_SETTINGS = {
        vnMode: true,
        skipMode: false,
        textSpeed: 40
    };

    // Load Version
    const manifest = browser.runtime.getManifest();
    versionDisplay.textContent = `v${manifest.version}`;

    // Load Settings
    async function loadSettings() {
        try {
            const result = await browser.storage.local.get(STORAGE_KEY_SETTINGS);
            const settings = result[STORAGE_KEY_SETTINGS] || DEFAULT_SETTINGS;

            vnModeToggle.checked = settings.vnMode;
            skipModeToggle.checked = settings.skipMode;
            textSpeedSlider.value = settings.textSpeed;
            speedValueDisplay.textContent = settings.textSpeed;
        } catch (e) {
            console.error('Failed to load settings:', e);
        }
    }

    // Save Settings
    async function saveSettings() {
        const settings = {
            vnMode: vnModeToggle.checked,
            skipMode: skipModeToggle.checked,
            textSpeed: parseInt(textSpeedSlider.value, 10)
        };

        try {
            await browser.storage.local.set({ [STORAGE_KEY_SETTINGS]: settings });

            // Notify content script
            const tabs = await browser.tabs.query({ active: true, currentWindow: true });
            if (tabs[0]) {
                browser.tabs.sendMessage(tabs[0].id, { type: 'SETTINGS_UPDATED', settings });
            }
        } catch (e) {
            console.error('Failed to save settings:', e);
        }
    }

    // Event Listeners
    vnModeToggle.addEventListener('change', saveSettings);
    skipModeToggle.addEventListener('change', saveSettings);

    textSpeedSlider.addEventListener('input', (e) => {
        speedValueDisplay.textContent = e.target.value;
    });
    textSpeedSlider.addEventListener('change', saveSettings);

    resetBtn.addEventListener('click', async () => {
        vnModeToggle.checked = DEFAULT_SETTINGS.vnMode;
        skipModeToggle.checked = DEFAULT_SETTINGS.skipMode;
        textSpeedSlider.value = DEFAULT_SETTINGS.textSpeed;
        speedValueDisplay.textContent = DEFAULT_SETTINGS.textSpeed;
        await saveSettings();
    });

    githubBtn.addEventListener('click', () => {
        browser.tabs.create({ url: 'https://github.com/wyntresparkz/gvne-ext' });
    });

    // Initial Load
    await loadSettings();
});

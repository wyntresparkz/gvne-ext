/**
 * Start Screen & Menu Module
 * Handles the initial "Press Start" screen and the Transition to Main Menu.
 */

import browser from '../utils/browser.js';

export class StartScreen {
    constructor() {
        this.element = null;
        this.isActive = false;
        this.isMenuOpen = false;

        // Assets
        this.bgImageDay = browser.runtime.getURL('assets/bgsfwDAY.png');
        this.bgImageNight = browser.runtime.getURL('assets/bgSFWNIGHT.png');
        this.bgImageNSFW = browser.runtime.getURL('assets/bgNSFW.png');
        this.logoImage = browser.runtime.getURL('assets/Gemini Logo.png');

        // Secret Code
        this.konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'];
        this.konamiIndex = 0;

        // Determine initial background based on time (6AM - 6PM is Day)
        const hour = new Date().getHours();
        this.isNight = hour >= 18 || hour < 6;

        // Always start with DAY
        this.currentSFWBg = this.bgImageDay;
        this.bgImage = this.bgImageDay;
    }

    /**
     * Check if Start Screen should be shown based on URL
     */
    shouldShow() {
        const url = window.location.href;
        // Only show on main app page, not specific chats
        const isMainApp = url === 'https://gemini.google.com/app' ||
            url === 'https://gemini.google.com/app/' ||
            url === 'https://gemini.google.com/';
        return isMainApp;
    }

    /**
     * Show the Start Screen
     */
    show() {
        return new Promise((resolve) => {
            this.onComplete = resolve;
            this.initDOM();
        });
    }

    /**
     * Initialize DOM elements
     */
    initDOM() {
        // Container
        this.element = document.createElement('div');
        this.element.id = 'vn-start-screen';
        this.element.style.backgroundImage = `url("${this.bgImage}")`;

        // Logo
        const logo = document.createElement('img');
        logo.src = this.logoImage;
        logo.id = 'vn-start-logo';
        this.element.appendChild(logo);

        // "Press Start" Text
        const pressStart = document.createElement('div');
        pressStart.id = 'vn-press-start';
        pressStart.textContent = 'PRESS START';

        // Blink animation
        setInterval(() => {
            pressStart.style.opacity = pressStart.style.opacity === '0' ? '1' : '0';
        }, 800);

        this.element.appendChild(pressStart);

        // Menu Container (Hidden initially)
        this.menuContainer = document.createElement('div');
        this.menuContainer.id = 'vn-start-menu';

        const options = [
            { label: 'New Game', action: () => this.handleMenuAction('New Game') },
            { label: 'Continue', action: () => this.handleMenuAction('Continue') },
            { label: 'Options', action: () => this.handleMenuAction('Options') },
            { label: 'Gallery', action: () => this.handleMenuAction('Gallery') }
        ];

        options.forEach((opt, index) => {
            const btn = document.createElement('button');
            btn.className = 'vn-menu-btn';
            btn.textContent = opt.label;
            btn.style.setProperty('--delay', `${index * 0.1}s`);
            btn.onclick = (e) => {
                e.stopPropagation(); // Prevent background click
                opt.action();
            };
            this.menuContainer.appendChild(btn);
        });

        // NSFW Button Removed - Easter Egg Only

        this.element.appendChild(this.menuContainer);

        // Interaction Listener (Press Start)
        this.element.onclick = () => this.handlePressStart();
        document.addEventListener('keydown', this.handleKeyDown.bind(this));

        document.body.appendChild(this.element);
        this.isActive = true;

        // Day -> Night Fade Logic
        if (this.isNight) {
            // Wait a moment for Day to render, then fade to Night
            setTimeout(() => {
                this.currentSFWBg = this.bgImageNight;
                this.bgImage = this.bgImageNight;
                this.element.style.backgroundImage = `url("${this.bgImage}")`;
            }, 500);
        }
    }

    /**
     * Update visual selection of menu items
     */
    updateMenuSelection() {
        const buttons = this.menuContainer.querySelectorAll('.vn-menu-btn');
        buttons.forEach((btn, index) => {
            if (index === this.selectedMenuIndex) {
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');
            }
        });
    }

    /**
     * Toggle NSFW Background
     */
    toggleNSFW() {
        if (!this.isNSFW) {
            this.isNSFW = true;

            // Try to create/play video
            if (!this.videoElement) {
                this.videoElement = document.createElement('video');
                this.videoElement.id = 'vn-start-video';
                this.videoElement.autoplay = true;
                this.videoElement.loop = true;
                this.videoElement.muted = true; // Autoplay requires muted
                this.videoElement.playsInline = true;
                this.videoElement.poster = this.bgImageNSFW; // Fallback image

                // Stub URL for video (doesn't exist yet, but logic is ready)
                this.videoElement.src = browser.runtime.getURL('assets/bgNSFW.mp4');

                // Fallback: If error, remove video and rely on poster/CSS bg
                this.videoElement.onerror = () => {
                    console.log('NSFW Video not found, using valid poster/fallback.');
                    // We keep the video element because the 'poster' handles the static image display
                    // OR we could hide it. But poster is the standard way.
                };

                // Insert as first child so it's behind everything but on top of CSS bg
                this.element.insertBefore(this.videoElement, this.element.firstChild);
            } else {
                this.videoElement.style.display = 'block';
                this.videoElement.play().catch(e => console.log('Video play failed:', e));
            }

            // Also set CSS bg as double-fallback (or for before video loads)
            this.bgImage = this.bgImageNSFW;
            this.element.style.backgroundImage = `url("${this.bgImage}")`;

        } else {
            // Revert to computed SFW background
            this.isNSFW = false;

            // Hide/Pause video
            if (this.videoElement) {
                this.videoElement.pause();
                this.videoElement.style.display = 'none';
            }

            this.bgImage = this.currentSFWBg;
            this.element.style.backgroundImage = `url("${this.bgImage}")`;
        }
    }

    /**
     * Handle "Press Start" interaction
     */
    handlePressStart() {
        if (this.isMenuOpen) return;

        this.isMenuOpen = true;
        this.element.classList.add('menu-active');
        this.selectedMenuIndex = -1; // No selection initially, or set to 0?

        // Remove "Press Start" text
        const pressStart = this.element.querySelector('#vn-press-start');
        if (pressStart) pressStart.remove();
    }

    /**
     * Handle Key Press (Enter/Space or Konami Code or Menu Nav)
     */
    handleKeyDown(e) {
        if (!this.isActive) return;

        // Check Konami Code
        if (e.key === this.konamiCode[this.konamiIndex]) {
            this.konamiIndex++;
            if (this.konamiIndex === this.konamiCode.length) {
                this.toggleNSFW();
                this.konamiIndex = 0;
            }
        } else {
            this.konamiIndex = 0;
        }

        if (!this.isMenuOpen) {
            // Press Start Phase
            if (e.key === 'Enter' || e.key === ' ') {
                this.handlePressStart();
            }
        } else {
            // Menu Navigation Phase
            if (this.isTransitioning) return; // Locked

            const buttons = this.menuContainer.querySelectorAll('.vn-menu-btn');

            if (e.key === 'ArrowDown') {
                this.selectedMenuIndex++;
                if (this.selectedMenuIndex >= buttons.length) this.selectedMenuIndex = 0;
                this.updateMenuSelection();
            } else if (e.key === 'ArrowUp') {
                this.selectedMenuIndex--;
                if (this.selectedMenuIndex < 0) this.selectedMenuIndex = buttons.length - 1;
                this.updateMenuSelection();
            } else if (e.key === 'Enter' || e.key === ' ') {
                if (this.selectedMenuIndex >= 0 && this.selectedMenuIndex < buttons.length) {
                    buttons[this.selectedMenuIndex].click(); // Trigger click logic
                }
            }
        }
    }

    /**
     * Handle Menu Item Click (Stub)
     */
    /**
     * Handle Menu Item Click
     */
    async handleMenuAction(action) {
        console.log(`[StartScreen] Menu Action: ${action}`);

        // 0. Lock UI to prevent double-clicks
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        this.menuContainer.classList.add('locked');

        // 1. Visual Feedback - Trigger Animations IMMEDIATELY
        // This causes unselected items to fade out and the selected item to drop & flash
        const buttons = this.menuContainer.querySelectorAll('.vn-menu-btn');
        buttons.forEach(btn => {
            if (btn.textContent === action) {
                btn.classList.add('selected');
                // Ensure it keeps flashing by NOT removing classes or preventing default behavior
            }
        });

        // Add class to parent to trigger CSS animations for children
        // Wait 50ms to ensure browser renders 'selected' state before animating transform
        setTimeout(() => {
            this.element.classList.add('menu-animating');
        }, 50);


        // 2. Transition Logic (Gated by NSFW Mode)
        if (this.isNSFW) {
            // --- NSFW MODE: Transition Video ---

            // Immediate Fade Logic (A/B Variant 37a)
            const fadeDuration = 1000; // 1 second

            if (this.videoElement) {
                console.log('[StartScreen] Fading out background video immediately.');
                this.videoElement.style.transition = `opacity ${fadeDuration}ms ease`;
                this.videoElement.style.opacity = '0';
            }

            // Schedule Logo Fade
            this.element.classList.add('logo-fading');

            // Wait for the fade duration
            await new Promise(resolve => setTimeout(resolve, fadeDuration));

            // Play Transition Video
            console.log('[StartScreen] Attempting transition video...');
            const transitionSrc = browser.runtime.getURL(`assets/video_${action.replace(/\s+/g, '').toLowerCase()}.mp4`);

            if (!this.videoElement) {
                this.videoElement = document.createElement('video');
                this.videoElement.id = 'vn-start-video';
                this.videoElement.autoplay = true;
                this.videoElement.muted = true;
                this.videoElement.playsInline = true;
                this.element.insertBefore(this.videoElement, this.element.firstChild);
            }

            this.videoElement.src = transitionSrc;
            this.videoElement.loop = false;

            // Reset opacity 
            this.videoElement.style.transition = 'none';
            this.videoElement.style.opacity = '1';

            try {
                await this.videoElement.play();
                console.log('[StartScreen] Transition video started.');

                await new Promise((resolve, reject) => {
                    this.videoElement.onended = resolve;
                    this.videoElement.onerror = reject;
                });
            } catch (e) {
                console.log('[StartScreen] Transition video failed. Using fallback.');
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

        } else {
            // --- SFW MODE: Just Menu Animation ---
            console.log('[StartScreen] SFW Mode - Skipping transition video.');
            // Wait for the "Drop" animation to complete (1.2s)
            await new Promise(resolve => setTimeout(resolve, 1400)); // 1.2s + small buffer
        }

        // 4. Show Loading Screen
        if (window.LoadingScreen) {
            await window.LoadingScreen.show();
            // Small buffer while loading screen is opaque
            await new Promise(resolve => setTimeout(resolve, 600));
        }

        // 5. Cleanup & Complete
        this.destroy();
        if (this.onComplete) this.onComplete();

        if (window.LoadingScreen) {
            setTimeout(() => {
                window.LoadingScreen.hide();
            }, 500);
        }
    }

    /**
     * Clean up and remove DOM
     */
    destroy() {
        if (this.element) {
            this.element.remove();
        }
        document.removeEventListener('keydown', this.handleKeyDown.bind(this));
        this.isActive = false;
    }
}

// Export singleton
export default new StartScreen();

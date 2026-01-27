/**
 * Loading Screen Module
 * Handles the display and animation of the loading overlay during SPA navigation.
 */
class LoadingScreen {
    constructor() {
        this.element = null;
        this.isActive = false;
        this.minDuration = 3500; // Minimum time to show the screen in ms
    }

    /**
     * Initialize the loading screen DOM elements
     */
    init() {
        if (this.element) return;

        // Create container
        this.element = document.createElement('div');
        this.element.id = 'vn-loading-screen';

        // Create content wrapper
        const content = document.createElement('div');
        content.className = 'vn-loading-content';

        // Create text with animated spans
        const textContainer = document.createElement('div');
        textContainer.className = 'vn-loading-text';

        const text = "Now Loading...";
        text.split('').forEach((char, index) => {
            const span = document.createElement('span');
            span.textContent = char;
            span.style.animationDelay = `${index * 0.1}s`;
            textContainer.appendChild(span);
        });

        // Create spinner
        const spinner = document.createElement('div');
        spinner.className = 'vn-loading-spinner';

        // Assemble
        content.appendChild(spinner);
        content.appendChild(textContainer);
        this.element.appendChild(content);

        // Inject into body
        document.body.appendChild(this.element);
    }

    /**
     * Show the loading screen
     * @returns {Promise<void>}
     */
    show() {
        if (!this.element) this.init();

        return new Promise(resolve => {
            this.isActive = true;
            this.startTime = Date.now();

            // Force reflow
            void this.element.offsetWidth;

            this.element.classList.add('active');

            // Resolve immediately, the caller handles the duration wait
            resolve();
        });
    }

    /**
     * Hide the loading screen, respecting minimum duration
     * @returns {Promise<void>}
     */
    hide() {
        if (!this.element || !this.isActive) return Promise.resolve();

        return new Promise(resolve => {
            const elapsed = Date.now() - this.startTime;
            const remaining = Math.max(0, this.minDuration - elapsed);

            setTimeout(() => {
                this.element.classList.remove('active');

                // Wait for fade out transition
                setTimeout(() => {
                    this.isActive = false;
                    resolve();
                }, 500); // Matches CSS transition duration
            }, remaining);
        });
    }
}

// Export singleton
window.LoadingScreen = new LoadingScreen();

/**
 * Parser Module
 * Handles MutationObserver and text extraction from Gemini's DOM
 */

export class Parser {
    constructor(onMessageUpdate) {
        this.onMessageUpdate = onMessageUpdate;
        this.observer = null;
        this.lastProcessedElement = null;
        this.currentCodeBlocks = [];
    }

    /**
     * Initialize the MutationObserver
     */
    init() {
        this.observer = new MutationObserver(() => {
            const containers = document.querySelectorAll('structured-content-container');
            if (containers.length === 0) return;

            const latest = containers[containers.length - 1];

            // Detect new turn
            if (latest !== this.lastProcessedElement) {
                this.lastProcessedElement = latest;
                this.onMessageUpdate(null, true); // Signal new turn
            }

            this.processMessage(latest);
        });

        this.observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true,
        });
    }

    /**
     * Process a message container and extract clean text
     */
    processMessage(container) {
        // 1. Collect code blocks first (for save data)
        this.currentCodeBlocks = [];
        container.querySelectorAll('code-block').forEach(block => {
            this.currentCodeBlocks.push(block.innerText);
        });

        const paragraphs = [];

        // Extract text from paragraphs, removing citations and code blocks
        container.querySelectorAll('p, .citation').forEach((p) => {
            if (p.classList.contains('citation')) {
                p.remove();
                return;
            }

            const clone = p.cloneNode(true);
            clone.querySelectorAll('.code-block, code, pre, .modular-data').forEach((el) => el.remove());

            let text = clone.innerText
                .trim()
                .replace(/\*\*|\*/g, '') // Remove markdown formatting
                .replace(/\s+/g, ' '); // Normalize whitespace

            if (text.length > 0) paragraphs.push(text);
        });

        // Check if Gemini is still generating
        const isGenerating = !!document.querySelector('button[aria-label="Stop response"]');

        // Split paragraphs into pages
        const newPages = [];
        const MAX_CHARS = 280;

        paragraphs.forEach((p) => {
            const sentences = p.split(/(?<=[.!?])(?=\s+[A-Z])/);
            const tagMatch = p.match(/^\[.*?\]\s*:/);
            const tag = tagMatch ? tagMatch[0] : '';

            let buffer = tag;

            sentences.forEach((s) => {
                let sClean = s.replace(tag, '').trim();

                if ((buffer + sClean).length > MAX_CHARS) {
                    newPages.push(buffer.trim());
                    buffer = tag + ' ' + sClean;
                } else {
                    buffer += ' ' + sClean;
                }
            });

            if (buffer && buffer !== tag) {
                newPages.push(buffer.trim());
            }
        });

        this.onMessageUpdate(newPages, false, isGenerating);
    }

    /**
     * Disconnect the observer
     */
    disconnect() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
}

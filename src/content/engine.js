/**
 * Engine Module
 * Main controller that coordinates Parser and UI
 */

import { Parser } from './parser.js';
import { UIManager } from './ui.js';
import browser from '../utils/browser.js';

export class VNEngine {
    constructor() {
        // State
        this.isVnMode = true;
        this.isSkipActive = false;
        this.messageHistory = [];
        this.currentPages = [];
        this.currentPageIndex = 0;
        this.isTyping = false;
        this.hasStartedTypingThisTurn = false;
        this.currentCleanText = '';
        this.typewriterStartTime = null;

        // Constants
        this.CHARS_PER_SECOND = 40;

        // Persona library
        this.PersonaLibrary = {
            'coder bunny': {
                url: 'https://i.postimg.cc/gkwshHMP/coderbunnyneutral.png',
                blobUrl: null,
            },
        };

        // Initialize modules
        this.parser = new Parser(this.handleMessageUpdate.bind(this));
        this.ui = new UIManager({
            onAdvance: this.advance.bind(this),
            onToggleSkip: this.toggleSkip.bind(this),
            onToggleVnMode: this.toggleVnMode.bind(this),
            isVnMode: () => this.isVnMode,
            getMessageHistory: () => this.messageHistory,
        });
    }

    /**
     * Initialize the engine
     */
    async init() {
        this.ui.init();
        this.parser.init();

        // Load background and sprites
        await this.loadBackground();
        await this.loadSprite('coder bunny');
    }

    /**
     * Handle message updates from parser
     */
    handleMessageUpdate(newPages, isNewTurn, isGenerating) {
        // New turn detected
        if (isNewTurn) {
            this.currentPages = [];
            this.currentPageIndex = 0;
            this.hasStartedTypingThisTurn = false;
            return;
        }

        // No new pages
        if (!newPages || newPages.length === 0) return;

        // Check for content changes
        const isNewContent =
            newPages.length > this.currentPages.length ||
            (newPages.length > 0 &&
                this.currentPages.length > 0 &&
                newPages[newPages.length - 1] !== this.currentPages[this.currentPages.length - 1]);

        if (!isNewContent) return;

        // Don't show single short page if still generating
        if (isGenerating && newPages.length < 2 && this.currentPages.length === 0) {
            return;
        }

        this.currentPages = newPages;

        // Start typing if not already started
        if (!this.hasStartedTypingThisTurn && !this.isTyping) {
            this.startTypewriter(this.currentPages[this.currentPageIndex]);
        } else if (this.isTyping && this.currentPageIndex === this.currentPages.length - 1) {
            // Update current page if we're typing the last page
            const newText = this.currentPages[this.currentPageIndex];
            const nameMatch = newText.match(/^\[.*?\]\s*:/);
            const newCleanText = nameMatch ? newText.replace(/^\[.*?\]\s*:/, '').trim() : newText;

            if (newCleanText.length > this.currentCleanText.length) {
                this.currentCleanText = newCleanText;
            }
        }
    }

    /**
     * Start typewriter effect
     */
    startTypewriter(text) {
        if (!text) return;

        this.isTyping = true;
        this.hasStartedTypingThisTurn = true;

        this.ui.showNextIndicator(false);
        this.ui.showUserPrompt(false);

        // Parse speaker tag
        const nameMatch = text.match(/^\[(.*?)\]\s*:/);
        if (nameMatch) {
            const speaker = nameMatch[1].toLowerCase();
            this.ui.updateNamebox(nameMatch[1]);
            this.currentCleanText = text.replace(/^\[.*?\]\s*:/, '').trim();

            // Update sprite
            if (this.PersonaLibrary[speaker] && this.PersonaLibrary[speaker].blobUrl) {
                this.ui.updateSprite(this.PersonaLibrary[speaker].blobUrl);
            }
        } else {
            this.ui.updateNamebox(null);
            this.ui.updateSprite(null);
            this.currentCleanText = text;
        }

        this.ui.updateText('');

        if (this.isSkipActive) {
            this.finishTyping();
        } else {
            this.typewriterStartTime = null;
            requestAnimationFrame(this.animateTypewriter.bind(this));
        }
    }

    /**
     * Animate typewriter effect
     */
    animateTypewriter(timestamp) {
        if (!this.isTyping || this.isSkipActive) return;

        if (!this.typewriterStartTime) {
            this.typewriterStartTime = timestamp;
        }

        const elapsed = timestamp - this.typewriterStartTime;
        const charCount = Math.floor((elapsed / 1000) * this.CHARS_PER_SECOND);

        if (charCount < this.currentCleanText.length) {
            this.ui.updateText(this.currentCleanText.substring(0, charCount));
            requestAnimationFrame(this.animateTypewriter.bind(this));
        } else {
            this.finishTyping();
        }
    }

    /**
     * Finish typing immediately
     */
    finishTyping() {
        this.isTyping = false;
        this.ui.updateText(this.currentCleanText);

        const speakerName = this.ui.elements.nameBox.classList.contains('active')
            ? this.ui.elements.nameBox.textContent
            : 'Narrator';

        this.messageHistory.push({ speaker: speakerName, text: this.currentCleanText });

        if (this.currentPageIndex < this.currentPages.length - 1) {
            this.ui.showNextIndicator(true);
            if (this.isSkipActive) {
                setTimeout(() => this.advance(), 50);
            }
        } else if (!document.querySelector('button[aria-label="Stop response"]')) {
            this.ui.showUserPrompt(true);
        }
    }

    /**
     * Advance to next page
     */
    advance() {
        if (this.ui.isMenuOpen || this.ui.elements.backlogContainer.classList.contains('visible')) {
            return;
        }

        if (this.isTyping) {
            this.finishTyping();
        } else if (this.currentPageIndex < this.currentPages.length - 1) {
            this.currentPageIndex++;
            this.startTypewriter(this.currentPages[this.currentPageIndex]);
        }
    }

    /**
     * Toggle skip mode
     */
    toggleSkip() {
        this.isSkipActive = !this.isSkipActive;
        this.ui.updateSkipButton(this.isSkipActive);

        if (this.isSkipActive && this.isTyping) {
            this.finishTyping();
        }
    }

    /**
     * Toggle VN mode
     */
    toggleVnMode() {
        this.isVnMode = !this.isVnMode;
        this.ui.toggleVisibility(this.isVnMode);
    }

    /**
     * Load background image
     */
    async loadBackground() {
        const url = 'https://i.postimg.cc/W3xR61yr/Gemini-Generated-Image-6lymkg6lymkg6lym.png';
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            this.ui.setBackground(blobUrl);
        } catch (error) {
            console.error('Failed to load background:', error);
        }
    }

    /**
     * Load sprite blob
     */
    async loadSprite(speakerKey) {
        const persona = this.PersonaLibrary[speakerKey];
        if (!persona || persona.blobUrl) return;

        try {
            const response = await fetch(persona.url);
            const blob = await response.blob();
            persona.blobUrl = URL.createObjectURL(blob);
        } catch (error) {
            console.error(`Failed to load sprite for ${speakerKey}:`, error);
        }
    }
}

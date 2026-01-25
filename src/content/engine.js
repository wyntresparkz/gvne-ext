/**
 * Engine Module
 * Main controller that coordinates Parser and UI
 */

import { Parser } from './parser.js';
import { UIManager } from './ui.js';
import { HistoryManager } from './history.js';
import { LoadDialog } from './load-dialog.js';
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

        // Metadata State (for Save & Debug)
        this.detectedSpeakers = new Set();
        this.detectedLocations = new Set();

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
        this.historyManager = new HistoryManager();
        this.loadDialog = new LoadDialog(
            this.historyManager,
            (chat) => this.handleLoadChat(chat)
        );

        this.ui = new UIManager({
            onAdvance: this.advance.bind(this),
            onToggleSkip: this.toggleSkip.bind(this),
            onToggleVnMode: this.toggleVnMode.bind(this),
            onOpenLoadDialog: () => this.loadDialog.open(),
            onSaveGame: this.handleSaveGame.bind(this),
            isVnMode: () => this.isVnMode,
            getMessageHistory: () => this.messageHistory,
            getDebugState: () => ({
                speakers: Array.from(this.detectedSpeakers),
                locations: Array.from(this.detectedLocations)
            }),
        });
    }

    /**
     * Scan current text (code blocks + pages) for metadata tags
     */
    scanForMetadata() {
        // Combine code blocks and visible pages for scanning
        const sourceTexts = [...this.parser.currentCodeBlocks, ...this.currentPages];

        // Regex patterns
        // [Name Tag] :
        const speakerRegex = /\[(.*?)\]\s*:/g;
        // [{Location}]
        const locationRegex = /\[\s*\{(.*?)\}\s*\]/g;

        // We don't clear sets here because we want to accumulate over the turn, 
        // OR should we clear them per update? 
        // Usually per turn is safer, but `handleMessageUpdate` runs multiple times per turn.
        // Let's clear and re-scan current content to avoid stale partials.
        this.detectedSpeakers.clear();
        this.detectedLocations.clear();

        sourceTexts.forEach(text => {
            // Check for speakers (global search)
            let speakerMatch;
            while ((speakerMatch = speakerRegex.exec(text)) !== null) {
                this.detectedSpeakers.add(speakerMatch[1].trim());
            }

            // Check for locations (global search)
            let locationMatch;
            while ((locationMatch = locationRegex.exec(text)) !== null) {
                this.detectedLocations.add(locationMatch[1].trim());
            }
        });
    }

    /**
     * Handle save game request
     */
    handleSaveGame() {
        // 1. Refresh metadata scan to be sure
        this.scanForMetadata();

        // 2. Format Persona string (Person1&Person2)
        const speakerList = Array.from(this.detectedSpeakers);
        let personaStr = '[Unknown]';

        if (speakerList.length > 0) {
            // Join generic speakers with '&'
            personaStr = speakerList.map(s => `[${s}]`).join('&');
        } else if (this.ui.elements.nameBox.textContent) {
            // Fallback to currently active speaker in UI if no tag found
            personaStr = `[${this.ui.elements.nameBox.textContent}]`;
        }

        // 3. Format Location string (Last found location or Unknown)
        let locationStr = '[Unknown]';
        if (this.detectedLocations.size > 0) {
            // Convert Set to Array and take the last one added
            const locArray = Array.from(this.detectedLocations);
            locationStr = `[${locArray[locArray.length - 1]}]`;
        }

        // 4. Generate Timestamp
        const timestamp = new Date().toLocaleString('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        // 5. Construct Save String
        // Format: [SAVE] | [Persona1]&[Persona2] | [Location] | ${timestamp}
        const saveString = `[SAVE] | ${personaStr} | ${locationStr} | ${timestamp}`;
        this.ui.automateSave(saveString);
    }

    /**
     * Initialize the engine
     */
    async init() {
        this.ui.init();
        this.parser.init();

        // Initialize persistent history
        await this.historyManager.init();

        // Load background and sprites
        await this.loadBackground();
        await this.loadSprite('coder bunny');

        // Listen for settings updates
        browser.runtime.onMessage.addListener((message) => {
            if (message.type === 'SETTINGS_UPDATED') {
                this.handleSettingsUpdate(message.settings);
            }
        });
    }

    /**
     * Handle settings updates
     */
    handleSettingsUpdate(settings) {
        if (settings.vnMode !== undefined) {
            this.isVnMode = settings.vnMode;
            this.ui.toggleVisibility(this.isVnMode);
        }
        if (settings.skipMode !== undefined) {
            this.isSkipActive = settings.skipMode;
            this.ui.updateSkipButton(this.isSkipActive);
        }
        if (settings.textSpeed !== undefined) {
            this.CHARS_PER_SECOND = settings.textSpeed;
        }
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

        // Update metadata for debug/save
        this.scanForMetadata();

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

    /**
     * Handle chat loading from load dialog
     */
    handleLoadChat(chat) {
        console.log('[GVNE] Loading chat:', chat.title);
        this.historyManager.loadChat(chat.url);
    }
}

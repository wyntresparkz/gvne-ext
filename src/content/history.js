/**
 * History Module
 * Handles scraping and managing Gemini chat history with persistence
 */

import browser from '../utils/browser.js';

export class HistoryManager {
    constructor() {
        this.cachedHistory = [];
        this.lastScrapeTime = 0;
        this.CACHE_DURATION = 5000; // 5 seconds
        this.STORAGE_KEY = 'gvne_history';
    }

    /**
     * Initialize history manager
     */
    async init() {
        await this.loadFromStorage();
    }

    /**
     * Load history from browser storage
     */
    async loadFromStorage() {
        try {
            const result = await browser.storage.local.get(this.STORAGE_KEY);
            if (result[this.STORAGE_KEY]) {
                this.cachedHistory = result[this.STORAGE_KEY];
                console.log(`[GVNE] Loaded ${this.cachedHistory.length} chats from storage`);
            }
        } catch (e) {
            console.error('[GVNE] Failed to load history:', e);
        }
    }

    /**
     * Save current history to storage
     */
    async saveToStorage() {
        try {
            const data = {};
            data[this.STORAGE_KEY] = this.cachedHistory;
            await browser.storage.local.set(data);
        } catch (e) {
            console.error('[GVNE] Failed to save history:', e);
        }
    }

    /**
     * Scrape chat history from Gemini sidebar
     */
    scrapeHistory() {
        const conversations = document.querySelectorAll('a.conversation');

        const scraped = Array.from(conversations).map(el => {
            const titleEl = el.querySelector('.conversation-title');
            const pinIcon = el.querySelector('.conversation-pin-icon');

            return {
                id: el.getAttribute('href')?.replace('/app/', '') || '',
                title: titleEl?.innerText.trim() || 'Untitled Chat',
                url: el.getAttribute('href') || '',
                isPinned: !!pinIcon,
                isActive: el.classList.contains('selected'),
                lastSeen: Date.now()
            };
        }).filter(chat => chat.url);

        // Merge scraped data with cached data to preserve history not currently visible
        this.mergeHistory(scraped);
        this.lastScrapeTime = Date.now();

        // Persist update
        this.saveToStorage();

        return this.cachedHistory;
    }

    /**
     * Merge new scraped data with existing history
     * Updates existing entries and adds new ones
     */
    mergeHistory(newItems) {
        const map = new Map(this.cachedHistory.map(item => [item.id, item]));

        newItems.forEach(item => {
            map.set(item.id, item);
        });

        this.cachedHistory = Array.from(map.values());
    }

    /**
     * Get history with caching
     */
    getHistory(forceRefresh = false) {
        const now = Date.now();
        const cacheExpired = (now - this.lastScrapeTime) > this.CACHE_DURATION;

        if (forceRefresh || cacheExpired) {
            return this.scrapeHistory();
        }

        return this.cachedHistory;
    }

    /**
     * Navigate to a specific chat
     */
    loadChat(chatUrl) {
        if (!chatUrl) return;

        // Use full URL if it's a relative path
        if (chatUrl.startsWith('/')) {
            window.location.href = window.location.origin + chatUrl;
        } else {
            window.location.href = chatUrl;
        }
    }

    /**
     * Search/filter history
     */
    filterHistory(query) {
        // Trigger a fresh scrape if searching to ensure latest data
        this.getHistory(false);

        if (!query || query.trim() === '') return this.cachedHistory;

        const lowerQuery = query.toLowerCase();
        return this.cachedHistory.filter(chat =>
            chat.title.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * Get sorted history (pinned first, then by active state, then by recency)
     */
    getSortedHistory() {
        const history = this.getHistory();
        return history.sort((a, b) => {
            // Pinned chats first
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;

            // Active chat next
            if (a.isActive && !b.isActive) return -1;
            if (!a.isActive && b.isActive) return 1;

            // Then by most recently seen/scraped
            return (b.lastSeen || 0) - (a.lastSeen || 0);
        });
    }
}

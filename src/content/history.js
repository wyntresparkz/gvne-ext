/**
 * History Module
 * Handles scraping and managing Gemini chat history
 */

export class HistoryManager {
    constructor() {
        this.cachedHistory = [];
        this.lastScrapeTime = 0;
        this.CACHE_DURATION = 5000; // 5 seconds
    }

    /**
     * Scrape chat history from Gemini sidebar
     */
    scrapeHistory() {
        const conversations = document.querySelectorAll('a.conversation');
        
        this.cachedHistory = Array.from(conversations).map(el => {
            const titleEl = el.querySelector('.conversation-title');
            const pinIcon = el.querySelector('.conversation-pin-icon');
            
            return {
                id: el.getAttribute('href')?.replace('/app/', '') || '',
                title: titleEl?.innerText.trim() || 'Untitled Chat',
                url: el.getAttribute('href') || '',
                isPinned: !!pinIcon,
                isActive: el.classList.contains('selected')
            };
        }).filter(chat => chat.url); // Filter out any invalid entries

        this.lastScrapeTime = Date.now();
        return this.cachedHistory;
    }

    /**
     * Get history with caching
     */
    getHistory(forceRefresh = false) {
        const now = Date.now();
        const cacheExpired = (now - this.lastScrapeTime) > this.CACHE_DURATION;

        if (forceRefresh || cacheExpired || this.cachedHistory.length === 0) {
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
        const history = this.getHistory();
        if (!query || query.trim() === '') return history;

        const lowerQuery = query.toLowerCase();
        return history.filter(chat => 
            chat.title.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * Get sorted history (pinned first, then by active state)
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
            
            return 0;
        });
    }
}

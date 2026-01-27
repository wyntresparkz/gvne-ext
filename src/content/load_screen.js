/**
 * Load Screen Module
 * Enhanced visual save browser with pagination and dynamic assets
 */

const AssetMap = {
    backgrounds: {
        "digital void": "https://i.postimg.cc/W3xR61yr/Gemini-Generated-Image-6lymkg6lymkg6lym.png", // Placeholder
        "bedroom": "https://i.postimg.cc/W3xR61yr/Gemini-Generated-Image-6lymkg6lymkg6lym.png",   // Placeholder
        "default": "https://i.postimg.cc/W3xR61yr/Gemini-Generated-Image-6lymkg6lymkg6lym.png" // Placeholder
    },
    sprites: {
        "coder bunny": {
            "default": "https://i.postimg.cc/gkwshHMP/coderbunnyneutral.png",
            "sad": "https://i.postimg.cc/gkwshHMP/coderbunnyneutral.png" // Stub
        }
    },
    // Main screen background
    screenBackground: "https://i.postimg.cc/W3xR61yr/Gemini-Generated-Image-6lymkg6lymkg6lym.png" // Placeholder
};

export class LoadScreen {
    constructor(historyManager, onLoadCallback) {
        this.historyManager = historyManager;
        this.onLoadCallback = onLoadCallback;
        this.element = null;
        this.currentPage = 0;
        this.itemsPerPage = 5;
        this.saves = [];
        this.isOpen = false;
    }

    /**
     * Parse save string for metadata
     * Format: [SAVE] | [Persona] | [Location] | Timestamp
     */
    parseSaveString(saveName) {
        const parts = saveName.split('|').map(s => s.trim());

        // Defaults
        const data = {
            raw: saveName,
            names: [],
            mood: 'default',
            location: 'Unknown',
            date: parts[3] || 'Unknown Date',
            bgUrl: AssetMap.backgrounds.default,
            spriteUrl: null
        };

        // Parse Persona: [Name1]&[Name2]
        if (parts[1]) {
            // Remove brackets
            const cleanPersonas = parts[1].replace(/[\[\]]/g, '');
            data.names = cleanPersonas.split('&').map(n => n.trim());

            // Detect Mood in first persona (Stub)
            // Example: "Coder Bunny (Sad)" -> Name: "coder bunny", Mood: "sad"
            const firstPersona = data.names[0].toLowerCase();
            if (firstPersona.includes('(')) {
                const match = firstPersona.match(/(.*?)\s*\((.*?)\)/);
                if (match) {
                    const baseName = match[1].trim();
                    const mood = match[2].trim();

                    if (AssetMap.sprites[baseName]) {
                        data.spriteUrl = AssetMap.sprites[baseName][mood] || AssetMap.sprites[baseName]['default'];
                    }
                }
            } else {
                if (AssetMap.sprites[firstPersona]) {
                    data.spriteUrl = AssetMap.sprites[firstPersona]['default'];
                }
            }
        }

        // Parse Location
        if (parts[2]) {
            const loc = parts[2].replace(/[\[\]]/g, '').trim();
            data.location = loc;
            const locKey = loc.toLowerCase();
            if (AssetMap.backgrounds[locKey]) {
                data.bgUrl = AssetMap.backgrounds[locKey];
            }
        }

        return data;
    }

    /**
     * Initialize DOM elements
     */
    init() {
        const overlay = document.createElement('div');
        overlay.id = 'vn-load-screen';

        // Background stub
        const bg = document.createElement('div');
        bg.className = 'vn-load-screen-bg';
        bg.style.backgroundImage = `url('${AssetMap.screenBackground}')`;
        overlay.appendChild(bg);

        // Content Container
        const content = document.createElement('div');
        content.className = 'vn-load-content';

        // Header
        const header = document.createElement('h1');
        header.textContent = 'CONTINUE STORY';
        content.appendChild(header);

        // Cards Container
        const cardList = document.createElement('div');
        cardList.className = 'vn-load-cards';
        this.cardList = cardList;
        content.appendChild(cardList);

        // Pagination Controls
        const pagination = document.createElement('div');
        pagination.className = 'vn-load-pagination';

        const prevBtn = document.createElement('button');
        prevBtn.textContent = '◀ PREV';
        prevBtn.onclick = () => this.changePage(-1);

        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'NEXT ▶';
        nextBtn.onclick = () => this.changePage(1);

        const closeBtn = document.createElement('button');
        closeBtn.className = 'vn-load-close';
        closeBtn.textContent = 'BACK';
        closeBtn.onclick = () => this.hide();

        pagination.append(prevBtn, nextBtn, closeBtn);
        content.appendChild(pagination);

        overlay.appendChild(content);
        document.body.appendChild(overlay);
        this.element = overlay;
    }

    /**
     * Show the screen
     */
    show() {
        if (!this.element) this.init();

        // Refresh Saves (Force Scrape to ensure order is correct)
        this.historyManager.getHistory(true);
        const history = this.historyManager.getSortedHistory();
        this.saves = history.filter(chat => chat.title.startsWith('[SAVE]'));

        this.currentPage = 0;
        this.renderPage();

        this.element.classList.add('active');
        this.isOpen = true;
    }

    /**
     * Hide the screen
     */
    hide() {
        if (this.element) {
            this.element.classList.remove('active');
            this.isOpen = false;
        }
    }

    /**
     * Change Page
     */
    changePage(delta) {
        const maxPage = Math.ceil(this.saves.length / this.itemsPerPage) - 1;
        const newPage = this.currentPage + delta;

        if (newPage >= 0 && newPage <= maxPage) {
            this.currentPage = newPage;
            this.renderPage();
        }
    }

    /**
     * Render current page of cards
     */
    renderPage() {
        this.cardList.innerHTML = '';

        const start = this.currentPage * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const pageItems = this.saves.slice(start, end);

        // 1. Render Actual Saves
        pageItems.forEach(save => {
            const metadata = this.parseSaveString(save.title);
            const card = this.createCard(save, metadata);
            this.cardList.appendChild(card);
        });

        // 2. Render Empty Slots
        const emptyCount = this.itemsPerPage - pageItems.length;
        for (let i = 0; i < emptyCount; i++) {
            const slot = document.createElement('div');
            slot.className = 'vn-save-card empty';
            this.cardList.appendChild(slot);
        }
    }

    /**
     * Create a Save Card Element
     */
    createCard(save, metadata) {
        const card = document.createElement('div');
        card.className = 'vn-save-card';
        card.onclick = () => {
            this.onLoadCallback(save);
            this.hide();
        };

        // Background Layer (Masked by CSS container)
        const bgLayer = document.createElement('div');
        bgLayer.className = 'vn-card-bg';
        bgLayer.style.backgroundImage = `url('${metadata.bgUrl}')`;
        card.appendChild(bgLayer);

        // Sprite Layer
        if (metadata.spriteUrl) {
            const sprite = document.createElement('img');
            sprite.className = 'vn-card-sprite';
            sprite.src = metadata.spriteUrl;
            card.appendChild(sprite);
        }

        // Info Layer
        const info = document.createElement('div');
        info.className = 'vn-card-info';

        const name = document.createElement('div');
        name.className = 'vn-card-name';
        name.textContent = metadata.names.join(' & ') || 'Unknown';

        const location = document.createElement('div');
        location.className = 'vn-card-location';
        location.textContent = metadata.location;

        const date = document.createElement('div');
        date.className = 'vn-card-date';
        date.textContent = metadata.date;

        info.append(name, location, date);
        card.appendChild(info);

        return card;
    }
}

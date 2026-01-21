/**
 * Load Dialog Module
 * Reusable dialog for loading chat history
 */

export class LoadDialog {
    constructor(historyManager, onLoadCallback) {
        this.historyManager = historyManager;
        this.onLoadCallback = onLoadCallback;
        this.elements = {};
        this.isOpen = false;
        this.currentFilter = '';
    }

    /**
     * Create the load dialog UI
     */
    create() {
        // Main container
        const container = document.createElement('div');
        container.id = 'vn-load-dialog';
        container.className = 'vn-dialog-container';

        // Dialog box
        const dialog = document.createElement('div');
        dialog.className = 'vn-dialog';

        // Header
        const header = document.createElement('div');
        header.className = 'vn-dialog-header';

        const title = document.createElement('h2');
        title.textContent = 'Load Chat';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'vn-dialog-close';
        closeBtn.textContent = '✖';
        closeBtn.onclick = () => this.close();

        header.append(title, closeBtn);

        // Search box
        const searchBox = document.createElement('div');
        searchBox.className = 'vn-dialog-search';

        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Search chats...';
        searchInput.className = 'vn-search-input';
        searchInput.oninput = (e) => this.handleSearch(e.target.value);

        searchBox.appendChild(searchInput);

        // Chat list
        const listContainer = document.createElement('div');
        listContainer.className = 'vn-dialog-list';

        const chatList = document.createElement('div');
        chatList.className = 'vn-chat-list';

        listContainer.appendChild(chatList);

        // Footer
        const footer = document.createElement('div');
        footer.className = 'vn-dialog-footer';

        const refreshBtn = document.createElement('button');
        refreshBtn.className = 'vn-dialog-btn';
        refreshBtn.textContent = '🔄 Refresh';
        refreshBtn.onclick = () => this.refresh();

        footer.appendChild(refreshBtn);

        // Assemble
        dialog.append(header, searchBox, listContainer, footer);
        container.appendChild(dialog);

        // Store references
        this.elements.container = container;
        this.elements.dialog = dialog;
        this.elements.searchInput = searchInput;
        this.elements.chatList = chatList;

        return container;
    }

    /**
     * Populate the chat list
     */
    populateList(chats = null) {
        const chatList = this.elements.chatList;
        chatList.innerHTML = '';

        const history = chats || this.historyManager.getSortedHistory();

        if (history.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'vn-empty-message';
            emptyMsg.textContent = this.currentFilter
                ? 'No chats found matching your search.'
                : 'No chat history found. Start a conversation first!';
            chatList.appendChild(emptyMsg);
            return;
        }

        history.forEach(chat => {
            const item = document.createElement('div');
            item.className = 'vn-chat-item';
            if (chat.isActive) item.classList.add('active');
            if (chat.isPinned) item.classList.add('pinned');

            const icon = document.createElement('span');
            icon.className = 'vn-chat-icon';
            icon.textContent = chat.isPinned ? '📌' : '💬';

            const titleEl = document.createElement('span');
            titleEl.className = 'vn-chat-title';
            titleEl.textContent = chat.title;

            const badge = document.createElement('span');
            badge.className = 'vn-chat-badge';
            if (chat.isActive) badge.textContent = 'Current';

            item.append(icon, titleEl, badge);

            item.onclick = () => this.selectChat(chat);

            chatList.appendChild(item);
        });
    }

    /**
     * Handle search input
     */
    handleSearch(query) {
        this.currentFilter = query;
        const filtered = this.historyManager.filterHistory(query);
        this.populateList(filtered);
    }

    /**
     * Refresh the list
     */
    refresh() {
        this.historyManager.getHistory(true); // Force refresh
        this.currentFilter = '';
        this.elements.searchInput.value = '';
        this.populateList();
    }

    /**
     * Select a chat
     */
    selectChat(chat) {
        if (this.onLoadCallback) {
            this.onLoadCallback(chat);
        }
        this.close();
    }

    /**
     * Open the dialog
     */
    open() {
        if (this.isOpen) return;

        // Create if doesn't exist
        if (!this.elements.container) {
            const dialog = this.create();
            document.body.appendChild(dialog);
        }

        // Refresh and populate
        this.refresh();

        // Show
        this.elements.container.classList.add('active');
        this.isOpen = true;

        // Focus search
        setTimeout(() => this.elements.searchInput.focus(), 100);
    }

    /**
     * Close the dialog
     */
    close() {
        if (!this.isOpen) return;

        this.elements.container.classList.remove('active');
        this.isOpen = false;
        this.currentFilter = '';
        this.elements.searchInput.value = '';
    }

    /**
     * Toggle dialog
     */
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
}

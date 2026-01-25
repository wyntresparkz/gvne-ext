/**
 * UI Manager Module
 * Handles all DOM creation and UI interactions
 */

export class UIManager {
    constructor(callbacks) {
        this.callbacks = callbacks;
        this.elements = {};
        this.isMenuOpen = false;
        this.menuSkipItem = null;
    }

    /**
     * Initialize and inject all UI elements
     */
    init() {
        this.createStage();
        this.createOverlay();
        this.createSpriteContainer();
        this.createBacklog();
        this.createSettingsMenu();
        this.createDialogueBox();
        this.createInputContainer();
        this.createFullscreenButton();
        this.createDebugButton();
        this.attachEventListeners();
    }

    /**
     * Create the main stage
     */
    createStage() {
        const stage = document.createElement('div');
        stage.id = 'vn-stage';
        // Regression Fix: Ensure stage doesn't block clicks on underlying page (splash screen)
        stage.style.pointerEvents = 'none';
        document.body.appendChild(stage);
        this.elements.stage = stage;
    }

    /**
     * Create overlay for backlog and menu
     */
    createOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'vn-overlay';
        this.elements.stage.appendChild(overlay);
        this.elements.overlay = overlay;
    }

    /**
     * Create sprite container
     */
    createSpriteContainer() {
        const spriteCont = document.createElement('div');
        spriteCont.id = 'vn-sprite-container';

        const activeSprite = document.createElement('img');
        activeSprite.className = 'vn-sprite';
        spriteCont.appendChild(activeSprite);

        this.elements.stage.appendChild(spriteCont);
        this.elements.spriteContainer = spriteCont;
        this.elements.activeSprite = activeSprite;
    }

    /**
     * Create backlog UI
     */
    createBacklog() {
        const backlogCont = document.createElement('div');
        backlogCont.id = 'vn-backlog-container';

        const backlogList = document.createElement('div');
        backlogList.id = 'vn-backlog-list';

        const backlogClose = document.createElement('button');
        backlogClose.id = 'vn-backlog-close';
        backlogClose.textContent = 'Return to Game';

        backlogCont.append(backlogList, backlogClose);
        this.elements.overlay.appendChild(backlogCont);

        this.elements.backlogContainer = backlogCont;
        this.elements.backlogList = backlogList;
        this.elements.backlogClose = backlogClose;

        // Event listener
        backlogClose.onclick = () => {
            backlogCont.classList.remove('visible');
            if (!this.isMenuOpen) {
                this.elements.overlay.classList.remove('active');
            }
        };
    }

    /**
     * Create settings menu
     */
    createSettingsMenu() {
        const menu = document.createElement('div');
        menu.id = 'vn-settings-menu';

        // Menu items
        const menuItems = ['Save', 'Load', 'History', 'Skip: OFF', 'Exit Engine'];
        menuItems.forEach((text, i) => {
            const item = document.createElement('div');
            item.className = 'vn-menu-item';
            item.textContent = text;
            item.style.transitionDelay = `${0.1 + i * 0.07}s`;

            if (text === 'Save') {
                item.onclick = (e) => {
                    e.stopPropagation();
                    this.callbacks.onSaveGame();
                };
            }

            if (text === 'History') {
                item.onclick = (e) => {
                    e.stopPropagation();
                    this.showBacklog();
                };
            }

            if (text === 'Load') {
                item.onclick = (e) => {
                    e.stopPropagation();
                    if (this.callbacks.onOpenLoadDialog) {
                        this.callbacks.onOpenLoadDialog();
                    }
                };
            }

            if (text.startsWith('Skip')) {
                item.onclick = (e) => {
                    e.stopPropagation();
                    this.callbacks.onToggleSkip();
                };
                this.menuSkipItem = item;
            }

            if (text === 'Exit Engine') {
                item.onclick = () => this.callbacks.onToggleVnMode();
            }

            menu.appendChild(item);
        });

        // Dev controls (sliders)
        const scaleSlider = this.createSlider('Scale:', 0.5, 3.0, 0.1, 1.0, (v) => {
            this.elements.activeSprite.style.transform = `scale(${v})`;
        }, 0);

        const offsetSlider = this.createSlider('Offset:', -500, 500, 5, 0, (v) => {
            this.elements.activeSprite.style.marginBottom = `${-v}px`;
        }, 1);

        menu.append(scaleSlider, offsetSlider);

        // Settings trigger
        const trigger = document.createElement('div');
        trigger.id = 'vn-settings-trigger';

        const sIcon = document.createElement('div');
        sIcon.id = 'vn-settings-icon';
        sIcon.textContent = '⚙️';

        const sLabel = document.createElement('div');
        sLabel.id = 'vn-settings-label';
        sLabel.textContent = 'OPTIONS';

        trigger.append(sIcon, sLabel);

        trigger.onclick = () => {
            this.isMenuOpen = !this.isMenuOpen;
            menu.classList.toggle('open');
            trigger.classList.toggle('open');
            this.elements.overlay.classList.toggle('active', this.isMenuOpen || this.elements.backlogContainer.classList.contains('visible'));

            [scaleSlider, offsetSlider].forEach((el) => {
                el.style.opacity = this.isMenuOpen ? '1' : '0';
                el.style.transform = this.isMenuOpen ? 'translateX(0)' : 'translateX(-20px)';
            });
        };

        this.elements.stage.append(trigger, menu);
        this.elements.settingsMenu = menu;
        this.elements.settingsTrigger = trigger;
        this.elements.scaleSlider = scaleSlider;
        this.elements.offsetSlider = offsetSlider;
    }

    /**
     * Create dialogue box
     */
    createDialogueBox() {
        const diagCont = document.createElement('div');
        diagCont.id = 'vn-dialogue-container';

        const diagBox = document.createElement('div');
        diagBox.id = 'vn-dialogue-box';

        const nameBox = document.createElement('div');
        nameBox.id = 'vn-namebox';

        const quickSkip = document.createElement('div');
        quickSkip.id = 'vn-quick-skip';
        quickSkip.textContent = 'SKIP';

        const textTarget = document.createElement('span');
        diagBox.appendChild(textTarget);

        const indicator = document.createElement('span');
        indicator.id = 'vn-next-indicator';
        indicator.textContent = '▼';
        diagBox.appendChild(indicator);

        const userPrompt = document.createElement('span');
        userPrompt.id = 'vn-user-prompt';
        userPrompt.textContent = '[ Waiting for Input ]';
        diagBox.appendChild(userPrompt);

        diagCont.append(nameBox, diagBox, quickSkip);
        this.elements.stage.appendChild(diagCont);

        this.elements.dialogueContainer = diagCont;
        this.elements.dialogueBox = diagBox;
        this.elements.nameBox = nameBox;
        this.elements.quickSkip = quickSkip;
        this.elements.textTarget = textTarget;
        this.elements.nextIndicator = indicator;
        this.elements.userPrompt = userPrompt;

        // Event listeners
        quickSkip.onclick = (e) => {
            e.stopPropagation();
            this.callbacks.onToggleSkip();
        };

        diagBox.onclick = () => this.callbacks.onAdvance();
    }

    /**
     * Create input container
     */
    createInputContainer() {
        const inputCont = document.createElement('div');
        inputCont.id = 'vn-input-container';

        const vnInput = document.createElement('input');
        vnInput.id = 'vn-input';
        vnInput.placeholder = 'Awaiting command...';

        const uploadBtn = document.createElement('button');
        uploadBtn.id = 'vn-upload-btn';
        uploadBtn.textContent = '📁';

        inputCont.append(vnInput, uploadBtn);
        this.elements.stage.appendChild(inputCont);

        this.elements.inputContainer = inputCont;
        this.elements.vnInput = vnInput;
        this.elements.uploadBtn = uploadBtn;

        // Event listener
        vnInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && vnInput.value.trim() !== '') {
                const val = vnInput.value;
                vnInput.value = '';
                inputCont.classList.remove('visible');
                this.elements.dialogueContainer.classList.remove('input-active');
                this.elements.textTarget.textContent = '...';

                const realInput = document.querySelector('.ql-editor');
                if (realInput) {
                    realInput.focus();
                    const p = document.createElement('p');
                    p.textContent = val;
                    realInput.appendChild(p);
                    realInput.dispatchEvent(new Event('input', { bubbles: true }));
                    setTimeout(() => realInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true })), 100);
                }
            }
        });
    }


    /**
     * Create debug button
     */
    createDebugButton() {
        const debugBtn = document.createElement('div');
        debugBtn.id = 'vn-debug-btn';
        debugBtn.textContent = '🐞';
        debugBtn.className = 'vn-debug-btn';

        // Style it inline to ensure visibility
        Object.assign(debugBtn.style, {
            position: 'fixed',
            bottom: '60px',
            right: '15px',
            zIndex: '10101',
            background: 'rgba(0,0,0,0.6)',
            border: '2px solid #ff00ff',
            color: '#ff00ff',
            padding: '10px',
            borderRadius: '50%',
            width: '35px',
            height: '35px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            cursor: 'pointer',
            backdropFilter: 'blur(5px)',
            pointerEvents: 'auto' // Important!
        });

        document.body.appendChild(debugBtn);
        this.elements.debugBtn = debugBtn;

        debugBtn.onmousedown = () => {
            const state = this.callbacks.getDebugState();
            const info = `Speakers: ${JSON.stringify(state.speakers)}\nLocations: ${JSON.stringify(state.locations)}`;
            alert(info);
        };
    }

    /**
     * Create fullscreen button for mobile
     */
    createFullscreenButton() {
        const fsBtn = document.createElement('div');
        fsBtn.id = 'vn-fullscreen-btn';
        fsBtn.textContent = '⛶';
        // Ensure it has pointer-events: auto since stage is none
        fsBtn.style.pointerEvents = 'auto';
        document.body.appendChild(fsBtn);

        this.elements.fullscreenBtn = fsBtn;

        const isMobile = () => {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                window.innerWidth <= 850 ||
                (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
        };

        const updateBtnVisibility = () => {
            fsBtn.style.display = isMobile() ? 'flex' : 'none';
        };

        updateBtnVisibility();
        window.addEventListener('resize', updateBtnVisibility);

        fsBtn.onclick = () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch((err) => {
                    console.log(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
                });
                fsBtn.textContent = '✖';
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                    fsBtn.textContent = '⛶';
                }
            }
        };

        document.addEventListener('fullscreenchange', () => {
            if (!document.fullscreenElement) {
                fsBtn.textContent = '⛶';
            } else {
                fsBtn.textContent = '✖';
            }
        });
    }

    /**
     * Create a slider control
     */
    createSlider(label, min, max, step, val, callback, index) {
        const wrap = document.createElement('div');
        wrap.className = 'vn-dev-control';
        wrap.style.transitionDelay = `${0.45 + index * 0.07}s`;

        const head = document.createElement('div');
        head.className = 'vn-control-header';

        const lbl = document.createElement('span');
        lbl.textContent = label;

        const vTxt = document.createElement('span');
        vTxt.textContent = val;

        head.append(lbl, vTxt);

        const inp = document.createElement('input');
        inp.type = 'range';
        inp.min = min;
        inp.max = max;
        inp.step = step;
        inp.value = val;

        inp.oninput = (e) => {
            vTxt.textContent = e.target.value;
            callback(e.target.value);
        };

        wrap.append(head, inp);
        return wrap;
    }

    /**
     * Attach global event listeners
     */
    attachEventListeners() {
        // Overlay click to close menu
        this.elements.overlay.onclick = () => {
            if (this.isMenuOpen) {
                this.elements.settingsTrigger.click();
            }
        };

        // Keyboard shortcuts
        window.onkeydown = (e) => {
            if (e.key === 'Escape') {
                this.callbacks.onToggleVnMode();
            }

            if (
                this.callbacks.isVnMode() &&
                (e.key === ' ' || e.key === 'ArrowRight') &&
                !this.isMenuOpen &&
                !this.elements.backlogContainer.classList.contains('visible') &&
                document.activeElement !== this.elements.vnInput
            ) {
                this.callbacks.onAdvance();
            }
        };
    }

    /**
     * Show backlog with message history
     */
    showBacklog() {
        const backlogList = this.elements.backlogList;
        while (backlogList.firstChild) {
            backlogList.removeChild(backlogList.firstChild);
        }

        this.callbacks.getMessageHistory().forEach((entry) => {
            const div = document.createElement('div');
            div.className = 'backlog-entry';

            const speaker = document.createElement('div');
            speaker.className = 'backlog-speaker';
            speaker.textContent = entry.speaker;

            const text = document.createElement('div');
            text.textContent = entry.text;

            div.append(speaker, text);
            backlogList.appendChild(div);
        });

        this.elements.backlogContainer.classList.add('visible');
        this.elements.overlay.classList.add('active');
    }

    /**
     * Automate chat renaming/saving
     */
    async automateSave(saveName) {
        console.log('[GVNE] Automating save...');
        const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        // 1. Open Header Menu
        const menuBtn = document.querySelector('button.conversation-actions-menu-button');
        if (!menuBtn) {
            console.error('[GVNE] Header menu button not found');
            return;
        }
        menuBtn.click();
        await wait(600);

        // 2. Check for Pin/Unpin
        const menuItems = document.querySelectorAll('button.mat-mdc-menu-item');
        const pinBtn = Array.from(menuItems).find(el => el.textContent.includes('Pin'));
        const unpinBtn = Array.from(menuItems).find(el => el.textContent.includes('Unpin'));

        if (pinBtn) {
            // --- PIN FLOW (Rename inside Pin Dialog) ---
            console.log('[GVNE] Pinning and Renaming...');
            pinBtn.click();
            await wait(1000); // Wait for Pin Dialog

            // Find Input in Dialog
            const input = document.querySelector('mat-dialog-container input');
            if (input) {
                console.log('[GVNE] Setting name in Pin dialog...');
                input.focus();
                input.value = '';
                input.dispatchEvent(new Event('input', { bubbles: true }));
                await wait(100);

                input.value = saveName;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
                await wait(500); // Validation wait
            } else {
                console.warn('[GVNE] Input not found in Pin dialog, proceeding with default name');
            }

            // Confirm "Pin"
            const dialogButtons = document.querySelectorAll('.mat-mdc-dialog-actions button');
            const confirmBtn = Array.from(dialogButtons).find(btn =>
                btn.textContent.trim().toLowerCase() === 'pin'
            );

            if (confirmBtn) {
                confirmBtn.click();
                console.log('[GVNE] Pin/Save complete');
            } else {
                console.error('[GVNE] Pin confirm button not found');
            }

        } else if (unpinBtn) {
            // --- RENAME FLOW (Already Pinned) ---
            console.log('[GVNE] Chat already pinned, switching to Rename...');

            // Rename button should be in the currently open menu
            // Re-query to be safe
            const currentMenuItems = document.querySelectorAll('button.mat-mdc-menu-item');
            const renameBtn = Array.from(currentMenuItems).find(el => el.textContent.includes('Rename'));

            if (renameBtn) {
                renameBtn.click();
                await wait(1000);

                const input = document.querySelector('mat-dialog-container input');
                if (input) {
                    input.focus();
                    input.value = '';
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    await wait(100);

                    input.value = saveName;
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                    await wait(500);

                    const actions = document.querySelectorAll('.mat-mdc-dialog-actions button');
                    const confirm = Array.from(actions).find(el => el.textContent.includes('Rename'));
                    if (confirm) {
                        confirm.click();
                        console.log('[GVNE] Rename/Save complete');
                    } else {
                        console.error('[GVNE] Rename confirm button not found');
                    }
                } else {
                    console.error('[GVNE] Rename input not found');
                }
            } else {
                console.error('[GVNE] Rename button not found');
            }
        } else {
            console.warn('[GVNE] Neither Pin nor Unpin found');
        }
    }

    /**
     * Update skip button state
     */
    updateSkipButton(isActive) {
        this.elements.quickSkip.classList.toggle('active', isActive);
        if (this.menuSkipItem) {
            this.menuSkipItem.textContent = `Skip: ${isActive ? 'ON' : 'OFF'}`;
            this.menuSkipItem.classList.toggle('toggle-active', isActive);
        }
    }

    /**
     * Toggle VN mode visibility
     */
    toggleVisibility(isVisible) {
        this.elements.stage.classList.toggle('vn-hidden', !isVisible);
    }

    /**
     * Set background image
     */
    setBackground(url) {
        this.elements.stage.style.backgroundImage = `url('${url}')`;
    }

    /**
     * Update sprite
     */
    updateSprite(blobUrl) {
        if (blobUrl) {
            this.elements.activeSprite.src = blobUrl;
            this.elements.activeSprite.classList.add('active');
        } else {
            this.elements.activeSprite.classList.remove('active');
        }
    }

    /**
     * Update namebox
     */
    updateNamebox(name) {
        if (name) {
            this.elements.nameBox.textContent = name;
            this.elements.nameBox.classList.add('active');
        } else {
            this.elements.nameBox.classList.remove('active');
        }
    }

    /**
     * Update text display
     */
    updateText(text) {
        this.elements.textTarget.textContent = text;
    }

    /**
     * Show/hide indicators
     */
    showNextIndicator(show) {
        this.elements.nextIndicator.classList.toggle('show-indicator', show);
    }

    showUserPrompt(show) {
        this.elements.userPrompt.classList.toggle('show-indicator', show);
        this.elements.inputContainer.classList.toggle('visible', show);
        this.elements.dialogueContainer.classList.toggle('input-active', show);
    }
}

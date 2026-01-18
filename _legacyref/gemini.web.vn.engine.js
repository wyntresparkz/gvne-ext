// ==UserScript==
// @name         Gemini Visual Novel Engine
// @namespace    http://tampermonkey.net/
// @version      0.7.9.1
// @description  VN Engine - Fixed Stream Truncation & Incremental Build
// @author       Wyntresparkz & CodeBunny - Co-Authored by Claude
// @match        https://gemini.google.com/*
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @connect      i.postimg.cc
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    const PersonaLibrary = {
        "coder bunny": {
            url: "https://i.postimg.cc/gkwshHMP/coderbunnyneutral.png",
            blobUrl: null
        }
    };

    let isVnMode = true;
    let isMenuOpen = false;
    let isSkipActive = false;
    let messageHistory = [];
    let textBuffer = "";
    let currentPages = [];
    let currentPageIndex = 0;
    let isTyping = false;
    let lastProcessedElement = null;
    let hasStartedTypingThisTurn = false;
    let currentCleanText = "";
    let observer = null;
    let typewriterStartTime = null;
    const CHARS_PER_SECOND = 40;

    GM_addStyle(`
        #vn-stage { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%); background-size: cover; background-position: center; z-index: 10000; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; padding-bottom: 25px; box-sizing: border-box; }
        #vn-overlay { position: absolute; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.6); z-index: 10080; opacity: 0; pointer-events: none; transition: opacity 0.4s ease; display: flex; align-items: center; justify-content: center; }
        #vn-overlay.active { opacity: 1; pointer-events: auto; }
        #vn-backlog-container { width: 70%; height: 80%; background: rgba(0,0,0,0.9); border: 2px solid #4e4e91; border-radius: 15px; padding: 40px; display: none; flex-direction: column; gap: 20px; z-index: 10085; }
        #vn-backlog-container.visible { display: flex; }
        #vn-backlog-list { flex: 1; overflow-y: auto; padding-right: 15px; display: flex; flex-direction: column; gap: 15px; font-family: 'Segoe UI', sans-serif; color: #fff; }
        .backlog-entry { font-size: 1.2rem; border-bottom: 1px solid rgba(78, 78, 145, 0.3); padding-bottom: 10px; }
        .backlog-speaker { color: #0f0; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; font-size: 0.9rem; letter-spacing: 1px; }
        #vn-backlog-close { align-self: center; background: #4e4e91; color: #fff; border: none; padding: 10px 30px; border-radius: 5px; cursor: pointer; font-family: 'Segoe UI', sans-serif; transition: 0.3s; }
        #vn-backlog-close:hover { background: #0f0; color: #000; }
        #vn-sprite-container { position: absolute; bottom: 0; width: 100%; height: 100%; display: flex; justify-content: flex-end; align-items: flex-end; pointer-events: none; z-index: 10002; overflow: hidden; padding-right: 15%; }
        .vn-sprite { max-height: 100%; transition: opacity 0.5s ease; opacity: 0; transform-origin: bottom center; }
        .vn-sprite.active { opacity: 1; }
        #vn-settings-trigger { position: absolute; top: 25px; left: 25px; cursor: pointer; z-index: 10100; display: flex; align-items: center; gap: 15px; color: #fff; font-family: 'Segoe UI', sans-serif; pointer-events: auto; }
        #vn-settings-icon { font-size: 2.5rem; transition: transform 0.4s ease; }
        #vn-settings-trigger:hover #vn-settings-icon { transform: rotate(90deg); color: #0f0; }
        #vn-settings-label { font-size: 1.5rem; opacity: 0; transform: translateX(-10px); transition: 0.3s; font-weight: bold; pointer-events: none; }
        #vn-settings-trigger.open #vn-settings-label { opacity: 1; transform: translateX(0); }
        #vn-settings-menu { position: absolute; top: 0; left: 0; width: 350px; height: 100%; background: linear-gradient(90deg, rgba(0,0,0,0.95) 0%, rgba(48,43,99,0.8) 100%); z-index: 10090; transform: translateX(-100%); transition: transform 0.3s ease-in-out; padding: 80px 40px; display: flex; flex-direction: column; gap: 10px; border-right: 2px solid #4e4e91; pointer-events: auto; }
        #vn-settings-menu.open { transform: translateX(0); }
        .vn-menu-item { color: #fff; font-size: 1.2rem; font-family: 'Segoe UI', sans-serif; padding: 10px; cursor: pointer; transition: 0.3s; opacity: 0; transform: translateX(-20px); }
        #vn-settings-menu.open .vn-menu-item { opacity: 1; transform: translateX(0); }
        .vn-menu-item:hover { color: #0f0; background: rgba(255,255,255,0.1); padding-left: 20px; }
        .vn-menu-item.toggle-active { color: #0f0; font-weight: bold; }
        #vn-quick-skip { position: absolute; bottom: 10px; left: 35px; font-size: 0.8rem; color: #555; font-family: 'Segoe UI', sans-serif; cursor: pointer; transition: all 0.3s ease; font-weight: bold; z-index: 10015; pointer-events: auto; letter-spacing: 1px; }
        #vn-quick-skip.active { color: #0f0; text-shadow: 0 0 8px #0f0; }
        .vn-dev-control { margin-top: 12px; padding: 0 12px; font-family: 'Segoe UI', sans-serif; color: #0f0; font-size: 0.9rem; transition: 0.3s; opacity: 0; transform: translateX(-20px); }
        .vn-control-header { display: flex; justify-content: space-between; margin-bottom: 5px; }
        .vn-dev-control input { width: 100%; cursor: pointer; accent-color: #0f0; }
        #vn-dialogue-container { position: relative; width: 80%; height: 220px; transition: margin-bottom 0.4s ease; z-index: 10010; }
        #vn-dialogue-box { position: relative; width: 100%; height: 100%; background: rgba(0,0,0,0.9); border: 3px solid #4e4e91; border-radius: 15px; padding: 35px; color: #fff; font-size: 1.9rem; pointer-events: auto; overflow: hidden; font-family: 'Segoe UI', sans-serif; line-height: 1.6; cursor: pointer; box-sizing: border-box; }
        #vn-namebox { position: absolute; top: -42px; left: 30px; background: rgba(0,0,0,0.9); color: #fff; padding: 5px 25px; border: 3px solid #4e4e91; border-bottom: none; border-radius: 12px 12px 0 0; font-size: 1.5rem; width: fit-content; min-width: 120px; opacity: 0; transform: translateY(20px); transition: 0.3s; z-index: 10005; }
        #vn-namebox.active { opacity: 1; transform: translateY(0); }
        #vn-dialogue-container.input-active { margin-bottom: 70px; }
        #vn-input-container { width: 80%; position: absolute; bottom: 25px; display: flex; gap: 10px; opacity: 0; transition: 0.4s; pointer-events: none; z-index: 10020; }
        #vn-input-container.visible { opacity: 1; pointer-events: auto; }
        #vn-input { flex: 1; background: #000; border: 2px solid #0f0; color: #0f0; padding: 12px; font-family: 'Courier New', monospace; outline: none; border-radius: 5px; box-shadow: 0 0 10px #0f0; font-size: 1.3rem; }
        #vn-upload-btn { background: #000; border: 2px solid #0f0; color: #0f0; padding: 12px 20px; cursor: pointer; border-radius: 5px; font-size: 1.3rem; }
        #vn-next-indicator, #vn-user-prompt { position: absolute; bottom: 15px; right: 25px; display: none; }
        #vn-next-indicator { font-size: 1.5rem; color: #4e4e91; animation: pulse-soft 2s infinite; }
        #vn-user-prompt { font-size: 1.1rem; color: #ff69b4; animation: pulse-soft 3s infinite; font-weight: bold; }
        .show-indicator { display: block !important; }
        .vn-hidden { display: none !important; }
        .google-ui-nuked { display: none !important; }
        #vn-fullscreen-btn { position: fixed; top: 15px; right: 15px; z-index: 10101; background: rgba(0,0,0,0.6); border: 2px solid #0f0; color: #0f0; padding: 10px; border-radius: 50%; width: 45px; height: 45px; display: none; align-items: center; justify-content: center; font-size: 1.5rem; cursor: pointer; backdrop-filter: blur(5px); }
        @keyframes pulse-soft { 0% { opacity: 0.2; } 50% { opacity: 0.7; } 100% { opacity: 0.2; } }
    `);

    const stage = document.createElement('div'); stage.id = 'vn-stage';
    const overlay = document.createElement('div'); overlay.id = 'vn-overlay';
    const spriteCont = document.createElement('div'); spriteCont.id = 'vn-sprite-container';
    const activeSprite = document.createElement('img'); activeSprite.className = 'vn-sprite';
    spriteCont.appendChild(activeSprite);

    const backlogCont = document.createElement('div'); backlogCont.id = 'vn-backlog-container';
    const backlogList = document.createElement('div'); backlogList.id = 'vn-backlog-list';
    const backlogClose = document.createElement('button'); backlogClose.id = 'vn-backlog-close';
    backlogClose.textContent = 'Return to Game';
    backlogCont.append(backlogList, backlogClose);
    overlay.appendChild(backlogCont);

    function showBacklog() {
        while (backlogList.firstChild) { backlogList.removeChild(backlogList.firstChild); }
        messageHistory.forEach(entry => {
            const div = document.createElement('div'); div.className = 'backlog-entry';
            const speaker = document.createElement('div'); speaker.className = 'backlog-speaker';
            speaker.textContent = entry.speaker;
            const text = document.createElement('div'); text.textContent = entry.text;
            div.append(speaker, text); backlogList.appendChild(div);
        });
        backlogCont.classList.add('visible'); overlay.classList.add('active');
    }

    backlogClose.onclick = () => { backlogCont.classList.remove('visible'); if (!isMenuOpen) overlay.classList.remove('active'); };

    const menu = document.createElement('div'); menu.id = 'vn-settings-menu';
    const menuSkipItem = { el: null };
    ['Save', 'Load', 'History', 'Skip: OFF', 'Exit Engine'].forEach((text, i) => {
        const item = document.createElement('div'); item.className = 'vn-menu-item'; item.textContent = text;
        item.style.transitionDelay = `${0.1 + (i * 0.07)}s`;
        if (text === 'History') item.onclick = (e) => { e.stopPropagation(); showBacklog(); };
        if (text.startsWith('Skip')) { item.onclick = (e) => { e.stopPropagation(); toggleSkip(); }; menuSkipItem.el = item; }
        if (text === 'Exit Engine') item.onclick = () => toggleVnMode();
        menu.appendChild(item);
    });

    const createSlider = (label, min, max, step, val, callback, index) => {
        const wrap = document.createElement('div'); wrap.className = 'vn-dev-control';
        wrap.style.transitionDelay = `${0.45 + (index * 0.07)}s`;
        const head = document.createElement('div'); head.className = 'vn-control-header';
        const lbl = document.createElement('span'); lbl.textContent = label;
        const vTxt = document.createElement('span'); vTxt.textContent = val;
        head.append(lbl, vTxt);
        const inp = document.createElement('input'); inp.type = 'range'; inp.min = min; inp.max = max; inp.step = step; inp.value = val;
        inp.oninput = (e) => { vTxt.textContent = e.target.value; callback(e.target.value); };
        wrap.append(head, inp); return wrap;
    };

    const scaleSlider = createSlider('Scale:', 0.5, 3.0, 0.1, 1.0, (v) => activeSprite.style.transform = `scale(${v})`, 0);
    const offsetSlider = createSlider('Offset:', -500, 500, 5, 0, (v) => activeSprite.style.marginBottom = `${-v}px`, 1);
    menu.append(scaleSlider, offsetSlider);

    const trigger = document.createElement('div'); trigger.id = 'vn-settings-trigger';
    const sIcon = document.createElement('div'); sIcon.id = 'vn-settings-icon'; sIcon.textContent = '⚙️';
    const sLabel = document.createElement('div'); sLabel.id = 'vn-settings-label'; sLabel.textContent = 'OPTIONS';
    trigger.append(sIcon, sLabel);

    trigger.onclick = () => {
        isMenuOpen = !isMenuOpen;
        menu.classList.toggle('open'); trigger.classList.toggle('open'); overlay.classList.toggle('active', isMenuOpen || backlogCont.classList.contains('visible'));
        [scaleSlider, offsetSlider].forEach(el => { el.style.opacity = isMenuOpen ? '1' : '0'; el.style.transform = isMenuOpen ? 'translateX(0)' : 'translateX(-20px)'; });
    };

    const diagCont = document.createElement('div'); diagCont.id = 'vn-dialogue-container';
    const diagBox = document.createElement('div'); diagBox.id = 'vn-dialogue-box';
    const nameBox = document.createElement('div'); nameBox.id = 'vn-namebox';
    const quickSkip = document.createElement('div'); quickSkip.id = 'vn-quick-skip'; quickSkip.textContent = 'SKIP';

    function toggleSkip() {
        isSkipActive = !isSkipActive; quickSkip.classList.toggle('active', isSkipActive);
        if (menuSkipItem.el) { menuSkipItem.el.textContent = `Skip: ${isSkipActive ? 'ON' : 'OFF'}`; menuSkipItem.el.classList.toggle('toggle-active', isSkipActive); }
        if (isSkipActive && isTyping) finishTyping();
    }
    quickSkip.onclick = (e) => { e.stopPropagation(); toggleSkip(); };

    const inputCont = document.createElement('div'); inputCont.id = 'vn-input-container';
    const vnInput = document.createElement('input'); vnInput.id = 'vn-input'; vnInput.placeholder = "Awaiting command...";
    const uploadBtn = document.createElement('button'); uploadBtn.id = 'vn-upload-btn'; uploadBtn.textContent = '📁';
    inputCont.append(vnInput, uploadBtn);

    diagCont.append(nameBox, diagBox, quickSkip);
    const textTarget = document.createElement('span'); diagBox.appendChild(textTarget);
    const indicator = document.createElement('span'); indicator.id = 'vn-next-indicator'; indicator.textContent = '▼'; diagBox.appendChild(indicator);
    const userPrompt = document.createElement('span'); userPrompt.id = 'vn-user-prompt'; userPrompt.textContent = '[ Waiting for Input ]'; diagBox.appendChild(userPrompt);

    stage.append(overlay, spriteCont, trigger, menu, diagCont, inputCont);
    document.body.appendChild(stage);

    vnInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && vnInput.value.trim() !== "") {
            const val = vnInput.value; vnInput.value = "";
            inputCont.classList.remove('visible'); diagCont.classList.remove('input-active'); textTarget.textContent = "...";
            const real = document.querySelector('.ql-editor');
            if (real) {
                real.focus(); const p = document.createElement('p'); p.textContent = val; real.appendChild(p);
                real.dispatchEvent(new Event('input', { bubbles: true }));
                setTimeout(() => real.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true })), 100);
            }
        }
    });

    function startTypewriter(text) {
        if (!text) return;
        isTyping = true; hasStartedTypingThisTurn = true;
        indicator.classList.remove('show-indicator'); userPrompt.classList.remove('show-indicator');
        inputCont.classList.remove('visible'); diagCont.classList.remove('input-active');
        const nameMatch = text.match(/^\[(.*?)\]\s*:/);
        if (nameMatch) {
            const speaker = nameMatch[1].toLowerCase();
            nameBox.textContent = nameMatch[1]; nameBox.classList.add('active');
            currentCleanText = text.replace(/^\[.*?\]\s*:/, '').trim();
            if (PersonaLibrary[speaker] && PersonaLibrary[speaker].blobUrl) { activeSprite.src = PersonaLibrary[speaker].blobUrl; activeSprite.classList.add('active'); }
        } else { nameBox.classList.remove('active'); activeSprite.classList.remove('active'); currentCleanText = text; }
        textTarget.textContent = "";
        if (isSkipActive) finishTyping(); else { typewriterStartTime = null; requestAnimationFrame(animateTypewriter); }
    }

    function animateTypewriter(timestamp) {
        if (!isTyping || isSkipActive) return;
        if (!typewriterStartTime) typewriterStartTime = timestamp;
        const elapsed = timestamp - typewriterStartTime;
        const charCount = Math.floor((elapsed / 1000) * CHARS_PER_SECOND);
        if (charCount < currentCleanText.length) { textTarget.textContent = currentCleanText.substring(0, charCount); requestAnimationFrame(animateTypewriter); }
        else { finishTyping(); }
    }

    function finishTyping() {
        isTyping = false; textTarget.textContent = currentCleanText;
        const speakerName = nameBox.classList.contains('active') ? nameBox.textContent : "Narrator";
        messageHistory.push({ speaker: speakerName, text: currentCleanText });
        if (currentPageIndex < currentPages.length - 1) { indicator.classList.add('show-indicator'); if (isSkipActive) setTimeout(advance, 50); }
        else if (!document.querySelector('button[aria-label="Stop response"]')) { userPrompt.classList.add('show-indicator'); inputCont.classList.add('visible'); diagCont.classList.add('input-active'); }
    }

    function advance() {
        if (isMenuOpen || backlogCont.classList.contains('visible')) return; if (isTyping) finishTyping();
        else if (currentPageIndex < currentPages.length - 1) { currentPageIndex++; startTypewriter(currentPages[currentPageIndex]); }
    }

    function processMessage(container) {
        const paragraphs = [];
        container.querySelectorAll('p, .citation').forEach(p => {
            if (p.classList.contains('citation')) { p.remove(); return; }
            const clone = p.cloneNode(true); clone.querySelectorAll('.code-block, code, pre, .modular-data').forEach(el => el.remove());
            let t = clone.innerText.trim().replace(/\*\*|\*/g, "").replace(/\s+/g, ' '); if (t.length > 0) paragraphs.push(t);
        });
        const isGenerating = !!document.querySelector('button[aria-label="Stop response"]');
        const newPages = []; paragraphs.forEach(p => {
            const MAX = 280; const sentences = p.split(/(?<=[.!?])(?=\s+[A-Z])/);
            const tagMatch = p.match(/^\[.*?\]\s*:/);
            const tag = tagMatch ? tagMatch[0] : "";
            let buf = tag;
            sentences.forEach(s => {
                let sClean = s.replace(tag, "").trim();
                if ((buf + sClean).length > MAX) { newPages.push(buf.trim()); buf = tag + " " + sClean; }
                else { buf += " " + sClean; }
            });
            if (buf && buf !== tag) newPages.push(buf.trim());
        });
        if (newPages.length >= currentPages.length) {
            const isNewContent = newPages.length > currentPages.length || (newPages.length > 0 && newPages[newPages.length - 1] !== currentPages[currentPages.length - 1]);

            if (isNewContent) {
                if (isGenerating && newPages.length < 2 && newPages.length > currentPages.length) return; // Still wait if it's the very first chunk and excessively short, though usually we want updates. Actually, let's relax this to just respect the content change.

                // Re-evaluate the "don't show single short page" rule only if we are truly starting fresh
                if (isGenerating && newPages.length < 2 && currentPages.length === 0) return;

                currentPages = newPages;

                if (!hasStartedTypingThisTurn && !isTyping) {
                    startTypewriter(currentPages[currentPageIndex]);
                } else if (isTyping && currentPageIndex === currentPages.length - 1) {
                    // We are currently typing the last page and it got updated
                    const newText = currentPages[currentPageIndex];
                    const nameMatch = newText.match(/^\[(.*?)\]\s*:/);
                    const newCleanText = nameMatch ? newText.replace(/^\[.*?\]\s*:/, '').trim() : newText;

                    if (newCleanText.length > currentCleanText.length) {
                        currentCleanText = newCleanText;
                        // The animate loop will naturally pick up the new length
                    }
                }
            }
        }
    }

    observer = new MutationObserver(() => {
        const containers = document.querySelectorAll('structured-content-container'); if (containers.length === 0) return;
        const latest = containers[containers.length - 1]; if (latest !== lastProcessedElement) { lastProcessedElement = latest; currentPages = []; currentPageIndex = 0; hasStartedTypingThisTurn = false; }
        processMessage(latest);
    });

    diagBox.onclick = advance;
    function toggleVnMode() { isVnMode = !isVnMode; stage.classList.toggle('vn-hidden', !isVnMode); }
    window.onkeydown = (e) => {
        if (e.key === "Escape") toggleVnMode();
        if (isVnMode && (e.key === " " || e.key === "ArrowRight") && !isMenuOpen && !backlogCont.classList.contains('visible') && document.activeElement !== vnInput) advance();
    };
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    overlay.onclick = () => { if (isMenuOpen) trigger.click(); };
    GM_xmlhttpRequest({ method: 'GET', url: 'https://i.postimg.cc/W3xR61yr/Gemini-Generated-Image-6lymkg6lymkg6lym.png', responseType: 'blob', onload: (res) => { stage.style.backgroundImage = `url('${URL.createObjectURL(res.response)}')`; } });
    function loadSpriteBlob(speaker) {
        const persona = PersonaLibrary[speaker]; if (!persona || persona.blobUrl) return;
        GM_xmlhttpRequest({ method: 'GET', url: persona.url, responseType: 'blob', onload: (res) => { persona.blobUrl = URL.createObjectURL(res.response); } });
    }
    loadSpriteBlob("coder bunny");

    // Mobile Fullscreen Button
    const fsBtn = document.createElement('div'); fsBtn.id = 'vn-fullscreen-btn'; fsBtn.textContent = '⛶';
    document.body.appendChild(fsBtn);

    function isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
            || window.innerWidth <= 850
            || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
    }

    function updateBtnVisibility() {
        fsBtn.style.display = isMobile() ? 'flex' : 'none';
    }

    updateBtnVisibility();
    window.addEventListener('resize', updateBtnVisibility);

    fsBtn.onclick = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
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

})();

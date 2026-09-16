// .frame (and the dice animation inside it) is display:none in portrait. If the
// dotlottie-wc component gets its src while hidden, it measures a zero-size
// container and renders distorted afterwards even once rotated to landscape and
// shown. So only give it a src once the page is actually in landscape.
const diceAnimEl = document.getElementById('diceAnim');
const landscapeQuery = window.matchMedia('(orientation: landscape)');

function loadDiceAnimWhenLandscape() {
    if (landscapeQuery.matches && !diceAnimEl.getAttribute('src')) {
        diceAnimEl.setAttribute('src', '../../assets/game/dice-of-fortune.json');
    }
}

loadDiceAnimWhenLandscape();
landscapeQuery.addEventListener('change', loadDiceAnimWhenLandscape);

const DIFFICULTY_MINUTES = {
    facile: 20,
    normal: 15,
    difficile: 10,
};

const gameSettings = readGame().settings || {};
const chapterMinutes = DIFFICULTY_MINUTES[gameSettings.difficulty] ?? DIFFICULTY_MINUTES.normal;

const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const centisEl = document.getElementById('centis');

const TOTAL_TIME = chapterMinutes * 60 * 100;
const PENALTY_AMOUNT = 2 * 60 * 100;
const PENALTY_FLOOR = 10 * 100;
const FIVE_MINUTES_CS = 5 * 60 * 100;
const ONE_MINUTE_CS = 60 * 100;
let timeRemaining = TOTAL_TIME;
let isRunning = false;
let tickInterval = null;
let pendingStart = false;

const sounds = {
    breachAlarm: new Audio('../../assets/audio/alerts/breach-alarm.m4a'),
};
Object.values(sounds).forEach(a => a.preload = 'auto');

// iOS (and other mobile OSes) only allow a given <audio> element to be
// played later from non-gesture code (e.g. a tick loop) if that same
// element was already played from within a real user gesture once.
// Priming plays each element silently and immediately pauses it here,
// during the click, so later playSound() calls are allowed to succeed.
let audioUnlocked = false;

function primeAudioElement(audio) {
    audio.volume = 0;
    audio.play().then(() => {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = 1;
    }).catch(() => {});
}

// Skip priming whichever sound is about to be played directly from
// this same gesture — playing it for real already unlocks it, and
// priming it first would race that real play() call and cancel it.
function unlockAudio(exceptKey) {
    if (audioUnlocked) return;
    Object.entries(sounds).forEach(([key, audio]) => {
        if (key !== exceptKey) primeAudioElement(audio);
    });
    audioUnlocked = true;
}

function playSound(key) {
    const audio = sounds[key];
    audio.currentTime = 0;
    audio.play().catch(() => {});
}

function updateTimerDisplay() {
    const m = Math.floor(timeRemaining / 6000);
    const s = Math.floor((timeRemaining % 6000) / 100);
    const c = timeRemaining % 100;
    minutesEl.textContent = String(m).padStart(2, '0');
    secondsEl.textContent = String(s).padStart(2, '0');
    centisEl.textContent = String(c).padStart(2, '0');
}

function tick() {
    if (timeRemaining > 0) {
        timeRemaining--;
        updateTimerDisplay();
        if (timeRemaining < PENALTY_FLOOR) {
            penaltyBtn.disabled = true;
        }
        if (timeRemaining > 0 && (timeRemaining % FIVE_MINUTES_CS === 0 || timeRemaining === ONE_MINUTE_CS)) {
            playSound('breachAlarm');
        }
    } else {
        clearInterval(tickInterval);
        tickInterval = null;
        isRunning = false;
    }
}

updateTimerDisplay();

function fitChapterBanner() {
    const banner = document.querySelector('.chapter-banner');
    const text = document.querySelector('.chapter-banner-text');
    const style = getComputedStyle(banner);
    const available = banner.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);

    const baseSize = 16;
    text.style.fontSize = baseSize + 'px';
    const naturalWidth = text.scrollWidth;

    text.style.fontSize = (available / naturalWidth) * baseSize + 'px';
}

const chapterBannerText = document.querySelector('.chapter-banner-text');

onDomainEvent('ChapterWasLoaded', ({ chapter }) => {
    chapterBannerText.textContent = `Chapitre #${chapter.num}`;
    fitChapterBanner();
});

onDomainEvent('DiceOfFortuneWereRolled', renderSidebarHelpItems);
onDomainEvent('DiceOfFortuneWereRolled', renderSidebarTributes);
onDomainEvent('DiceOfFortuneWereRolled', renderDiceResultSummary);
onDomainEvent('DiceOfFortuneWereRolled', renderTributeSummary);
onDomainEvent('HelpItemHasBeenUsed', handleHelpItemHasBeenUsed);
onDomainEvent('SupplyCrateHasBeenOpen', handleSupplyCrateHasBeenOpen);
onDomainEvent('DiceOfFortuneWereRolled', () => {
    console.log(readGame());
});

LoadChapter();

fitChapterBanner();
window.addEventListener('resize', fitChapterBanner);
if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(fitChapterBanner);
}

const diceAnim = document.getElementById('diceAnim');
const diceInstructions = document.getElementById('diceInstructions');
const timerView = document.getElementById('timerView');
const diceResultView = document.getElementById('diceResultView');
const diceResultList = document.getElementById('diceResultList');
const sidebarDiceView = document.getElementById('sidebarDiceView');
const sidebarHelpView = document.getElementById('sidebarHelpView');
const sidebarHelpList = document.getElementById('sidebarHelpList');
const sidebarHordeList = document.getElementById('sidebarHordeList');
const survivorTabBtn = document.getElementById('survivorTabBtn');
const hordeTabBtn = document.getElementById('hordeTabBtn');
const tributeView = document.getElementById('tributeView');
const tributeDescription = document.getElementById('tributeDescription');
const itemDetailView = document.getElementById('itemDetailView');
const itemDetailHeading = document.getElementById('itemDetailHeading');
const itemDetailBadge = document.getElementById('itemDetailBadge');
const itemDetailDescription = document.getElementById('itemDetailDescription');
const itemDetailUseBtn = document.getElementById('itemDetailUseBtn');
const itemDetailCloseBtn = document.getElementById('itemDetailCloseBtn');
const nextBtn = document.getElementById('nextBtn');
const okBtn = document.getElementById('okBtn');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const penaltyBtn = document.getElementById('penaltyBtn');
const endChapterBtn = document.getElementById('endChapterBtn');

function setActiveSidebarTab(tab) {
    const isSurvivor = tab === 'survivor';
    survivorTabBtn.classList.toggle('active', isSurvivor);
    hordeTabBtn.classList.toggle('active', !isSurvivor);
    survivorTabBtn.querySelector('img').src = `../../assets/game/survivor-icon_${isSurvivor ? 'active' : 'inactive'}.svg`;
    hordeTabBtn.querySelector('img').src = `../../assets/game/horde-icon_${isSurvivor ? 'inactive' : 'active'}.svg`;
    sidebarHelpList.hidden = !isSurvivor;
    sidebarHordeList.hidden = isSurvivor;
}

survivorTabBtn.addEventListener('click', () => setActiveSidebarTab('survivor'));
hordeTabBtn.addEventListener('click', () => setActiveSidebarTab('horde'));

const helpDisplayDataPromise = fetch('../../data/dice-of-fortune/help/display.json').then((res) => res.json());
const tributeDisplayDataPromise = fetch('../../data/dice-of-fortune/tribute/display.json').then((res) => res.json());

function renderDiceResultList(aggregated) {
    diceResultList.innerHTML = '';
    aggregated.forEach(({ item, count }) => {
        const li = document.createElement('li');
        li.textContent = count > 1 ? `${item.label.full} x${count}` : item.label.full;
        li.title = item.description.join('\n');
        diceResultList.appendChild(li);
    });
}

// Distinct names in the order they were first granted, each with how many copies were granted.
function aggregateByName(items) {
    const order = [];
    const counts = new Map();
    for (const item of items) {
        if (!counts.has(item.name)) {
            order.push(item.name);
            counts.set(item.name, 0);
        }
        counts.set(item.name, counts.get(item.name) + 1);
    }
    return order.map((name) => ({ name, count: counts.get(name) }));
}

function renderDiceResultSummary({ chapterNum }) {
    const game = fetchGame();
    const chapter = game.chapters.find((c) => c.num === chapterNum);
    const grantedCounts = aggregateByName(chapter.helpItems);

    helpDisplayDataPromise.then((helpDisplayData) => {
        const aggregated = grantedCounts.map(({ name, count }) => ({
            item: helpDisplayData.find((entry) => entry.name === name),
            count,
        }));
        renderDiceResultList(aggregated);
    });
}

// Resolves a tribute parameter (e.g. "affectedZombies") to its display text: finds
// which group the rolled value name belongs to, then fills that group's own {{value}}.
function tributeParameterText(paramGroups, valueName) {
    for (const group of paramGroups) {
        const match = group.values.find((value) => value.name === valueName);
        if (match) return group.text.replace('{{value}}', match.value);
    }
    return '';
}

function renderTributeSummary({ chapterNum }) {
    const game = fetchGame();
    const chapter = game.chapters.find((c) => c.num === chapterNum);
    const [tribute] = chapter.tributes;

    tributeDisplayDataPromise.then((tributeDisplayData) => {
        const display = tributeDisplayData.find((entry) => entry.name === tribute.name);
        const description = display.description.map((line) => (
            Object.entries(tribute.parameters).reduce((text, [paramKey, valueName]) => (
                text.replace(`{{${paramKey}.text}}`, tributeParameterText(display[paramKey], valueName))
            ), line)
        ));
        renderPrimarySecondaryLines(tributeDescription, description);
    });
}

function renderPrimarySecondaryLines(container, lines) {
    container.innerHTML = '';
    lines.forEach((line, index) => {
        const p = document.createElement('p');
        p.className = index === 0 ? 'item-detail-description-primary' : 'item-detail-description-secondary';
        p.textContent = line;
        container.appendChild(p);
    });
}

function renderItemDetailPanel(details) {
    itemDetailHeading.textContent = details.heading;
    itemDetailBadge.textContent = details.badge;
    renderPrimarySecondaryLines(itemDetailDescription, details.description);
    itemDetailUseBtn.textContent = details.useButtonText || '';
    itemDetailUseBtn.hidden = !details.useButtonText;
    itemDetailCloseBtn.hidden = false;
    itemDetailCloseBtn.classList.toggle('full-width', !details.useButtonText);
    timerView.hidden = true;
    itemDetailView.hidden = false;
}

// itemDetailUseBtn is shared across every detail panel, so only one "use" handler
// can be live on it at a time — swap it out instead of stacking listeners.
let itemDetailUseHandler = null;

function setItemDetailUseHandler(handler) {
    if (itemDetailUseHandler) {
        itemDetailUseBtn.removeEventListener('click', itemDetailUseHandler);
    }
    itemDetailUseHandler = handler;
    if (handler) {
        itemDetailUseBtn.addEventListener('click', handler);
    }
}

async function showHelpItemDetails(itemName, chapterNum) {
    const details = await DisplayHelpItemDetails(itemName, chapterNum);
    renderItemDetailPanel(details);
    setItemDetailUseHandler(details.isCrate ? () => OpenSupplyCrate() : () => UseHelpItem(itemName));
}

async function showTributeDetails(chapterNum) {
    const details = await DisplayTributeDetails(chapterNum);
    renderItemDetailPanel(details);
    setItemDetailUseHandler(null);
}

function closeItemDetail() {
    document.querySelectorAll('.sidebar-tab-item.selected').forEach((el) => el.classList.remove('selected'));
    itemDetailView.hidden = true;
    timerView.hidden = false;
}

// Removes a help item's sidebar entry once every granted copy of it has been
// used/opened — for a cap-1 item that's always right away, for the supply
// crate only once the last one has been opened.
function removeSidebarHelpItemIfExhausted(itemName, chapterNum) {
    const game = fetchGame();
    const chapter = game.chapters.find((c) => c.num === chapterNum);
    const remaining = chapter.helpItems.filter((item) => item.name === itemName && !item.hasBeenUsed).length;
    if (remaining === 0) {
        const btn = sidebarHelpList.querySelector(`[data-item-name="${itemName}"]`);
        if (btn) btn.remove();
    }
}

// Only ever reacts to a help item actually having been used — if UseHelpItem
// couldn't use it, no event fires and the sidebar/panel are left untouched.
function handleHelpItemHasBeenUsed({ itemName, chapterNum }) {
    removeSidebarHelpItemIfExhausted(itemName, chapterNum);
    closeItemDetail();
}

// Only ever reacts to a crate actually having been opened — if OpenSupplyCrate
// couldn't open one, no event fires and the panel is left showing "Ouvrir".
function handleSupplyCrateHasBeenOpen({ chapterNum, description }) {
    renderPrimarySecondaryLines(itemDetailDescription, description);
    itemDetailUseBtn.textContent = 'OK';
    itemDetailCloseBtn.hidden = true;
    setItemDetailUseHandler(closeItemDetail);
    removeSidebarHelpItemIfExhausted('supplyCrate', chapterNum);
}

function renderSidebarHelpItems({ chapterNum }) {
    const game = fetchGame();
    const chapter = game.chapters.find((c) => c.num === chapterNum);

    const names = [...new Set(chapter.helpItems.map((helpItem) => helpItem.name))];

    helpDisplayDataPromise.then((helpDisplayData) => {
        sidebarHelpList.innerHTML = '';
        names.forEach((name) => {
            const display = helpDisplayData.find((entry) => entry.name === name);

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'sidebar-tab-item';
            btn.textContent = display.label.short;
            btn.title = display.description.join('\n');
            btn.dataset.itemName = name;
            // Disabled until the roll summary (help items, then tribute) has been
            // closed — clicking through it too early would show the details panel
            // on top of the still-open summary.
            btn.disabled = true;
            btn.addEventListener('click', () => {
                sidebarHelpList.querySelectorAll('.selected').forEach((el) => el.classList.remove('selected'));
                btn.classList.add('selected');
                showHelpItemDetails(name, chapterNum);
            });
            sidebarHelpList.appendChild(btn);
        });
    });
}

function renderSidebarTributes({ chapterNum }) {
    const game = fetchGame();
    const chapter = game.chapters.find((c) => c.num === chapterNum);

    tributeDisplayDataPromise.then((tributeDisplayData) => {
        sidebarHordeList.innerHTML = '';
        chapter.tributes.forEach((tribute) => {
            const display = tributeDisplayData.find((entry) => entry.name === tribute.name);

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'sidebar-tab-item';
            btn.textContent = display.label.short;
            btn.title = display.description.join('\n');
            // Disabled until the roll summary (help items, then tribute) has been
            // closed — clicking through it too early would show the details panel
            // on top of the still-open summary.
            btn.disabled = true;
            btn.addEventListener('click', () => {
                sidebarHordeList.querySelectorAll('.selected').forEach((el) => el.classList.remove('selected'));
                btn.classList.add('selected');
                showTributeDetails(chapterNum);
            });
            sidebarHordeList.appendChild(btn);
        });
    });
}

itemDetailCloseBtn.addEventListener('click', closeItemDetail);

function showHelpItemsSummary() {
    sidebarDiceView.hidden = true;
    sidebarHelpView.hidden = false;
    timerView.hidden = true;
    diceResultView.hidden = false;
}

function showTributeSummary() {
    diceResultView.hidden = true;
    tributeView.hidden = false;
    setActiveSidebarTab('horde');
}

diceAnim.addEventListener('click', () => {
    RollDiceOfFortune();

    diceAnim.style.pointerEvents = 'none';
    diceAnim.style.cursor = 'default';
    diceInstructions.hidden = true;

    // Wait for the dice-of-fortune animation to finish playing before showing
    // the roll results, so players see the roll complete.
    if (diceAnim.dotLottie) {
        diceAnim.dotLottie.addEventListener('complete', function onComplete() {
            diceAnim.dotLottie.removeEventListener('complete', onComplete);
            showHelpItemsSummary();
        });
        diceAnim.dotLottie.play();
    } else {
        showHelpItemsSummary();
    }
}, { once: true });

nextBtn.addEventListener('click', () => {
    showTributeSummary();
}, { once: true });

okBtn.addEventListener('click', () => {
    tributeView.hidden = true;
    timerView.hidden = false;
    setActiveSidebarTab('survivor');
    startBtn.disabled = false;
    resetBtn.disabled = false;
    penaltyBtn.disabled = false;
    endChapterBtn.disabled = false;
    sidebarHelpList.querySelectorAll('.sidebar-tab-item').forEach((btn) => { btn.disabled = false; });
    sidebarHordeList.querySelectorAll('.sidebar-tab-item').forEach((btn) => { btn.disabled = false; });
}, { once: true });

function cancelPendingStart() {
    sounds.breachAlarm.removeEventListener('ended', onBreachAlarmEnded);
    sounds.breachAlarm.pause();
    sounds.breachAlarm.currentTime = 0;
    pendingStart = false;
}

function onBreachAlarmEnded() {
    pendingStart = false;
    isRunning = true;
    tickInterval = setInterval(tick, 10);
    startBtn.textContent = 'Pause';
}

startBtn.addEventListener('click', () => {
    // Cancel pending start if clicked while the breach alarm is still playing
    if (pendingStart) {
        cancelPendingStart();
        startBtn.textContent = 'Commencer';
        return;
    }

    if (!isRunning) {
        if (timeRemaining === TOTAL_TIME) {
            unlockAudio('breachAlarm');
            pendingStart = true;
            sounds.breachAlarm.addEventListener('ended', onBreachAlarmEnded, { once: true });
            playSound('breachAlarm');
        } else {
            isRunning = true;
            tickInterval = setInterval(tick, 10);
            startBtn.textContent = 'Pause';
        }
    } else {
        isRunning = false;
        clearInterval(tickInterval);
        tickInterval = null;
        startBtn.textContent = 'Reprendre';
    }
});

resetBtn.addEventListener('click', () => {
    if (pendingStart) {
        cancelPendingStart();
    }
    isRunning = false;
    clearInterval(tickInterval);
    tickInterval = null;
    timeRemaining = TOTAL_TIME;
    updateTimerDisplay();
    startBtn.textContent = 'Commencer';
    penaltyBtn.disabled = false;
});

penaltyBtn.addEventListener('click', () => {
    timeRemaining = Math.max(timeRemaining - PENALTY_AMOUNT, PENALTY_FLOOR);
    updateTimerDisplay();

    if (timeRemaining < PENALTY_FLOOR) {
        penaltyBtn.disabled = true;
    }
});

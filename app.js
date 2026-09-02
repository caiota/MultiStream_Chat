/* =========================================================
   MULTISTREAM CHAT criado por Caiota :D
   Twitch + Kick
========================================================= */


/* =========================================================
   CONFIGURAÇÕES
========================================================= */

const STORAGE_KEY = "multistream_chat_settings";


const defaultSettings = {
    twitch: "",
    kick: "",

    twitchDarkMode: true,

    twitchWidth: 50,

    order: [
        "twitch",
        "kick"
    ]
};


/* =========================================================
   ELEMENTOS
========================================================= */

const setupScreen =
    document.getElementById("setup-screen");

const chatScreen =
    document.getElementById("chat-screen");

const twitchInput =
    document.getElementById("twitch-input");

const kickInput =
    document.getElementById("kick-input");

const twitchDarkMode =
    document.getElementById("twitch-dark-mode");

const openChatButton =
    document.getElementById("open-chat");

const setupError =
    document.getElementById("setup-error");

const settingsOverlay =
    document.getElementById("settings-overlay");

const settingsButton =
    document.getElementById("settings-button");

const closeSettingsButton =
    document.getElementById("close-settings");

const cancelSettingsButton =
    document.getElementById("cancel-settings");

const saveSettingsButton =
    document.getElementById("save-settings");

const swapChatsButton =
    document.getElementById("swap-chats");

const backToSetupButton =
    document.getElementById("back-to-setup");

const settingsTwitch =
    document.getElementById("settings-twitch");

const settingsKick =
    document.getElementById("settings-kick");

const settingsTwitchDark =
    document.getElementById("settings-twitch-dark");

const settingsError =
    document.getElementById("settings-error");

const chatContainer =
    document.getElementById("chat-container");


/* =========================================================
   ESTADO
========================================================= */

let settings = loadSettings();

let isDragging = false;


/* =========================================================
   STORAGE
========================================================= */

function loadSettings() {

    try {

        const saved =
            localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return {
                ...defaultSettings,
                order: [...defaultSettings.order]
            };
        }

        const parsed =
            JSON.parse(saved);

        return {
            ...defaultSettings,
            ...parsed,

            order:
                Array.isArray(parsed.order)
                    ? parsed.order
                    : [...defaultSettings.order]
        };

    } catch (error) {

        console.error(
            "Erro ao carregar configurações:",
            error
        );

        return {
            ...defaultSettings,
            order: [...defaultSettings.order]
        };
    }
}


function saveSettings() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(settings)
    );
}


/* =========================================================
   LIMPAR CANAL
========================================================= */

function cleanChannel(value, platform) {

    if (!value) {
        return "";
    }

    let channel =
        value.trim();


    /* Remove @ */

    channel =
        channel.replace(/^@+/, "");


    /* Remove espaços */

    channel =
        channel.trim();


    /* =====================================================
       TWITCH
    ===================================================== */

    if (platform === "twitch") {

        channel =
            channel.replace(
                /^https?:\/\/(www\.)?twitch\.tv\//i,
                ""
            );

    }


    /* =====================================================
       KICK
    ===================================================== */

    if (platform === "kick") {

        channel =
            channel.replace(
                /^https?:\/\/(www\.)?kick\.com\//i,
                ""
            );

    }


    /* Remove www. caso alguém cole sem protocolo */

    channel =
        channel.replace(
            /^(www\.)?(twitch\.tv|kick\.com)\//i,
            ""
        );


    /* Remove qualquer coisa depois do nome */

    channel =
        channel.replace(
            /[/?#].*$/,
            ""
        );


    /* Remove caracteres estranhos */

    channel =
        channel.replace(
            /\s+/g,
            ""
        );


    return channel.toLowerCase();
}


/* =========================================================
   URL ATUAL
========================================================= */

function getChannelsFromURL() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const twitch =
        cleanChannel(
            params.get("twitch"),
            "twitch"
        );


    const kick =
        cleanChannel(
            params.get("kick"),
            "kick"
        );


    return {
        twitch,
        kick
    };
}


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

function initialize() {

    const urlChannels =
        getChannelsFromURL();


    /*
       Se a extensão abriu o site com
       ?twitch=xxx&kick=yyy,
       esses canais têm prioridade.
    */

    if (
        urlChannels.twitch ||
        urlChannels.kick
    ) {

        settings.twitch =
            urlChannels.twitch;

        settings.kick =
            urlChannels.kick;


        saveSettings();

        /*
           Remove os parâmetros da URL.
           Isso deixa a URL limpa depois
           que os canais foram carregados.
        */

        window.history.replaceState(
            {},
            document.title,
            window.location.pathname
        );
    }


    if (
        settings.twitch ||
        settings.kick
    ) {

        showChatScreen();

    } else {

        showSetupScreen();

    }
}


/* =========================================================
   TELA DE SETUP
========================================================= */

function showSetupScreen() {

    setupScreen.classList.remove(
        "hidden"
    );

    chatScreen.classList.add(
        "hidden"
    );


    twitchInput.value =
        settings.twitch || "";

    kickInput.value =
        settings.kick || "";

    twitchDarkMode.checked =
        settings.twitchDarkMode !== false;


    setupError.textContent = "";
}


function showChatScreen() {

    setupScreen.classList.add(
        "hidden"
    );

    chatScreen.classList.remove(
        "hidden"
    );


    buildChats();
}


/* =========================================================
   VALIDAR SETUP
========================================================= */

function validateChannels() {

    const twitch =
        cleanChannel(
            twitchInput.value,
            "twitch"
        );

    const kick =
        cleanChannel(
            kickInput.value,
            "kick"
        );


    if (!twitch && !kick) {

        setupError.textContent =
            "Digite pelo menos um canal da Twitch ou Kick.";

        return null;
    }


    return {
        twitch,
        kick
    };
}


/* =========================================================
   ABRIR MULTICHAT
========================================================= */

openChatButton.addEventListener(
    "click",
    () => {

        const channels =
            validateChannels();

        if (!channels) {
            return;
        }


        settings.twitch =
            channels.twitch;

        settings.kick =
            channels.kick;

        settings.twitchDarkMode =
            twitchDarkMode.checked;


        saveSettings();


        showChatScreen();
    }
);


/* =========================================================
   ENTER NOS INPUTS
========================================================= */

twitchInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            event.preventDefault();

            openChatButton.click();
        }
    }
);


kickInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            event.preventDefault();

            openChatButton.click();
        }
    }
);


/* =========================================================
   CRIAR CHAT
========================================================= */

function createChatPanel(platform) {

    const panel =
        document.createElement("section");

    panel.className =
        "chat-panel";

    panel.dataset.platform =
        platform;


    /* =====================================================
       HEADER
    ===================================================== */

    const header =
        document.createElement("header");

    header.className =
        "chat-header";


    const icon =
        document.createElement("span");


    const title =
        document.createElement("span");


    if (platform === "twitch") {

        header.classList.add(
            "twitch-chat-header"
        );

        icon.textContent =
            "🟣";

        title.textContent =
            settings.twitch;

    } else {

        header.classList.add(
            "kick-chat-header"
        );

        icon.textContent =
            "🟢";

        title.textContent =
            settings.kick;
    }


    header.appendChild(icon);

    header.appendChild(title);


    /* =====================================================
       IFRAME
    ===================================================== */

    const iframeContainer =
        document.createElement("div");

    iframeContainer.className =
        "chat-iframe-container";


    const iframe =
        document.createElement("iframe");

    iframe.className =
        "chat-iframe";

    iframe.allow =
        "autoplay; clipboard-write";

    iframe.setAttribute(
        "allowtransparency",
        "true"
    );


    if (platform === "twitch") {

        const parent =
            window.location.hostname;


        /*
           Twitch oficialmente exige
           parent=<domínio> para embeds.

           darkpopout força o tema escuro.
        */

        let url =
            "https://www.twitch.tv/embed/" +
            encodeURIComponent(
                settings.twitch
            ) +
            "/chat?";


        if (settings.twitchDarkMode) {

            url +=
                "darkpopout&";
        }


        url +=
            "parent=" +
            encodeURIComponent(parent);


        iframe.src = url;

    } else {

        /*
           Kick não possui atualmente
           um embed oficial de chat documentado.

           Este projeto usa o KickCX
           como embed de chat.
        */

        iframe.src =
            "https://chat.kick.cx/embed/" +
            encodeURIComponent(
                settings.kick
            );
    }


    iframeContainer.appendChild(
        iframe
    );


    panel.appendChild(
        header
    );

    panel.appendChild(
        iframeContainer
    );


    return panel;
}


/* =========================================================
   CONSTRUIR OS CHATS
========================================================= */

function buildChats() {

    chatContainer.innerHTML = "";


    const hasTwitch =
        Boolean(settings.twitch);

    const hasKick =
        Boolean(settings.kick);


    /* =====================================================
       APENAS TWITCH
    ===================================================== */

    if (hasTwitch && !hasKick) {

        const twitch =
            createChatPanel("twitch");

        twitch.style.width = "100%";

        chatContainer.appendChild(
            twitch
        );

        return;
    }


    /* =====================================================
       APENAS KICK
    ===================================================== */

    if (!hasTwitch && hasKick) {

        const kick =
            createChatPanel("kick");

        kick.style.width = "100%";

        chatContainer.appendChild(
            kick
        );

        return;
    }


    /* =====================================================
       TWITCH + KICK
    ===================================================== */

    const first =
        createChatPanel(
            settings.order[0]
        );

    const second =
        createChatPanel(
            settings.order[1]
        );


    const twitchWidth =
        Math.max(
            15,
            Math.min(
                85,
                settings.twitchWidth
            )
        );


    let firstWidth;


    if (settings.order[0] === "twitch") {

        firstWidth =
            twitchWidth;

    } else {

        firstWidth =
            100 - twitchWidth;
    }


    first.style.width =
        `calc(${firstWidth}% - 3.5px)`;


    second.style.width =
        `calc(${100 - firstWidth}% - 3.5px)`;


    const resizeHandle =
        document.createElement("div");

    resizeHandle.className =
        "resize-handle";

    resizeHandle.title =
        "Arraste para redimensionar";


    chatContainer.appendChild(
        first
    );

    chatContainer.appendChild(
        resizeHandle
    );

    chatContainer.appendChild(
        second
    );


    setupResize(
        resizeHandle
    );
}


/* =========================================================
   RESIZE
========================================================= */

function setupResize(handle) {

    handle.addEventListener(
        "pointerdown",
        startResize
    );
}


function startResize(event) {

    event.preventDefault();

    isDragging = true;


    const handle =
        event.currentTarget;


    handle.classList.add(
        "dragging"
    );


    handle.setPointerCapture(
        event.pointerId
    );


    const rect =
        chatContainer.getBoundingClientRect();


    function moveResize(moveEvent) {

        if (!isDragging) {
            return;
        }


        const mouseX =
            moveEvent.clientX;


        let percentage =
            ((mouseX - rect.left) /
                rect.width) *
            100;


        /*
           Limites para impedir que
           um dos chats desapareça.
        */

        percentage =
            Math.max(
                15,
                Math.min(
                    85,
                    percentage
                )
            );


        /*
           Descobrimos qual plataforma
           está no lado esquerdo.
        */

        const firstPanel =
            handle.previousElementSibling;


        const firstPlatform =
            firstPanel.dataset.platform;


        if (firstPlatform === "twitch") {

            settings.twitchWidth =
                percentage;

        } else {

            settings.twitchWidth =
                100 - percentage;
        }


        applyWidths(
            percentage
        );
    }


    function finishResize() {

        if (!isDragging) {
            return;
        }


        isDragging = false;

        handle.classList.remove(
            "dragging"
        );


        saveSettings();


        window.removeEventListener(
            "pointermove",
            moveResize
        );

        window.removeEventListener(
            "pointerup",
            finishResize
        );
    }


    window.addEventListener(
        "pointermove",
        moveResize
    );


    window.addEventListener(
        "pointerup",
        finishResize
    );
}


/* =========================================================
   APLICAR TAMANHOS
========================================================= */

function applyWidths(
    firstPercentage
) {

    const panels =
        chatContainer.querySelectorAll(
            ".chat-panel"
        );


    if (panels.length !== 2) {
        return;
    }


    panels[0].style.width =
        `calc(${firstPercentage}% - 3.5px)`;


    panels[1].style.width =
        `calc(${100 - firstPercentage}% - 3.5px)`;
}


/* =========================================================
   SETTINGS
========================================================= */

settingsButton.addEventListener(
    "click",
    openSettings
);


function openSettings() {

    settingsTwitch.value =
        settings.twitch || "";

    settingsKick.value =
        settings.kick || "";

    settingsTwitchDark.checked =
        settings.twitchDarkMode !== false;


    settingsError.textContent = "";


    settingsOverlay.classList.remove(
        "hidden"
    );
}


function closeSettings() {

    settingsOverlay.classList.add(
        "hidden"
    );
}


closeSettingsButton.addEventListener(
    "click",
    closeSettings
);


cancelSettingsButton.addEventListener(
    "click",
    closeSettings
);


/* =========================================================
   TROCAR LADOS
========================================================= */

swapChatsButton.addEventListener(
    "click",
    () => {

        settings.order =
            settings.order.reverse();


        /*
           Recalcula o tamanho
           visualmente.

           O valor twitchWidth
           continua representando
           a largura da Twitch.
        */

        buildChats();
    }
);


/* =========================================================
   SALVAR SETTINGS
========================================================= */

saveSettingsButton.addEventListener(
    "click",
    () => {

        const twitch =
            cleanChannel(
                settingsTwitch.value,
                "twitch"
            );

        const kick =
            cleanChannel(
                settingsKick.value,
                "kick"
            );


        if (!twitch && !kick) {

            settingsError.textContent =
                "Digite pelo menos um canal da Twitch ou Kick.";

            return;
        }


        settings.twitch =
            twitch;

        settings.kick =
            kick;

        settings.twitchDarkMode =
            settingsTwitchDark.checked;


        saveSettings();


        closeSettings();


        showChatScreen();
    }
);


/* =========================================================
   VOLTAR PARA CONFIGURAÇÃO
========================================================= */

backToSetupButton.addEventListener(
    "click",
    () => {

        closeSettings();

        showSetupScreen();
    }
);


/* =========================================================
   FECHAR SETTINGS CLICANDO FORA
========================================================= */

settingsOverlay.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            settingsOverlay
        ) {

            closeSettings();
        }
    }
);


/* =========================================================
   TECLA ESC
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            !settingsOverlay.classList.contains(
                "hidden"
            )
        ) {

            closeSettings();
        }
    }
);
// =========================
// HEADER AUTO-HIDE
// =========================

const topbar = document.getElementById("topbar");

let headerHideTimer = null;
let mouseNearTop = false;

const HEADER_HIDE_DELAY = 3000; // 3 segundos

function showHeader() {
    if (!topbar) return;

    topbar.classList.remove("header-hidden");

    clearTimeout(headerHideTimer);

    if (!mouseNearTop) {
        headerHideTimer = setTimeout(() => {
            if (!mouseNearTop) {
                topbar.classList.add("header-hidden");
            }
        }, HEADER_HIDE_DELAY);
    }
}

function hideHeader() {
    if (!topbar || mouseNearTop) return;

    clearTimeout(headerHideTimer);

    headerHideTimer = setTimeout(() => {
        if (!mouseNearTop) {
            topbar.classList.add("header-hidden");
        }
    }, HEADER_HIDE_DELAY);
}

// Detecta quando o mouse chega perto do topo
document.addEventListener("mousemove", (event) => {
    const nearTop = event.clientY <= 25;

    if (nearTop && !mouseNearTop) {
        mouseNearTop = true;
        showHeader();
    }

    if (!nearTop && mouseNearTop) {
        mouseNearTop = false;
        hideHeader();
    }
});

// Enquanto estiver sobre o header, ele fica visível
topbar?.addEventListener("mouseenter", () => {
    mouseNearTop = true;
    showHeader();
});

topbar?.addEventListener("mouseleave", () => {
    mouseNearTop = false;
    hideHeader();
});

// Começa a contagem assim que entrar na tela do chat
if (chatScreen) {
    headerHideTimer = setTimeout(() => {
        if (!mouseNearTop) {
            topbar?.classList.add("header-hidden");
        }
    }, HEADER_HIDE_DELAY);
}

/* =========================================================
   INICIAR
========================================================= */

initialize();

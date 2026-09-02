const params = new URLSearchParams(
    window.location.search
);


// ============================================================
// CANAIS
// ============================================================

function getChannel(name) {

    const value = params.get(name);

    if (!value) {
        return "";
    }

    return value
        .trim()
        .replace(/^@/, "")
        .replace(/[/?#].*$/, "")
        .toLowerCase();
}


const twitchChannel =
    getChannel("twitch");


const kickChannel =
    getChannel("kick");


// ============================================================
// ELEMENTOS
// ============================================================

const app =
    document.getElementById("app");


const message =
    document.getElementById("message");


const twitchFrame =
    document.getElementById("twitch-frame");


const kickFrame =
    document.getElementById("kick-frame");


const twitchTitle =
    document.getElementById("twitch-title");


const kickTitle =
    document.getElementById("kick-title");


// ============================================================
// TWITCH
// ============================================================

if (twitchChannel) {

    twitchTitle.textContent =
        twitchChannel;

    /*
     * IMPORTANTE:
     *
     * O parent precisa ser o domínio onde
     * esta página está hospedada.
     *
     * location.hostname pega automaticamente:
     *
     * multistream-chat.pages.dev
     *
     * ou seu domínio personalizado.
     */

    const parent =
        window.location.hostname;


    twitchFrame.src =
        "https://www.twitch.tv/embed/" +
        encodeURIComponent(twitchChannel) +
        "/chat?darkpopout&parent=" +
        encodeURIComponent(parent);

} else {

    twitchFrame.remove();
}


// ============================================================
// KICK
// ============================================================

if (kickChannel) {

    kickTitle.textContent =
        kickChannel;

    kickFrame.src =
        "https://chat.kick.cx/embed/" +
        encodeURIComponent(kickChannel);

} else {

    kickFrame.remove();
}


// ============================================================
// NENHUM CANAL
// ============================================================

if (!twitchChannel && !kickChannel) {

    app.style.display = "none";

    message.style.display = "flex";
}


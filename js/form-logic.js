const messageOverlay = document.getElementById("message-overlay");
const openMessageButton = document.getElementById("send-message-btn");
const closeOverlayButton = document.getElementById("overlay-close-btn");
const messageForm = document.getElementById("message-form");

function openOverlay() {
    if (!messageOverlay) return;
    messageOverlay.classList.add("is-open");
    messageOverlay.setAttribute("aria-hidden", "false");
}

function closeOverlay() {
    if (!messageOverlay) return;
    messageOverlay.classList.remove("is-open");
    messageOverlay.setAttribute("aria-hidden", "true");
}

if (openMessageButton) {
    openMessageButton.addEventListener("click", openOverlay);
}

if (closeOverlayButton) {
    closeOverlayButton.addEventListener("click", closeOverlay);
}

if (messageOverlay) {
    messageOverlay.addEventListener("click", (event) => {
        if (event.target === messageOverlay) {
            closeOverlay();
        }
    });
}

if (messageForm) {
    messageForm.addEventListener("submit", (event) => {
        event.preventDefault();
        closeOverlay();
    });
}

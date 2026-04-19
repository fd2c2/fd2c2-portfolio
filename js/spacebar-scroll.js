const sectionPanels = Array.from(document.querySelectorAll(".panel"));
const pageShell = document.getElementById("page-shell");
const navLinks = Array.from(document.querySelectorAll(".nav-link"));

function getClosestPanelIndex() {
    if (!pageShell || sectionPanels.length === 0) return 0;
    const currentTop = pageShell.scrollTop;
    let closest = 0;
    let minDelta = Number.POSITIVE_INFINITY;

    sectionPanels.forEach((section, index) => {
        const delta = Math.abs(section.offsetTop - currentTop);
        if (delta < minDelta) {
            minDelta = delta;
            closest = index;
        }
    });

    return closest;
}

function setActiveNavById(sectionId) {
    navLinks.forEach((link) => {
        const isActive = link.getAttribute("href") === `#${sectionId}`;
        link.classList.toggle("is-active", isActive);
    });
}

function scrollToSection(section) {
    if (!section) return;
    section.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveNavById(section.id);
}

navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
        event.preventDefault();
        const targetId = link.getAttribute("href")?.replace("#", "");
        const targetSection = targetId ? document.getElementById(targetId) : null;
        scrollToSection(targetSection);
        if (targetId) {
            history.replaceState(null, "", `#${targetId}`);
        }
    });
});

window.addEventListener("keydown", (event) => {
    if (event.code !== "Space") return;

    const targetTag = event.target instanceof HTMLElement ? event.target.tagName : "";
    if (targetTag === "INPUT" || targetTag === "TEXTAREA") return;

    event.preventDefault();
    const currentIndex = getClosestPanelIndex();
    const nextIndex = Math.min(currentIndex + 1, sectionPanels.length - 1);
    scrollToSection(sectionPanels[nextIndex]);
});

const sections = Array.from(document.querySelectorAll(".panel"));
const navLinks = Array.from(document.querySelectorAll(".nav-link"));

function setActiveNav(sectionId) {
    navLinks.forEach((link) => {
        const isActive = link.getAttribute("href") === `#${sectionId}`;
        link.classList.toggle("is-active", isActive);
    });
}

function scrollToSection(section) {
    if (!section) return;
    const sectionTop = window.scrollY + section.getBoundingClientRect().top;
    const start = window.scrollY;
    const distance = sectionTop - start;
    const duration = 140;
    const startTime = performance.now();

    function tick(now) {
        const t = Math.min(1, (now - startTime) / duration);
        const eased = t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2;
        window.scrollTo(0, start + distance * eased);
        if (t < 1) window.requestAnimationFrame(tick);
    }

    window.requestAnimationFrame(tick);
    setActiveNav(section.id);
}

navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
        event.preventDefault();
        const id = link.getAttribute("href")?.slice(1);
        const target = id ? document.getElementById(id) : null;
        scrollToSection(target);
        if (id) history.replaceState(null, "", `#${id}`);
    });
});

window.addEventListener("keydown", (event) => {
    if (event.code !== "Space") return;
    const targetTag = event.target instanceof HTMLElement ? event.target.tagName : "";
    if (targetTag === "INPUT" || targetTag === "TEXTAREA") return;
    event.preventDefault();

    const centerY = window.innerHeight * 0.5;
    let currentIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;

    sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        const delta = Math.abs(rect.top + rect.height * 0.5 - centerY);
        if (delta < bestDistance) {
            bestDistance = delta;
            currentIndex = index;
        }
    });

    const nextSection = sections[Math.min(currentIndex + 1, sections.length - 1)];
    scrollToSection(nextSection);
});

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            setActiveNav(entry.target.id);
        }
    });
}, { threshold: 0.55 });

sections.forEach((section) => sectionObserver.observe(section));

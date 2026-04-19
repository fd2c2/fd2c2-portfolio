const liquidCursor = document.getElementById("liquid-cursor");
const interactiveTargets = Array.from(document.querySelectorAll("a, button, input, textarea, label, .artifact-card"));
const magneticTargets = Array.from(document.querySelectorAll(".magnetic-target"));
const revealCards = Array.from(document.querySelectorAll(".reveal-card"));
const revealPanels = Array.from(document.querySelectorAll(".panel-reveal"));
const artifactPanels = Array.from(document.querySelectorAll(".artifact-card"));

const pointer = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5, active: false };
const cursorState = { x: pointer.x, y: pointer.y };
const magneticState = magneticTargets.map((element) => ({ element, x: 0, y: 0 }));

function lerp(current, target, factor) {
    return current + (target - current) * factor;
}

function setupCursorHoverState() {
    interactiveTargets.forEach((element) => {
        element.addEventListener("mouseenter", () => liquidCursor?.classList.add("is-hovering"));
        element.addEventListener("mouseleave", () => liquidCursor?.classList.remove("is-hovering"));
    });
}

function setupSpotlightEffect() {
    artifactPanels.forEach((panel) => {
        panel.addEventListener("mousemove", (event) => {
            const rect = panel.getBoundingClientRect();
            panel.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
            panel.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
            panel.style.setProperty("--spot-opacity", "1");
        });
        panel.addEventListener("mouseleave", () => panel.style.setProperty("--spot-opacity", "0"));
    });
}

function setupRevealAnimation() {
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const order = Number(entry.target.getAttribute("data-reveal-order") || "0");
            window.setTimeout(() => entry.target.classList.add("is-visible"), order * 90);
            revealObserver.unobserve(entry.target);
        });
    }, { threshold: 0.15 });

    revealCards.forEach((card, index) => {
        card.setAttribute("data-reveal-order", String(index));
        revealObserver.observe(card);
    });

    const panelObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            panelObserver.unobserve(entry.target);
        });
    }, { threshold: 0.1 });

    revealPanels.forEach((panel) => panelObserver.observe(panel));
}

function setupPointerEvents() {
    window.addEventListener("mousemove", (event) => {
        pointer.x = event.clientX;
        pointer.y = event.clientY;
        pointer.active = true;
        liquidCursor?.classList.add("is-visible");
    });

    window.addEventListener("mouseout", (event) => {
        if (event.relatedTarget) return;
        pointer.active = false;
        liquidCursor?.classList.remove("is-visible");
    });
}

function setupHeroTyping() {
    const heroRoot = document.querySelector(".hero-title-inner");
    if (!heroRoot) return;
    const fullText = heroRoot.textContent.trim();
    heroRoot.textContent = "";
    let index = 0;

    function type() {
        if (index < fullText.length) {
            const char = fullText[index++];
            heroRoot.textContent += char;

            // Logic for "cool" terminal delays
            let delay = 120 + Math.random() * 80; // Slower base speed
            
            // Longer pauses for punctuation to feel more "human/terminal"
            if (char === "." || char === "!" || char === "?") delay = 800;
            if (char === ",") delay = 400;

            setTimeout(type, delay);
        }
    }
    setTimeout(type, 1000); // Wait a second before starting
}

function setupExperienceInspector() {
    const expItems = Array.from(document.querySelectorAll(".exp-item"));
    const title = document.getElementById("inspector-title");
    const summary = document.getElementById("inspector-summary");
    const cert = document.getElementById("inspector-cert");
    const panel = document.querySelector(".exp-details-panel");

    if (!title || !summary || !expItems.length) return;

    expItems.forEach((item) => {
        item.addEventListener("click", () => {
            // Update Active State
            expItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");

            // Reset Animation
            if (panel) {
                panel.style.animation = "none";
                panel.offsetHeight; // Trigger reflow
                panel.style.animation = "exp-fade-up 0.5s ease-out";
            }

            // Update Content
            title.textContent = item.getAttribute("data-file");
            summary.textContent = item.getAttribute("data-summary");
            if (cert) cert.setAttribute("href", item.getAttribute("data-cert") || "#");
        });

        // Optional: Keep hover support for immediate feedback
        item.addEventListener("mouseenter", () => {
            if (!item.classList.contains("active")) {
                title.textContent = item.getAttribute("data-file");
                summary.textContent = item.getAttribute("data-summary");
            }
        });
    });
}

function animateInteractions() {
    if (liquidCursor) {
        cursorState.x = lerp(cursorState.x, pointer.x, 0.2);
        cursorState.y = lerp(cursorState.y, pointer.y, 0.2);
        liquidCursor.style.left = `${cursorState.x}px`;
        liquidCursor.style.top = `${cursorState.y}px`;
    }

    magneticState.forEach((item) => {
        const rect = item.element.getBoundingClientRect();
        const centerX = rect.left + rect.width * 0.5;
        const centerY = rect.top + rect.height * 0.5;
        const deltaX = pointer.x - centerX;
        const deltaY = pointer.y - centerY;
        const distance = Math.hypot(deltaX, deltaY);
        const magneticRadius = 70;

        let targetX = 0;
        let targetY = 0;
        if (pointer.active && distance < magneticRadius) {
            targetX = deltaX * 0.25;
            targetY = deltaY * 0.25;
        }

        item.x = lerp(item.x, targetX, 0.18);
        item.y = lerp(item.y, targetY, 0.18);
        item.element.style.transform = `translate(${item.x}px, ${item.y}px)`;
    });

    requestAnimationFrame(animateInteractions);
}

setupHeroTyping();
setupExperienceInspector();
setupCursorHoverState();
setupSpotlightEffect();
setupRevealAnimation();
setupPointerEvents();
animateInteractions();

function setupActiveNav() {
    const navLinks = Array.from(document.querySelectorAll(".nav-link"));
    const sections = Array.from(document.querySelectorAll("section"));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute("id");
                navLinks.forEach((link) => {
                    const href = link.getAttribute("href");
                    link.classList.toggle("is-active", href === "#" + id || (id === "home" && href === "#"));
                });
            }
        });
    }, { threshold: 0.25 }); // Lower threshold for faster switching

    sections.forEach((section) => observer.observe(section));
}

function setupContactReveal() {
    const revealBtn = document.getElementById("contact-reveal-btn");
    const formFields = document.getElementById("contact-form-fields");
    if (revealBtn && formFields) {
        revealBtn.addEventListener("click", () => {
            formFields.classList.add("is-open");
            formFields.classList.remove("is-collapsed");
            formFields.setAttribute("aria-hidden", "false");
            revealBtn.style.display = "none";
        });
    }
}

setupActiveNav();
setupContactReveal();

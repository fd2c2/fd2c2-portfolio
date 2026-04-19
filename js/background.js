const flowCanvas = document.getElementById("flow-field-canvas");
const ctx = flowCanvas?.getContext("2d");

if (flowCanvas && ctx) {
    const pointer = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5, active: false };
    const noiseSeed = Math.random() * 1000;
    const lines = [];
    const lineCount = 2600;
    const speed = 1.05;
    const fieldScale = 0.0018;
    const vortexRadius = 220;
    const vortexStrength = 0.85;

    const permutation = new Uint8Array(512);
    const p = Array.from({ length: 256 }, (_, i) => i);
    for (let i = p.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [p[i], p[j]] = [p[j], p[i]];
    }
    for (let i = 0; i < 512; i += 1) {
        permutation[i] = p[i & 255];
    }

    function fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    function lerp(a, b, t) {
        return a + t * (b - a);
    }

    function grad(hash, x, y) {
        const h = hash & 3;
        if (h === 0) return x + y;
        if (h === 1) return -x + y;
        if (h === 2) return x - y;
        return -x - y;
    }

    function perlin2(x, y) {
        const x0 = Math.floor(x) & 255;
        const y0 = Math.floor(y) & 255;
        const xf = x - Math.floor(x);
        const yf = y - Math.floor(y);
        const u = fade(xf);
        const v = fade(yf);

        const aa = permutation[permutation[x0] + y0];
        const ab = permutation[permutation[x0] + y0 + 1];
        const ba = permutation[permutation[x0 + 1] + y0];
        const bb = permutation[permutation[x0 + 1] + y0 + 1];

        const x1 = lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u);
        const x2 = lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u);
        return lerp(x1, x2, v);
    }

    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        flowCanvas.width = Math.floor(window.innerWidth * dpr);
        flowCanvas.height = Math.floor(window.innerHeight * dpr);
        flowCanvas.style.width = `${window.innerWidth}px`;
        flowCanvas.style.height = `${window.innerHeight}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    }

    function resetLines() {
        lines.length = 0;
        for (let i = 0; i < lineCount; i += 1) {
            lines.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight
            });
        }
    }

    function wrap(line) {
        if (line.x < 0) line.x += window.innerWidth;
        if (line.x > window.innerWidth) line.x -= window.innerWidth;
        if (line.y < 0) line.y += window.innerHeight;
        if (line.y > window.innerHeight) line.y -= window.innerHeight;
    }

    function animate(time) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
        ctx.lineWidth = 0.55;
        ctx.strokeStyle = "rgba(196, 181, 253, 0.08)";
        ctx.beginPath();

        const t = time * 0.00008;
        lines.forEach((line) => {
            const px = line.x;
            const py = line.y;
            const n = perlin2(px * fieldScale + noiseSeed, py * fieldScale + t);
            let angle = n * Math.PI * 2.2;

            if (pointer.active) {
                const dx = pointer.x - px;
                const dy = pointer.y - py;
                const distance = Math.hypot(dx, dy);
                if (distance < vortexRadius && distance > 0.001) {
                    const pull = (1 - distance / vortexRadius) * vortexStrength;
                    const vortexAngle = Math.atan2(dy, dx);
                    angle = lerp(angle, vortexAngle, pull * 0.45);
                }
            }

            line.x += Math.cos(angle) * speed;
            line.y += Math.sin(angle) * speed;
            wrap(line);

            ctx.moveTo(px, py);
            ctx.lineTo(line.x, line.y);
        });

        ctx.stroke();
        window.requestAnimationFrame(animate);
    }

    window.addEventListener("mousemove", (event) => {
        pointer.x = event.clientX;
        pointer.y = event.clientY;
        pointer.active = true;
    });

    window.addEventListener("mouseleave", () => {
        pointer.active = false;
    });

    window.addEventListener("resize", () => {
        resize();
        resetLines();
    });

    resize();
    resetLines();
    window.requestAnimationFrame(animate);
}

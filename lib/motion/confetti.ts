/**
 * Custom lightweight canvas confetti for celebrating task and milestone completions.
 * Zero external dependencies. Uses transform/opacity physics and auto-removes canvas.
 */

interface ConfettiParticle {
  x: number;
  y: number;
  size: number;
  color: string;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

const CELEBRATION_COLORS = [
  "#FFB000", // Saffron
  "#E8457C", // Rose
  "#FFD314", // Gold
  "#2B0A3D", // Plum
  "#FFF8EE", // Ivory
  "#4D1164", // Deep Aubergine
];

export function launchCelebrationConfetti(options?: {
  particleCount?: number;
  originX?: number;
  originY?: number;
  reduceMotion?: boolean;
}): void {
  if (typeof window === "undefined") return;

  // Respect system or user-toggled reduced motion
  if (
    options?.reduceMotion ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "9999";

  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return;
  }

  const width = (canvas.width = window.innerWidth);
  const height = (canvas.height = window.innerHeight);

  const count = options?.particleCount || 65;
  const startX = options?.originX ?? width / 2;
  const startY = options?.originY ?? height * 0.45;

  const particles: ConfettiParticle[] = [];

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 8 + 4;
    particles.push({
      x: startX,
      y: startY,
      size: Math.random() * 8 + 4,
      color: CELEBRATION_COLORS[Math.floor(Math.random() * CELEBRATION_COLORS.length)],
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 5,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 12,
      opacity: 1,
    });
  }

  const gravity = 0.22;
  const drag = 0.985;
  let animationFrameId: number;
  const startTime = Date.now();

  function render() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    const elapsed = Date.now() - startTime;
    let alive = false;

    for (const p of particles) {
      p.vx *= drag;
      p.vy = p.vy * drag + gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;

      if (elapsed > 1200) {
        p.opacity = Math.max(0, p.opacity - 0.025);
      }

      if (p.opacity > 0 && p.y < height + 20) {
        alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
        ctx.restore();
      }
    }

    if (alive && elapsed < 2600) {
      animationFrameId = requestAnimationFrame(render);
    } else {
      cancelAnimationFrame(animationFrameId);
      canvas.remove();
    }
  }

  animationFrameId = requestAnimationFrame(render);
}


(function () {
  'use strict';

  const { rand } = window.KBD_UTILS;

  window.KBD_SYSTEMS = window.KBD_SYSTEMS || {};
  window.KBD_SYSTEMS.effect = {
    addFloater(text, x, y, color) {
  this.floaters.push({ text, x, y, color, life: 900, max: 900 });
},

    addBurst(x, y, color, count, fxType = null) {
  const type = fxType || this.inferFxType(color, count);
  if (type) this.addSpriteEffect(type, x, y, count >= 24 ? 92 : count >= 12 ? 70 : 52, 430);
  if (!this.impactRings) this.impactRings = [];
  if (count >= 8 || type === 'upgrade' || type === 'explosion' || type === 'warning') {
    const radius = count >= 24 ? 86 : count >= 12 ? 58 : 38;
    this.impactRings.push({ x, y, color, life: 360, max: 360, radius, width: type === 'explosion' ? 5 : 3 });
  }
  for (let i = 0; i < count; i += 1) {
    const a = rand(0, Math.PI * 2);
    const s = rand(20, 95);
    this.bursts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: rand(2, 5), color, life: rand(260, 620), max: 620 });
  }
},

    addRunDust(x, y, side) {
  const dir = side >= 0 ? 1 : -1;
  for (let i = 0; i < 3; i += 1) {
    this.bursts.push({
      x,
      y,
      vx: dir * rand(4, 18) + rand(-6, 6),
      vy: -rand(6, 20),
      r: rand(1.5, 3),
      color: '#cdbd8e',
      life: rand(200, 360),
      max: 360
    });
  }
},

    addSpriteEffect(type, x, y, size = 56, max = 430) {
  if (!this.spriteEffects) this.spriteEffects = [];
  this.spriteEffects.push({ x, y, type, life: max, max, size, seed: rand(0, Math.PI * 2) });
},

    addMotionParticle(p) {
  if (!this.motionParticles) this.motionParticles = [];
  this.motionParticles.push({ max: p.life || 520, seed: rand(0, Math.PI * 2), ...p });
},

    addInvestStream(fromX, fromY, toX, toY, color = '#ffd35b', count = 3) {
  if (!this.motionParticles) this.motionParticles = [];
  for (let i = 0; i < count; i += 1) {
    const life = rand(360, 620);
    const delay = i * 40;
    this.motionParticles.push({
      kind: 'stream', fromX, fromY, toX, toY, color,
      life: life + delay, max: life + delay, delay,
      r: rand(2.5, 4.5), arc: rand(-28, -12), seed: rand(0, Math.PI * 2)
    });
  }
},

    addSparkShower(x, y, color = '#fff0bb', count = 8, power = 70) {
  if (!this.motionParticles) this.motionParticles = [];
  for (let i = 0; i < count; i += 1) {
    const a = rand(0, Math.PI * 2);
    const speed = rand(power * 0.35, power);
    const life = rand(360, 720);
    this.motionParticles.push({
      kind: 'spark', x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed - rand(12, 35),
      color, life, max: life, r: rand(1.8, 4.0), seed: rand(0, Math.PI * 2)
    });
  }
},

    addAuraRipple(x, y, color = '#fff0bb', radius = 64, width = 3, max = 520) {
  if (!this.impactRings) this.impactRings = [];
  this.impactRings.push({ x, y, color, life: max, max, radius, width });
},

    inferFxType(color, count) {
  if (count >= 24) return color === '#fff3a3' || color === '#ffe087' ? 'upgrade' : 'explosion';
  if (color === '#b58cff' || color === '#d6f2a3' || color === '#9ee1bb') return 'heal';
  if (color === '#ffd35b' || color === '#f7c95e') return 'coinPickup';
  if (color === '#fff3a3' || color === '#ffe087') return 'upgrade';
  if (color === '#ffdf7b') return 'warning';
  if (color === '#ff8b45' || color === '#ff9b4f' || color === '#ffb25c') return 'explosion';
  return 'hit';
},

    updateEffects(dt) {
  if (this.discoveryToast) {
    this.discoveryToast.life -= dt;
    if (this.discoveryToast.life <= 0) this.discoveryToast = null;
  }
  for (const f of this.floaters) {
    f.life -= dt;
    f.y -= dt * 0.045;
  }
  this.floaters = this.floaters.filter((f) => f.life > 0);
  for (const p of (this.motionParticles || [])) {
    p.life -= dt;
    if (p.kind === 'spark') {
      p.x += p.vx * dt / 1000;
      p.y += p.vy * dt / 1000;
      p.vx *= 0.985;
      p.vy = p.vy * 0.985 + 10 * dt / 1000;
    }
  }
  this.motionParticles = (this.motionParticles || []).filter((p) => p.life > 0);
  for (const s of this.spriteEffects) s.life -= dt;
  this.spriteEffects = this.spriteEffects.filter((s) => s.life > 0);
  for (const d of this.deathSprites) {
    d.life -= dt;
    d.y -= dt * 0.012;
  }
  this.deathSprites = this.deathSprites.filter((d) => d.life > 0);
  for (const r of (this.impactRings || [])) r.life -= dt;
  this.impactRings = (this.impactRings || []).filter((r) => r.life > 0);
  for (const p of this.bursts) {
    p.life -= dt;
    p.x += p.vx * dt / 1000;
    p.y += p.vy * dt / 1000;
    p.vx *= 0.985;
    p.vy *= 0.985;
  }
  this.bursts = this.bursts.filter((p) => p.life > 0);
}
  };
})();

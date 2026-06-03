(function () {
  'use strict';

  const { distXY } = window.KBD_UTILS;

  window.KBD_SYSTEMS = window.KBD_SYSTEMS || {};
  window.KBD_SYSTEMS.projectile = {
    updateProjectiles(dt) {
  for (const p of this.projectiles) {
    if (!p.target || p.target.hp <= 0) {
      p.dead = true;
      continue;
    }
    if (p.trail) {
      p.trail.push({ x: p.x, y: p.y, life: 180 });
      if (p.trail.length > 6) p.trail.shift();
      for (const t of p.trail) t.life -= dt;
      p.trail = p.trail.filter((t) => t.life > 0);
    }
    const dx = p.target.x - p.x;
    const dy = p.target.y - p.y;
    const len = Math.hypot(dx, dy);
    const step = p.speed * dt / 1000;
    if (len <= step) {
      if (p.splash) {
        for (const e of this.enemies) {
          const d = distXY(e.x, e.y, p.target.x, p.target.y);
          if (d <= p.splash) this.damageEnemy(e, p.damage * (1 - d / (p.splash * 1.6)), p.from);
        }
        this.addBurst(p.target.x, p.target.y, '#ffb25c', 14, 'explosion');
      } else {
        this.damageEnemy(p.target, p.damage, p.from);
        this.addBurst(p.target.x, p.target.y, p.color, 5, 'hit');
      }
      if (p.slow) p.target.slow = Math.max(p.target.slow, p.slow);
      p.dead = true;
    } else {
      p.angle = Math.atan2(dy, dx);
      p.x += dx / len * step;
      p.y += dy / len * step;
    }
  }
  this.projectiles = this.projectiles.filter((p) => !p.dead);
}
  };
})();

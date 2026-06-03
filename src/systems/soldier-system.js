(function () {
  'use strict';

  const { distXY } = window.KBD_UTILS;

  window.KBD_SYSTEMS = window.KBD_SYSTEMS || {};
  window.KBD_SYSTEMS.soldier = {
    updateSoldiers(dt) {
  for (const s of this.soldiers) {
    s.attackTimer -= dt;
    s.attack = Math.max(0, (s.attack || 0) - dt);
    const oldX = s.x;
    const oldY = s.y;
    let senseBonus = 0;
    let damageBonus = 1;
    for (const f of this.facilities) {
      if (f.aura && distXY(s.x, s.y, f.x, f.y) < f.range) {
        const detection = f.branch === 'scout' ? 85 : f.branch === 'command' ? 70 : 45;
        senseBonus = Math.max(senseBonus, detection + f.level * 14);
        if (f.type === 'banner' || f.branch === 'morale' || f.branch === 'rally') damageBonus = Math.max(damageBonus, 1.18 + f.level * 0.08);
      }
    }
    let target = s.target && s.target.hp > 0 ? s.target : null;
    if (!target || distXY(target.x, target.y, s.homeX, s.homeY) > s.sense + senseBonus) {
      target = this.nearestEnemy(s.x, s.y, s.sense + senseBonus);
      s.target = target;
    }
    if (target) {
      const d = distXY(s.x, s.y, target.x, target.y);
      if (d > s.range && distXY(s.x, s.y, s.homeX, s.homeY) < s.chase + senseBonus) {
        const dx = target.x - s.x;
        const dy = target.y - s.y;
        const len = Math.hypot(dx, dy) || 1;
        s.x += dx / len * 92 * dt / 1000;
        s.y += dy / len * 92 * dt / 1000;
        if (Math.abs(dx) > 1) s.face = dx > 0 ? 1 : -1;
      } else if (d <= s.range && s.attackTimer <= 0) {
        this.damageEnemy(target, s.damage * damageBonus, 'soldier');
        s.attackTimer = s.type === 'spear' ? 680 : 620;
        s.attackMax = s.type === 'spear' ? 400 : 360;
        s.attack = s.attackMax;
        s.attackPhase = 0;
        s.face = target.x >= s.x ? 1 : -1;
        this.addBurst(target.x, target.y, '#d6bf82', 3, 'hit');
      }
    } else {
      const dx = s.homeX - s.x;
      const dy = s.homeY + 22 - s.y;
      const len = Math.hypot(dx, dy);
      if (len > 4) {
        s.x += dx / len * 58 * dt / 1000;
        s.y += dy / len * 58 * dt / 1000;
        if (Math.abs(dx) > 1) s.face = dx > 0 ? 1 : -1;
      }
    }
    s.moving = distXY(oldX, oldY, s.x, s.y) > 0.2;
    s.animTime = (s.animTime || 0) + dt * (s.moving ? 1.25 : 0.45);
  }
  this.soldiers = this.soldiers.filter((s) => s.hp > 0);
}
  };
})();

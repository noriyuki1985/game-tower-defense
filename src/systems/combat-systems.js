/*
 * Grouped JS file generated in v3.2.2.
 * Behavior should remain identical; only file grouping/script loading changed.
 */


/* ===== src/systems/facility-system.js ===== */

(function () {
  'use strict';

  const C = window.KBD_CONFIG;
  const { rand, dist, distXY, cryptoRandom } = window.KBD_UTILS;

  window.KBD_SYSTEMS = window.KBD_SYSTEMS || {};
  window.KBD_SYSTEMS.facility = {
    updateFacilities(dt) {
  for (const f of this.facilities) {
    f.hit = Math.max(0, f.hit - dt);
    f.fire = Math.max(0, (f.fire || 0) - dt);
    f.work = Math.max(0, (f.work || 0) - dt);
    f.spawnFlash = Math.max(0, (f.spawnFlash || 0) - dt);
    f.buildFlash = Math.max(0, (f.buildFlash || 0) - dt);
    f.levelFlash = Math.max(0, (f.levelFlash || 0) - dt);
    f.upgradeTransition = Math.max(0, (f.upgradeTransition || 0) - dt);
    f.maxLevelPulse = Math.max(0, (f.maxLevelPulse || 0) - dt);
    if (f.attack) {
      f.cooldown -= dt;
      if (f.cooldown <= 0) {
        const target = this.nearestEnemy(f.x, f.y, f.range);
        if (target) {
          const cooldown = Math.max(220, f.baseCooldown * (1 - (f.level - 1) * 0.08));
          f.cooldown = cooldown;
          f.fire = f.type === 'cannon' ? 260 : 170;
          f.fireAngle = Math.atan2(target.y - f.y, target.x - f.x);
          this.addSpriteEffect(f.type === 'cannon' ? 'explosion' : 'hit', f.x + Math.cos(f.fireAngle) * 18, f.y - 18 + Math.sin(f.fireAngle) * 10, f.type === 'cannon' ? 46 : 34, 250);
          if (this.addAuraRipple) this.addAuraRipple(f.x, f.y - 12, f.type === 'cannon' ? '#ffb25c' : '#fff0bb', f.type === 'cannon' ? 46 : 32, f.type === 'cannon' ? 3 : 2, 260);
          this.playSfx(f.type === 'cannon' ? 'cannonShot' : 'arrowShot', f.type === 'cannon' ? 180 : 80);
          this.projectiles.push({
            x: f.x, y: f.y - 12, target, speed: f.projectileSpeed, damage: f.damage,
            color: f.projectile, splash: f.splash || 0, slow: f.slow || 0, from: f.type,
            trail: [], angle: f.fireAngle || 0
          });
        }
      }
    }
    if (f.economy) {
      f.incomeTimer -= dt;
      if (f.incomeTimer <= 0) {
        f.incomeTimer = Math.max(900, f.incomeTime);
        const coin = Math.round(f.income);
        this.coins.push({ x: f.x + rand(-14, 14), y: f.y + rand(-14, 14), value: coin, r: 8, life: 22000, animSeed: rand(0, Math.PI * 2) });
        f.work = 420;
        this.addBurst(f.x, f.y - 20, '#ffd35b', 5, 'coinPickup');
        if (this.addSparkShower) this.addSparkShower(f.x, f.y - 18, '#ffd35b', 7, 55);
        this.addFloater(`+${coin}`, f.x, f.y - 30, '#ffd35b');
      }
    }
    if (f.spawn) {
      f.spawnTimer -= dt;
      const max = f.soldierCap || (3 + f.level);
      const current = this.soldiers.filter((s) => s.homeId === f.id).length;
      if (f.spawnTimer <= 0 && current < max && this.soldiers.length < this.kingdom.popCap) {
        f.spawnTimer = Math.max(1200, f.spawnTime);
        const soldierDef = this.soldierStatsFor(f);
        this.soldiers.push({
          id: cryptoRandom(), homeId: f.id, type: soldierDef.type, x: f.x + rand(-18, 18), y: f.y + 24 + rand(-8, 8),
          homeX: f.x, homeY: f.y, r: soldierDef.r, hp: soldierDef.hp, maxHp: soldierDef.hp,
          damage: soldierDef.damage, range: soldierDef.range, sense: soldierDef.sense, chase: soldierDef.chase,
          attackTimer: rand(0, 350), target: null, animSeed: rand(0, Math.PI * 2), attack: 0, attackMax: 360, attackPhase: 0
        });
        f.spawnFlash = 520;
        this.addBurst(f.x, f.y + 6, '#d6bf82', 6, 'build');
        if (this.addAuraRipple) this.addAuraRipple(f.x, f.y + 8, '#d6bf82', 42, 2, 420);
        this.addFloater('兵士', f.x, f.y - 28, '#d6bf82');
        this.playSfx('spawn', 220);
      }
    }
  }
},

    soldierStatsFor(f) {
  const base = {
    type: f.level >= 4 ? 'shield' : f.level >= 3 ? 'spear' : 'militia', r: f.level >= 4 ? 10 : 9,
    hp: f.soldierHp || (48 + f.level * 10),
    damage: f.soldierDamage || (9 + f.level * 3),
    range: f.level >= 3 ? 36 : 31,
    sense: f.soldierSense || (102 + f.level * 12),
    chase: f.soldierChase || (74 + f.level * 8)
  };
  if (f.branch === 'shield') {
    base.type = 'shield';
    base.hp = Math.round(base.hp * 1.75);
    base.damage = Math.round(base.damage * 0.8);
    base.chase -= 10;
    base.r = 10;
  } else if (f.branch === 'spear') {
    base.type = 'spear';
    base.damage = Math.round(base.damage * 1.45);
    base.range += 13;
    base.sense += 20;
  }
  base.damage = Math.round(base.damage * this.kingdom.soldierDamageBonus);
  base.hp = Math.round(base.hp * this.kingdom.soldierHpBonus);
  return base;
},

    destroyFacility(f) {
  this.addBurst(f.x, f.y, '#ff765e', 24, 'explosion');
  this.addFloater('破壊', f.x, f.y - 36, '#ff765e');
  for (const pad of this.pads) {
    if (pad.facilityId === f.id) {
      pad.facilityId = null;
      pad.invested = 0;
      pad.upgradeInvested = 0;
    }
  }
  this.soldiers = this.soldiers.filter((s) => s.homeId !== f.id);
  this.facilities = this.facilities.filter((x) => x !== f);
}
  };
})();


/* ===== src/systems/projectile-system.js ===== */

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

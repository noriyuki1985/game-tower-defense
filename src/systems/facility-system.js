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
        f.incomeTimer = Math.max(900, f.incomeTime - (f.level - 1) * 420);
        const coin = Math.round(f.income * (1 + (f.level - 1) * 0.35));
        this.coins.push({ x: f.x + rand(-14, 14), y: f.y + rand(-14, 14), value: coin, r: 8, life: 22000, animSeed: rand(0, Math.PI * 2) });
        f.work = 420;
        this.addBurst(f.x, f.y - 20, '#ffd35b', 5, 'coinPickup');
        this.addFloater(`+${coin}`, f.x, f.y - 30, '#ffd35b');
      }
    }
    if (f.trap) {
      f.cooldown -= dt;
      if (f.cooldown <= 0) {
        const target = this.nearestEnemy(f.x, f.y, f.range);
        if (target) {
          f.cooldown = f.baseCooldown;
          f.fire = 360;
          const radius = f.branch === 'barbed' ? f.range + 8 : f.range;
          for (const e of this.enemies) {
            const d = distXY(e.x, e.y, f.x, f.y);
            if (d <= radius) {
              this.damageEnemy(e, f.damage * (1 - d / (radius * 1.8)), 'trap');
              e.slow = Math.max(e.slow, f.slow || 0);
            }
          }
          this.addBurst(f.x, f.y, f.branch === 'frost' ? '#bdeeff' : '#f08b59', 16, f.branch === 'frost' ? 'hit' : 'explosion');
        }
      }
    }
    if (f.spawn) {
      f.spawnTimer -= dt;
      const max = 3 + f.level;
      const current = this.soldiers.filter((s) => s.homeId === f.id).length;
      if (f.spawnTimer <= 0 && current < max && this.soldiers.length < this.kingdom.popCap) {
        f.spawnTimer = Math.max(1500, f.spawnTime - (f.level - 1) * 550);
        const soldierDef = this.soldierStatsFor(f);
        this.soldiers.push({
          id: cryptoRandom(), homeId: f.id, type: soldierDef.type, x: f.x + rand(-18, 18), y: f.y + 24 + rand(-8, 8),
          homeX: f.x, homeY: f.y, r: soldierDef.r, hp: soldierDef.hp, maxHp: soldierDef.hp,
          damage: soldierDef.damage, range: soldierDef.range, sense: soldierDef.sense, chase: soldierDef.chase,
          attackTimer: rand(0, 350), target: null, animSeed: rand(0, Math.PI * 2), attack: 0, attackMax: 360, attackPhase: 0
        });
        f.spawnFlash = 520;
        this.addBurst(f.x, f.y + 6, '#d6bf82', 6, 'build');
        this.addFloater('兵士', f.x, f.y - 28, '#d6bf82');
      }
    }
    if (f.repair) {
      let healed = false;
      for (const other of this.facilities) {
        if (other === f || other.hp >= other.maxHp) continue;
        if (dist(f, other) <= f.range) {
          other.hp = Math.min(other.maxHp, other.hp + f.repairRate * (1 + (f.level - 1) * 0.35) * dt / 1000);
          healed = true;
        }
      }
      if (healed) {
        f.work = 260;
        if (this.time % 560 < dt) this.addBurst(f.x, f.y - 16, '#9ee1bb', 4, 'heal');
      }
    }
  }
},

    soldierStatsFor(f) {
  const base = {
    type: 'militia', r: 9,
    hp: 48 + f.level * 10,
    damage: 9 + f.level * 3,
    range: 31,
    sense: 102 + f.level * 12,
    chase: 74 + f.level * 8
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

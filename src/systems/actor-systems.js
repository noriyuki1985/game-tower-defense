/*
 * Grouped JS file generated in v3.2.2.
 * Behavior should remain identical; only file grouping/script loading changed.
 */


/* ===== src/systems/king-system.js ===== */

(function () {
  'use strict';

  const C = window.KBD_CONFIG;
  const { clamp, distXY, rand } = window.KBD_UTILS;

  window.KBD_SYSTEMS = window.KBD_SYSTEMS || {};
  window.KBD_SYSTEMS.king = {
    updateKing(dt) {
  const oldX = this.king.x;
  const oldY = this.king.y;
  if (this.king.stunned > 0) {
    this.king.attackTimer -= dt;
    this.king.moving = false;
    return;
  }
  const regen = (C.balance && C.balance.kingRegenPerSecond) || 2.2;
  if (this.king.hp > 0 && this.king.hp < this.king.maxHp) {
    this.king.hp = Math.min(this.king.maxHp, this.king.hp + regen * dt / 1000);
  }
  let vx = 0;
  let vy = 0;
  if (this.keys.has('a') || this.keys.has('arrowleft')) vx -= 1;
  if (this.keys.has('d') || this.keys.has('arrowright')) vx += 1;
  if (this.keys.has('w') || this.keys.has('arrowup')) vy -= 1;
  if (this.keys.has('s') || this.keys.has('arrowdown')) vy += 1;
  if (vx !== 0 || vy !== 0) {
    this.pointerTarget = null;
    const len = Math.hypot(vx, vy) || 1;
    this.king.x += (vx / len) * C.kingSpeed * dt / 1000;
    this.king.y += (vy / len) * C.kingSpeed * dt / 1000;
    if (Math.abs(vx) > 0.05) this.king.face = vx > 0 ? 1 : -1;
  } else if (this.pointerTarget) {
    const dx = this.king.targetX - this.king.x;
    const dy = this.king.targetY - this.king.y;
    const len = Math.hypot(dx, dy);
    const step = C.kingSpeed * dt / 1000;
    if (len <= step) {
      this.king.x = this.king.targetX;
      this.king.y = this.king.targetY;
      this.pointerTarget = null;
    } else {
      this.king.x += dx / len * step;
      this.king.y += dy / len * step;
      if (Math.abs(dx) > 1) this.king.face = dx > 0 ? 1 : -1;
    }
  }
  this.king.x = clamp(this.king.x, 18, this.worldWidth() - 18);
  this.king.y = clamp(this.king.y, 128, this.worldHeight() - 18);
  const moved = distXY(oldX, oldY, this.king.x, this.king.y);
  this.king.moving = moved > 0.25;
  this.king.speedRatio = clamp((moved / Math.max(1, dt)) / (C.kingSpeed / 1000), 0, 1.35);
  if (this.king.moving) {
    this.king.runDistance = (this.king.runDistance || 0) + moved;
    this.king.moveAngle = Math.atan2(this.king.y - oldY, this.king.x - oldX);
    this.king.stepTimer = (this.king.stepTimer || 0) + moved;
    if (this.king.stepTimer > 24) {
      this.king.stepTimer = 0;
      this.king.lastStepSide = -(this.king.lastStepSide || 1);
      this.addRunDust(this.king.x - Math.cos(this.king.moveAngle || 0) * 14, this.king.y + 16, this.king.lastStepSide || 1);
    }
  }
  this.king.animTime = (this.king.animTime || 0) + dt * (this.king.moving ? 2.15 : 0.72);
  this.king.attackTimer -= dt;
  if (this.king.attackTimer <= 0) {
    const target = this.nearestEnemy(this.king.x, this.king.y, 52);
    if (target) {
      this.damageEnemy(target, 22, 'king');
      this.king.attackTimer = 390;
      this.king.attackFlash = 180;
      this.addBurst(target.x, target.y, '#fff2a8', 5, 'hit');
      this.addFloater('斬撃', target.x, target.y - 18, '#fff2a8');
    }
  }
  this.king.attackFlash = Math.max(0, (this.king.attackFlash || 0) - dt);
},

    downKing(enemy) {
  const downX = this.king.x;
  const downY = this.king.y;
  const stunMs = (C.balance && C.balance.kingDownStunMs) || 5000;
  const reviveInvulnMs = (C.balance && C.balance.kingReviveInvulnMs) || 2000;
  const reviveHpRatio = (C.balance && C.balance.kingReviveHpRatio) || 0.10;
  const lost = Math.min(35, Math.floor((this.king.coins || 0) * 0.25));
  if (lost > 0) {
    this.king.coins = Math.max(0, this.king.coins - lost);
    let remaining = lost;
    const piles = Math.min(5, Math.max(1, Math.ceil(lost / 10)));
    for (let i = 0; i < piles; i += 1) {
      const value = i === piles - 1 ? remaining : Math.max(1, Math.floor(lost / piles));
      remaining -= value;
      this.coins.push({
        x: downX + rand(-24, 24), y: downY + rand(-20, 24), value, r: 8,
        life: 24000, animSeed: rand(0, Math.PI * 2)
      });
    }
  }
  this.king.hp = Math.max(1, Math.ceil(this.king.maxHp * reviveHpRatio));
  this.king.stunned = stunMs;
  this.king.invuln = 0;
  this.king.reviveInvulnPending = reviveInvulnMs;
  this.king.targetX = this.castle.x + 42;
  this.king.targetY = this.castle.y + 82;
  this.king.x = clamp(this.king.targetX, 18, this.worldWidth() - 18);
  this.king.y = clamp(this.king.targetY, 128, this.worldHeight() - 18);
  this.king.face = 1;
  this.pointerTarget = null;
  this.kingDownCount = (this.kingDownCount || 0) + 1;
  this.shake = Math.max(this.shake || 0, 260);
  this.addBurst(downX, downY, '#ff6b5e', 22, 'warning');
  this.addBurst(this.king.x, this.king.y, '#ffdf7b', 16, 'heal');
  if (this.addAuraRipple) {
    this.addAuraRipple(downX, downY, '#ff6b5e', 86, 5, 720);
    this.addAuraRipple(this.king.x, this.king.y, '#ffdf7b', 70, 4, 680);
  }
  this.addFloater('王、撤退', downX, downY - 50, '#ff6b5e');
  this.addFloater(`落とした金 ${lost}`, downX, downY - 68, '#ffd35b');
  this.addFloater('復帰準備', this.king.x, this.king.y - 48, '#ffdf7b');
  this.message = `王が倒れ、城の近くへ撤退しました。${Math.ceil(stunMs / 1000)}秒間操作不能。落とした金: ${lost}`;
  if (this.setNotice) this.setNotice(this.message, 'danger', 4200, 9);
  this.playSfx('stun');
},

    damageKing(amount, enemy) {
  if (this.king.invuln > 0 || this.king.stunned > 0) return;
  this.king.hp -= amount;
  this.king.invuln = 650;
  this.shake = 130;
  this.addBurst(this.king.x, this.king.y, '#ffdf7b', 9, 'warning');
  this.addFloater(`王 -${Math.round(amount)}`, this.king.x, this.king.y - 40, '#ffdf7b');
  this.playSfx('kingHit', 320);
  if (this.king.hp <= 0) {
    this.downKing(enemy);
    return;
  }
  if (enemy) {
    const dx = this.king.x - enemy.x;
    const dy = this.king.y - enemy.y;
    const len = Math.hypot(dx, dy) || 1;
    this.king.x = clamp(this.king.x + dx / len * 18, 18, this.worldWidth() - 18);
    this.king.y = clamp(this.king.y + dy / len * 18, 128, this.worldHeight() - 18);
  }
}
  };
})();


/* ===== src/systems/enemy-system.js ===== */

(function () {
  'use strict';

  const C = window.KBD_CONFIG;
  const { dist, distXY, rand, cryptoRandom } = window.KBD_UTILS;

  window.KBD_SYSTEMS = window.KBD_SYSTEMS || {};
  window.KBD_SYSTEMS.enemy = {
    chooseRaidTarget(type, route = 'main', forceRaid = false) {
  const sites = this.activeDiscoverySites ? this.activeDiscoverySites().filter((d) => !d.siteDisabled && (d.siteHp || 0) > 0) : [];
  if (!sites.length) return null;
  const raidChance = {
    runner: 0.05,
    saboteur: 0.28,
    bomber: 0.12,
    siege: 0.18,
    brute: 0.03,
    shield: 0.02
  }[type] || 0;
  if (!forceRaid && rand(0, 1) > raidChance) return null;
  const start = (this.routePath(route) || [])[0] || { x: this.castle.x, y: this.castle.y };
  const weighted = sites.map((s) => {
    const hpRatio = (s.siteHp || 1) / Math.max(1, s.siteMaxHp || 1);
    const kindWeight = s.kind === 'outpost' ? 0.85 : s.kind === 'resource' || s.kind === 'market' ? 1.05 : 1;
    const d = distXY(start.x, start.y, s.x, s.y);
    return { site: s, score: d / kindWeight + hpRatio * 60 + rand(-18, 18) };
  }).sort((a, b) => a.score - b.score);
  return weighted[0] ? weighted[0].site : null;
},

    buildRaidPath(route, site) {
  if (this.raidTrailPathForSite) return this.raidTrailPathForSite(site, route);
  const base = this.routePath(route) || [];
  const start = base[0] || { x: 0, y: 0 };
  const mid = base[Math.min(base.length - 1, Math.max(1, Math.floor(base.length * 0.42)))] || start;
  return [
    { x: start.x, y: start.y },
    { x: Math.round((mid.x * 0.7 + site.x * 0.3)), y: Math.round((mid.y * 0.7 + site.y * 0.3)) },
    { x: site.x, y: site.y }
  ];
},

    updateEnemies(dt) {
  for (const e of this.enemies) {
    e.hit = Math.max(0, e.hit - dt);
    e.spawnLife = Math.max(0, (e.spawnLife || 0) - dt);
    e.slow = Math.max(0, e.slow - dt);
    e.kingHitTimer = Math.max(0, e.kingHitTimer - dt);
    let speedMul = e.slow > 0 ? 0.48 : 1;
    if (this.isBuffedByBoss(e)) speedMul *= 1.16;
    this.updateEnemySpecial(e, dt);
    const blocker = this.findBlocker(e);
    if (blocker) {
      e.isWalking = false;
      if (e.def.explode && !e.exploded) {
        this.explodeEnemy(e, blocker.x, blocker.y, 'blocker');
        continue;
      }
      if ((blocker.branch === 'thorns' || blocker.branch === 'gate') && this.time % 220 < dt) {
        this.damageEnemy(e, blocker.branch === 'gate' ? 8 : 5, 'blocker');
      }
      e.attackTimer -= dt;
      if (e.attackTimer <= 0) {
        const facilityDamage = e.def.damage * (e.def.siege ? 2.15 : 1);
        blocker.hp -= facilityDamage;
        blocker.hit = 160;
        this.addBurst(blocker.x, blocker.y, e.def.siege ? '#ff9d55' : '#d59a58', e.def.siege ? 8 : 4);
        e.attackTimer = e.def.siege ? 920 : 760;
        if (blocker.hp <= 0) this.destroyFacility(blocker);
      }
      continue;
    }
    const target = e.path[e.pathIndex];
    if (!target) {
      if (e.raidTargetId) {
        const site = (this.discoveries || []).find((d) => d.id === e.raidTargetId);
        if (site && site.discovered) {
          if (e.def.explode && !e.exploded) this.explodeEnemy(e, site.x, site.y, 'site');
          this.damageDiscoverySite(site, e.def.damage * (e.def.siege ? 1.10 : 0.86), e);
          e.reachedSite = true;
          e.hp = 0;
          continue;
        }
      }
      if (e.def.explode && !e.exploded) this.explodeEnemy(e, this.castle.x, this.castle.y + 18, 'castle');
      this.castle.hp -= e.def.damage;
      this.castle.hit = 240;
      this.playSfx('castleHit', 280);
      this.shake = 220;
      this.addBurst(this.castle.x, this.castle.y + 18, '#ff6b5e', 9);
      e.reachedCastle = true;
      e.hp = 0;
      continue;
    }
    const dx = target.x - e.x;
    const dy = target.y - e.y;
    const len = Math.hypot(dx, dy);
    const step = e.def.speed * speedMul * dt / 1000;
    if (len <= step) {
      e.x = target.x;
      e.y = target.y;
      e.pathIndex += 1;
      e.walkDistance = (e.walkDistance || 0) + Math.max(0, len);
      e.isWalking = true;
      if (len > 0.001) { e.lastDx = dx / len; e.lastDy = dy / len; }
    } else {
      const nx = dx / len;
      const ny = dy / len;
      e.x += nx * step;
      e.y += ny * step;
      e.walkDistance = (e.walkDistance || 0) + Math.max(0, step);
      e.lastDx = nx;
      e.lastDy = ny;
      e.isWalking = true;
    }
    if (this.king.stunned <= 0 && e.kingHitTimer <= 0 && distXY(e.x, e.y, this.king.x, this.king.y) < e.r + this.king.r + 2) {
      this.damageKing(e.def.kingDamage || 8, e);
      e.kingHitTimer = 850;
    }
  }
  this.enemies = this.enemies.filter((e) => {
    if (e.hp <= 0) {
      if (!e.reachedCastle && !e.reachedSite) this.onEnemyKilled(e);
      return false;
    }
    return true;
  });
},

    isBuffedByBoss(enemy) {
  if (!enemy || enemy.def.boss) return false;
  for (const other of this.enemies) {
    if (other === enemy || !other.def.boss || !other.def.aura || other.hp <= 0) continue;
    if (distXY(enemy.x, enemy.y, other.x, other.y) <= other.def.aura) return true;
  }
  return false;
},

    updateEnemySpecial(enemy, dt) {
  enemy.specialTimer -= dt;
  if (enemy.def.healAura && enemy.specialTimer <= 0) {
    enemy.specialTimer = 720;
    let healed = false;
    for (const ally of this.enemies) {
      if (ally === enemy || ally.hp <= 0 || ally.hp >= ally.maxHp) continue;
      if (distXY(enemy.x, enemy.y, ally.x, ally.y) <= enemy.def.healAura) {
        ally.hp = Math.min(ally.maxHp, ally.hp + enemy.def.healRate);
        healed = true;
      }
    }
    if (healed) {
      this.addBurst(enemy.x, enemy.y, '#b58cff', 8);
      if (this.addAuraRipple) this.addAuraRipple(enemy.x, enemy.y, '#b58cff', enemy.def.healAura || 58, 2, 520);
    }
  }
  if (enemy.def.targetFacility && enemy.specialTimer <= 0) {
    const target = this.nearestFacility(enemy.x, enemy.y, 46);
    if (target) {
      target.hp -= 10;
      target.hit = 150;
      enemy.specialTimer = 850;
      this.addBurst(target.x, target.y, '#ff9b4f', 4);
      if (this.addSparkShower) this.addSparkShower(target.x, target.y - 12, '#ff9b4f', 5, 48);
      if (target.hp <= 0) this.destroyFacility(target);
    }
  }
},

    nearestFacility(x, y, range) {
  let best = null;
  let bestD = range;
  for (const f of this.facilities) {
    if (f.hp <= 0) continue;
    const d = distXY(x, y, f.x, f.y);
    if (d < bestD) {
      best = f;
      bestD = d;
    }
  }
  return best;
},

    explodeEnemy(enemy, x, y, reason) {
  enemy.exploded = true;
  enemy.hp = 0;
  const radius = enemy.def.explodeRadius || 52;
  for (const f of this.facilities) {
    const d = distXY(x, y, f.x, f.y);
    if (d <= radius) {
      f.hp -= enemy.def.damage * 1.7 * (1 - d / (radius * 1.5));
      f.hit = 180;
      if (f.hp <= 0) this.destroyFacility(f);
    }
  }
  for (const s of this.soldiers) {
    const d = distXY(x, y, s.x, s.y);
    if (d <= radius) s.hp -= enemy.def.damage * 1.1 * (1 - d / (radius * 1.6));
  }
  if (reason === 'castle') {
    this.castle.hp -= enemy.def.damage * 0.85;
    this.castle.hit = 240;
  }
  this.addBurst(x, y, '#ff8b45', 28, 'explosion');
  this.playSfx('explosion', 180);
  this.shake = Math.max(this.shake, 190);
  this.addFloater('爆発', x, y - 22, '#ffb45c');
},

    findBlocker(enemy) {
  for (const f of this.facilities) {
    if (!f.block || f.hp <= 0) continue;
    if (distXY(enemy.x, enemy.y, f.x, f.y) < f.blockRadius + enemy.r + 4) return f;
  }
  return null;
},

    onEnemyKilled(enemy) {
  this.score += enemy.def.score;
  const n = enemy.def.boss ? 8 : enemy.type === 'siege' ? 4 : enemy.type === 'brute' ? 3 : enemy.type === 'shaman' ? 3 : enemy.type === 'bomber' ? 2 : 1;
  for (let i = 0; i < n; i += 1) {
    if (this.coins.length > C.maxCoinsOnGround) break;
    const value = Math.max(1, Math.round(enemy.def.coin * this.kingdom.economyBonus / n));
    this.coins.push({ x: enemy.x + rand(-14, 14), y: enemy.y + rand(-14, 14), value, r: 7, life: 18000, animSeed: rand(0, Math.PI * 2) });
  }
  const assetKey = this.enemyAssetKey(enemy.type);
  const enemyScale = enemy.def.boss ? enemy.r * 3.9 : enemy.def.siege ? enemy.r * 4.4 : enemy.r * 4.0;
  this.deathSprites.push({ x: enemy.x, y: enemy.y - enemy.r * 0.15, assetKey, size: enemyScale, life: 520, max: 520, spin: rand(-0.18, 0.18) });
  this.addBurst(enemy.x, enemy.y, enemy.def.color, enemy.def.boss ? 24 : 8, enemy.def.boss || enemy.type === 'bomber' ? 'explosion' : 'hit');
  this.playSfx(enemy.def.boss ? 'bossDown' : 'enemyDown', enemy.def.boss ? 0 : 90);
},

    damageEnemy(enemy, amount, source) {
  if (!enemy || enemy.hp <= 0) return;
  let dmg = amount;
  if (enemy.def.armor && source !== 'king') dmg *= 1 - enemy.def.armor;
  const strongHit = dmg >= 18 || enemy.hit <= 0;
  enemy.hp -= dmg;
  enemy.hit = 140;
  if (strongHit) this.addSpriteEffect('hit', enemy.x, enemy.y - enemy.r * 0.25, enemy.def.boss ? 64 : 42, 250);
  if (enemy.def.armor && source !== 'king' && this.addSparkShower) this.addSparkShower(enemy.x, enemy.y - enemy.r * 0.1, '#dce5ff', 3, 40);
},

    nearestEnemy(x, y, range) {
  let best = null;
  let bestD = range;
  for (const e of this.enemies) {
    const d = distXY(x, y, e.x, e.y);
    if (d < bestD) {
      best = e;
      bestD = d;
    }
  }
  return best;
}
  };
})();


/* ===== src/systems/soldier-system.js ===== */

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

/*
 * Grouped JS file generated in v3.2.2.
 * Behavior should remain identical; only file grouping/script loading changed.
 */


/* ===== src/systems/build-system.js ===== */

(function () {
  'use strict';

  const C = window.KBD_CONFIG;
  const { $, distXY, rand, cryptoRandom } = window.KBD_UTILS;

  window.KBD_SYSTEMS = window.KBD_SYSTEMS || {};
  window.KBD_SYSTEMS.build = {
    updateCoins(dt) {
  for (const coin of this.coins) {
    coin.life -= dt;
    if (this.king.stunned > 0) continue;
    const d = distXY(this.king.x, this.king.y, coin.x, coin.y);
    if (d < C.coinPickupRange) {
      this.king.coins += coin.value;
      if (this.tutorialMode && this.tutorial) this.tutorial.coinsPicked = (this.tutorial.coinsPicked || 0) + coin.value;
      coin.dead = true;
      this.addFloater(`+${coin.value}`, this.king.x, this.king.y - 28, '#ffd35b');
      this.addBurst(coin.x, coin.y, '#ffd35b', 4, 'coinPickup');
      this.playSfx('coin', 65);
    } else if (d < 74) {
      const dx = this.king.x - coin.x;
      const dy = this.king.y - coin.y;
      const len = Math.hypot(dx, dy) || 1;
      coin.x += dx / len * 145 * dt / 1000;
      coin.y += dy / len * 145 * dt / 1000;
    }
  }
  this.coins = this.coins.filter((c) => !c.dead && c.life > 0);
},

    updateBuildPayments(dt) {
  if (this.king.stunned > 0) {
    this.king.payBuffer = 0;
    this.king.buildHoldPadId = null;
    this.king.buildHoldTime = 0;
    for (const pad of this.pads) pad.holdTime = 0;
    return;
  }
  let activePad = null;
  for (const pad of this.pads) {
    pad.pulse += dt;
    if (pad.revealFlash) pad.revealFlash = Math.max(0, pad.revealFlash - dt);
    if (this.isPadVisible && !this.isPadVisible(pad)) continue;
    if (distXY(this.king.x, this.king.y, pad.x, pad.y) < 34) {
      activePad = pad;
      break;
    }
  }
  if (!activePad) {
    this.king.payBuffer = 0;
    this.king.buildHoldPadId = null;
    this.king.buildHoldTime = 0;
    for (const pad of this.pads) pad.holdTime = 0;
    return;
  }
  if (this.tutorialMode && this.tutorialCanUsePad && !this.tutorialCanUsePad(activePad)) {
    this.king.payBuffer = 0;
    this.king.buildHoldPadId = null;
    this.king.buildHoldTime = 0;
    for (const pad of this.pads) pad.holdTime = 0;
    if (this.tutorialRejectPad) this.tutorialRejectPad(activePad);
    return;
  }
  const holdNeed = C.buildHoldTime || 620;
  if (this.king.buildHoldPadId !== activePad.id) {
    this.king.buildHoldPadId = activePad.id;
    this.king.buildHoldTime = 0;
    for (const pad of this.pads) pad.holdTime = 0;
  }
  activePad.holdTime = Math.min(holdNeed, (activePad.holdTime || 0) + dt);
  this.king.buildHoldTime = activePad.holdTime;

  if (!this.isPadUnlocked(activePad)) {
    this.king.payBuffer = 0;
    this.message = `${C.facilityTypes[activePad.type].name}は未解放です。領土${activePad.territory}が必要。前哨基地を建ててください。`;
    if (this.time % 480 < dt) this.addFloater('領土不足', activePad.x, activePad.y - 34, '#d7d7d7');
    return;
  }
  const def = C.facilityTypes[activePad.type];
  if (activePad.holdTime < holdNeed) {
    if (this.time % 260 < dt && this.addSparkShower) this.addSparkShower(activePad.x, activePad.y - 8, '#fff0bb', 2, 24);
    const wait = Math.max(0, Math.ceil((holdNeed - activePad.holdTime) / 100) / 10);
    this.message = `${def.name}: ${wait.toFixed(1)}秒滞在で投資開始。${this.facilityShortText ? this.facilityShortText(activePad.type) : ''}`;
    return;
  }
  const existing = activePad.facilityId ? this.facilities.find((f) => f.id === activePad.facilityId) : null;
  if (!existing) {
    if (activePad.invested >= def.cost) return;
    this.spendIntoPad(activePad, def.cost, dt, () => this.completePad(activePad));
  } else if (existing.level < this.facilityMaxLevel(existing.type)) {
    const need = this.getUpgradeNeed(existing);
    this.spendIntoPad(activePad, need, dt, () => this.upgradeFacility(existing, activePad));
  } else {
    this.message = `${def.name}はLv.${this.facilityMaxLevel(existing.type)}で最大強化です。主人公を別の建設床へ向かわせてください。`;
  }
},

    isPadUnlocked(pad) {
  return !pad.territory || pad.territory <= this.kingdom.territory;
},

    facilityMaxLevel(type) {
  const def = C.facilityTypes[type];
  return (def && def.maxLevel) || 3;
},

    facilityLevelStats(type, level) {
  const def = C.facilityTypes[type];
  return def && def.levelStats ? (def.levelStats[level] || def.levelStats[1] || null) : null;
},

    getUpgradeNeed(f) {
  const nextLevel = Math.min(this.facilityMaxLevel(f.type), (f.level || 1) + 1);
  const stats = this.facilityLevelStats(f.type, nextLevel);
  if (stats && stats.upgradeCost != null) return Math.round(stats.upgradeCost);
  const def = C.facilityTypes[f.type];
  return Math.round((def.upgradeCost || 80) * (f.level || 1));
},

    applyFacilityLevelStats(f, level, keepHpRatio = false) {
  const stats = this.facilityLevelStats(f.type, level);
  if (!stats) return;
  const beforeMax = Math.max(1, f.maxHp || stats.hp || 1);
  const hpRatio = keepHpRatio ? Math.max(0, Math.min(1, (f.hp || beforeMax) / beforeMax)) : 1;
  f.level = level;
  if (stats.hp != null) {
    f.maxHp = stats.hp;
    f.hp = Math.max(1, Math.round(f.maxHp * hpRatio));
  }
  if (stats.range != null) f.range = stats.range;
  if (stats.blockRadius != null) f.blockRadius = stats.blockRadius;
  if (stats.blockArmor != null) f.blockArmor = stats.blockArmor;
  if (stats.damage != null) f.damage = stats.damage;
  if (stats.cooldown != null) {
    f.baseCooldown = stats.cooldown;
    f.cooldown = Math.min(f.cooldown || stats.cooldown, stats.cooldown);
  }
  if (stats.splash != null) f.splash = stats.splash;
  if (stats.spawnTime != null) {
    f.spawnTime = stats.spawnTime;
    f.spawnTimer = Math.min(f.spawnTimer || stats.spawnTime, stats.spawnTime);
  }
  if (stats.incomeTime != null) {
    f.incomeTime = stats.incomeTime;
    f.incomeTimer = Math.min(f.incomeTimer || stats.incomeTime, stats.incomeTime);
  }
  if (stats.income != null) f.income = stats.income;
  if (stats.soldierCap != null) f.soldierCap = stats.soldierCap;
  if (stats.soldierHp != null) f.soldierHp = stats.soldierHp;
  if (stats.soldierDamage != null) f.soldierDamage = stats.soldierDamage;
  if (stats.soldierSense != null) f.soldierSense = stats.soldierSense;
  if (stats.soldierChase != null) f.soldierChase = stats.soldierChase;
  f.accent = this.levelColor ? this.levelColor(level) : ((C.levelColors && C.levelColors[level]) || f.accent);
},

    levelColor(level) {
  return (C.levelColors && C.levelColors[level]) || '#fff3a3';
},

    triggerFacilityUpgradeFx(f, nextLevel, def, options = {}) {
  const color = this.levelColor(nextLevel);
  const isFinal = !!options.isFinal;
  const prevLevel = options.prevLevel || Math.max(1, nextLevel - 1);
  const bannerLife = isFinal ? 1680 : 1240;
  f.upgradeFromLevel = prevLevel;
  f.upgradeToLevel = nextLevel;
  f.upgradeTransition = isFinal ? 1360 : 980;
  f.upgradeTransitionMax = f.upgradeTransition;
  f.maxLevelPulse = isFinal ? 1480 : 0;
  f.levelFlash = isFinal ? 1320 : 980;
  f.buildFlash = Math.max(f.buildFlash || 0, isFinal ? 980 : 820);
  f.accent = color;
  this.addBurst(f.x, f.y, color, isFinal ? 42 : 30, 'upgrade');
  this.addBurst(f.x, f.y - 18, '#ffe9a8', isFinal ? 22 : 14, 'upgrade');
  if (this.addAuraRipple) {
    this.addAuraRipple(f.x, f.y, color, isFinal ? 132 : 96, isFinal ? 7 : 5, isFinal ? 980 : 720);
    this.addAuraRipple(f.x, f.y - 8, '#fff0bb', isFinal ? 106 : 74, isFinal ? 4 : 3, isFinal ? 760 : 540);
  }
  if (this.addSparkShower) {
    this.addSparkShower(f.x, f.y - 20, color, isFinal ? 30 : 18, isFinal ? 126 : 92);
    this.addSparkShower(f.x, f.y - 28, '#fff0bb', isFinal ? 18 : 10, isFinal ? 110 : 72);
  }
  this.addFloater('LEVEL UP!', f.x, f.y - 70, '#fff3a3');
  this.addFloater(`Lv.${nextLevel}`, f.x, f.y - 48, color);
  if (isFinal) this.addFloater('MAX LEVEL!', f.x, f.y - 90, '#ffe58f');
  this.upgradeBanner = {
    text: isFinal ? 'MAX LEVEL!' : 'LEVEL UP!',
    sub: `${def.name}  Lv.${nextLevel}`,
    color,
    life: bannerLife,
    max: bannerLife,
    final: isFinal
  };
  this.shake = Math.max(this.shake || 0, isFinal ? 240 : 130);
},

    openUpgradeChoice(f, pad) {
  const def = C.facilityTypes[f.type];
  this.upgradeChoice = { facilityId: f.id, padId: pad.id };
  this.wasPausedBeforeChoice = this.paused;
  this.paused = true;
  $('upgradeTitle').textContent = `${def.name}の強化を選択`;
  $('upgradeText').textContent = 'どちらか1つを選択してください。施設の役割が変わります。';
  if (!def.options || def.options.length < 2) {
    this.hideUpgradeOverlay();
    this.paused = this.wasPausedBeforeChoice;
    this.upgradeChoice = null;
    return;
  }
  $('upgradeChoiceA').innerHTML = `<b>${def.options[0].name}</b><span>${def.options[0].desc}</span>`;
  $('upgradeChoiceB').innerHTML = `<b>${def.options[1].name}</b><span>${def.options[1].desc}</span>`;
  $('upgradeOverlay').classList.remove('is-hidden');
},

    chooseUpgrade(index) {
  if (!this.upgradeChoice) return;
  const f = this.facilities.find((x) => x.id === this.upgradeChoice.facilityId);
  const pad = this.pads.find((x) => x.id === this.upgradeChoice.padId);
  if (!f || !pad) {
    this.hideUpgradeOverlay();
    return;
  }
  const def = C.facilityTypes[f.type];
  const option = def.options[index];
  const prevLevel = f.level || 1;
  f.branch = option.key;
  f.branchName = option.name;
  this.applyBranchUpgrade(f, option.key);
  f.level = 2;
  f.hp = f.maxHp;
  f.accent = this.levelColor(2);
  pad.upgradeInvested = 0;
  this.triggerFacilityUpgradeFx(f, 2, def, { prevLevel, isFinal: false });
  this.addFloater(option.name, f.x, f.y - 112, '#fff3a3');
  this.message = `${def.name}を${option.name}に強化しました。建物の見た目もLv.2用に更新されました。`;
  this.playSfx('upgrade');
  this.hideUpgradeOverlay();
  this.paused = this.wasPausedBeforeChoice;
  this.upgradeChoice = null;
  this.updateHud();
},

    hideUpgradeOverlay() {
  $('upgradeOverlay').classList.add('is-hidden');
},

    applyBranchUpgrade(f, key) {
  return;
},

    spendIntoPad(pad, need, dt, onComplete) {
  if (this.king.coins <= 0) {
    this.message = `コイン不足。あと${Math.ceil(need - (pad.facilityId ? pad.upgradeInvested : pad.invested))}必要です。敵のドロップ回収か金鉱が有効です。`;
    return;
  }
  const current = pad.facilityId ? pad.upgradeInvested : pad.invested;
  const remaining = need - current;
  const amount = Math.min(this.king.coins, remaining, C.payRate * this.kingdom.buildRateBonus * dt / 1000);
  this.king.coins -= amount;
  if (pad.facilityId) pad.upgradeInvested += amount;
  else pad.invested += amount;
  if (this.time % 140 < 34) {
    this.addFloater('-コイン', pad.x, pad.y - 35, '#f7c95e');
    this.addSpriteEffect('coinPickup', pad.x, pad.y - 6, 34, 220);
    if (this.addInvestStream) this.addInvestStream(this.king.x, this.king.y - 12, pad.x, pad.y - 6, '#ffd35b', 3);
    this.playSfx('pay', 120);
  }
  this.message = `${C.facilityTypes[pad.type].name}へ投資中: ${Math.ceil(current + amount)}/${need}。離れると止まり、通過だけでは消費しません。`;
  if (current + amount >= need - 0.001) onComplete();
},

    completePad(pad) {
  const def = C.facilityTypes[pad.type];
  const f = {
    id: cryptoRandom(), type: pad.type, name: def.name,
    x: pad.x, y: pad.y, level: 1,
    hp: def.hp, maxHp: def.hp,
    hit: 0,
    color: def.color, accent: def.accent,
    block: !!def.block,
    blockRadius: def.block ? (def.blockRadius || 36) : 0,
    blockArmor: def.blockArmor || 0,
    attack: !!def.damage,
    damage: def.damage || 0,
    range: def.range || 0,
    baseCooldown: def.cooldown || 999999,
    cooldown: rand(0, def.cooldown || 999999),
    projectile: def.projectile || '#ffffff',
    projectileSpeed: pad.type === 'cannon' ? 300 : 430,
    splash: def.splash || 0,
    spawn: !!def.spawn,
    spawnTime: def.spawnTime || 999999,
    spawnTimer: 800,
    soldierCap: def.soldierCap || 0,
    soldierHp: def.soldierHp || 0,
    soldierDamage: def.soldierDamage || 0,
    soldierSense: def.soldierSense || 0,
    soldierChase: def.soldierChase || 0,
    economy: !!def.economy,
    incomeTime: def.incomeTime || 999999,
    incomeTimer: 1000,
    income: def.income || 0,
    aura: !!def.aura,
    development: !!def.development,
    baseCooldown: def.cooldown || 999999,
    branch: null,
    branchName: '',
    fire: 0,
    work: 0,
    spawnFlash: 0,
    buildFlash: 680,
    levelFlash: 0
  };
  this.applyFacilityLevelStats(f, 1, false);
  this.facilities.push(f);
  pad.facilityId = f.id;
  pad.invested = def.cost;
  this.addBurst(f.x, f.y, def.accent, 30, 'build');
  if (this.addAuraRipple) this.addAuraRipple(f.x, f.y, def.accent, 88, 4, 680);
  if (this.addSparkShower) this.addSparkShower(f.x, f.y - 18, '#ffe087', 18, 92);
  this.addFloater(`${def.name} 完成`, f.x, f.y - 42, '#ffe087');
  this.playSfx('build');
  if (f.development) this.applyDevelopmentEffect(f, 'build');
  this.message = f.development ? `${def.name}が完成。開拓と経済が伸びました。` : `${def.name}が完成。${this.facilityTimingText ? this.facilityTimingText(f.type) : '防衛線を確認してください。'}`;
},

    upgradeFacility(f, pad) {
  const def = C.facilityTypes[f.type];
  const prevLevel = f.level || 1;
  const nextLevel = Math.min(this.facilityMaxLevel(f.type), prevLevel + 1);
  this.applyFacilityLevelStats(f, nextLevel, true);
  if (f.development) this.applyDevelopmentEffect(f, 'upgrade');
  pad.upgradeInvested = 0;
  const isFinal = nextLevel >= this.facilityMaxLevel(f.type);
  this.triggerFacilityUpgradeFx(f, nextLevel, def, { prevLevel, isFinal });
  this.playSfx('upgrade');
  const maxText = isFinal ? ' 最終強化で特別演出が発生しました。' : '';
  this.message = `${def.name}をLv.${nextLevel}に強化。建物画像が切り替わり、性能も上がりました。${maxText}`;
},

    applyDevelopmentEffect(f, phase) {
  const def = C.facilityTypes[f.type];
  this.kingdom.developmentBuilt += phase === 'build' ? 1 : 0;
  if (def.popBonus) {
    const gain = phase === 'build' ? def.popBonus : Math.max(1, Math.round(def.popBonus * 0.65));
    this.kingdom.popCap += gain;
    this.addFloater(`人口 +${gain}`, f.x, f.y - 58, '#d6f2a3');
  }
  if (def.economyBonus) {
    const gain = phase === 'build' ? def.economyBonus : def.economyBonus * 0.75;
    this.kingdom.economyBonus += gain;
    this.addFloater(`収入 +${Math.round(gain * 100)}%`, f.x, f.y - 58, '#ffd35b');
  }
  if (def.territoryBonus) {
    const before = this.kingdom.territory;
    this.kingdom.territory = Math.min(this.kingdom.maxTerritory, this.kingdom.territory + 1);
    this.kingdom.buildRateBonus += 0.08;
    if (this.kingdom.territory > before) {
      this.addFloater(`領土 ${this.kingdom.territory}`, f.x, f.y - 62, '#a9e3b4');
      this.message = `領土が広がりました。外側の建設床が使えます。`;
    }
  }
  if (def.soldierDamageBonus) {
    this.kingdom.soldierDamageBonus += def.soldierDamageBonus;
    this.addFloater('兵士強化', f.x, f.y - 58, '#ffb78f');
  }
  if (def.soldierHpBonus) this.kingdom.soldierHpBonus += def.soldierHpBonus;
  if (def.castleHpBonus) {
    const gain = phase === 'build' ? def.castleHpBonus : Math.round(def.castleHpBonus * 0.7);
    this.castle.maxHp += gain;
    this.castle.hp += gain;
    this.addFloater(`城 +${gain}`, f.x, f.y - 58, '#dce5ff');
  }
  if (def.kingHpBonus) {
    this.king.maxHp += def.kingHpBonus;
    this.king.hp = Math.min(this.king.maxHp, this.king.hp + def.kingHpBonus);
  }
}
  };
})();


/* ===== src/systems/effect-system.js ===== */

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
  if (this.upgradeBanner) {
    this.upgradeBanner.life -= dt;
    if (this.upgradeBanner.life <= 0) this.upgradeBanner = null;
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

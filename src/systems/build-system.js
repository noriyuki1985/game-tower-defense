(function () {
  'use strict';

  const C = window.KBD_CONFIG;
  const { $, distXY, rand, cryptoRandom } = window.KBD_UTILS;

  window.KBD_SYSTEMS = window.KBD_SYSTEMS || {};
  window.KBD_SYSTEMS.build = {
    updateCoins(dt) {
  for (const coin of this.coins) {
    coin.life -= dt;
    const d = distXY(this.king.x, this.king.y, coin.x, coin.y);
    if (d < C.coinPickupRange) {
      this.king.coins += coin.value;
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
  } else if (existing.level < 3) {
    const need = this.getUpgradeNeed(existing);
    this.spendIntoPad(activePad, need, dt, () => {
      if (!existing.branch && def.options && def.options.length >= 2) this.openUpgradeChoice(existing, activePad);
      else this.upgradeFacility(existing, activePad);
    });
  } else {
    this.message = `${def.name}は最大レベルです。王を別の建設床へ向かわせてください。`;
  }
},

    isPadUnlocked(pad) {
  return !pad.territory || pad.territory <= this.kingdom.territory;
},

    getUpgradeNeed(f) {
  const def = C.facilityTypes[f.type];
  return Math.round(def.upgradeCost * f.level * (f.branch ? 1.35 : 1.15));
},

    openUpgradeChoice(f, pad) {
  const def = C.facilityTypes[f.type];
  this.upgradeChoice = { facilityId: f.id, padId: pad.id };
  this.wasPausedBeforeChoice = this.paused;
  this.paused = true;
  $('upgradeTitle').textContent = `${def.name}の強化を選択`;
  $('upgradeText').textContent = 'どちらか1つを選択してください。施設の役割が変わります。';
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
  f.branch = option.key;
  f.branchName = option.name;
  this.applyBranchUpgrade(f, option.key);
  f.level = 2;
  f.hp = f.maxHp;
  pad.upgradeInvested = 0;
  f.buildFlash = 760;
  this.addBurst(f.x, f.y, def.accent, 28, 'upgrade');
  if (this.addAuraRipple) this.addAuraRipple(f.x, f.y, def.accent, 92, 4, 680);
  if (this.addSparkShower) this.addSparkShower(f.x, f.y - 20, '#fff3a3', 18, 88);
  this.addFloater(option.name, f.x, f.y - 46, '#fff3a3');
  this.message = `${def.name}を${option.name}に強化しました。`;
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
  f.maxHp = Math.round(f.maxHp * 1.24);
  if (key === 'thorns') { f.damage = 5; }
  if (key === 'reinforced') { f.maxHp = Math.round(f.maxHp * 1.9); f.blockRadius += 6; }
  if (key === 'bastion') { f.maxHp = Math.round(f.maxHp * 1.8); f.blockRadius += 10; }
  if (key === 'gate') { f.damage = 8; f.maxHp = Math.round(f.maxHp * 1.3); }
  if (key === 'longbow') { f.range += 58; f.damage = Math.round(f.damage * 1.12); }
  if (key === 'rapid') { f.baseCooldown = Math.max(240, Math.round(f.baseCooldown * 0.62)); f.damage = Math.round(f.damage * 1.05); }
  if (key === 'heavy') { f.damage = Math.round(f.damage * 1.65); f.splash = Math.round((f.splash || 0) * 0.9); }
  if (key === 'scatter') { f.splash = Math.round((f.splash || 0) * 1.65); f.baseCooldown = Math.round(f.baseCooldown * 1.08); }
  if (key === 'tax') { f.income = Math.round(f.income * 1.75); }
  if (key === 'vault') { f.income = Math.round(f.income * 2.45); f.incomeTime = Math.round(f.incomeTime * 1.35); }
  if (key === 'fieldwork') { f.range += 62; }
  if (key === 'workshop') { f.repairRate = Math.round(f.repairRate * 1.85); }
  if (key === 'barbed') { f.damage = Math.round(f.damage * 1.65); }
  if (key === 'frost') { f.slow = Math.round((f.slow || 700) * 2.1); f.damage = Math.round(f.damage * 0.85); }
  if (key === 'morale') { f.range += 20; }
  if (key === 'command') { f.range += 52; }
  if (key === 'scout') { f.range += 70; }
  if (key === 'rally') { f.range += 36; }
},

    spendIntoPad(pad, need, dt, onComplete) {
  if (this.king.coins <= 0) {
    this.message = `コイン不足。あと${Math.ceil(need - (pad.facilityId ? pad.upgradeInvested : pad.invested))}必要です。敵のドロップ回収か金鉱・市場が有効です。`;
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
    blockRadius: def.block ? 31 : 0,
    attack: !!def.damage && !def.trap,
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
    economy: !!def.economy,
    incomeTime: def.incomeTime || 999999,
    incomeTimer: 1000,
    income: def.income || 0,
    repair: !!def.repair,
    repairRate: def.repairRate || 0,
    aura: !!def.aura,
    development: !!def.development,
    trap: !!def.trap,
    baseCooldown: def.cooldown || 999999,
    slow: def.slow || 0,
    branch: null,
    branchName: '',
    fire: 0,
    work: 0,
    spawnFlash: 0,
    buildFlash: 680
  };
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
  f.level += 1;
  f.maxHp = Math.round(f.maxHp * 1.34);
  f.hp = f.maxHp;
  if (f.attack) {
    f.damage = Math.round(f.damage * 1.32);
    f.range += 13;
  }
  if (f.block) f.blockRadius += 5;
  if (f.development) this.applyDevelopmentEffect(f, 'upgrade');
  pad.upgradeInvested = 0;
  f.buildFlash = 760;
  this.addBurst(f.x, f.y, '#fff3a3', 24, 'upgrade');
  if (this.addAuraRipple) this.addAuraRipple(f.x, f.y, '#fff3a3', 78, 4, 620);
  if (this.addSparkShower) this.addSparkShower(f.x, f.y - 18, '#fff3a3', 14, 78);
  this.addFloater(`Lv.${f.level}`, f.x, f.y - 42, '#fff3a3');
  this.playSfx('upgrade');
  this.message = `${def.name}をLv.${f.level}に強化。次の襲撃で役割が活きる場所を確認してください。`;
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

(function () {
  'use strict';

  const C = window.KBD_CONFIG;
  const { rand, cryptoRandom } = window.KBD_UTILS;

  window.KBD_SYSTEMS = window.KBD_SYSTEMS || {};
  window.KBD_SYSTEMS.wave = {
    buildStageWaves() {
  const key = this.stageKey();
  const max = this.currentStage.waveCount || C.waves.length;
  const waves = C.waves.slice(0, max).map((w) => ({
    ...w,
    groups: w.groups.map((g) => ({ ...g }))
  }));
  if (key === 'river') {
    for (let i = 0; i < waves.length; i += 1) {
      waves[i].note = `${waves[i].note || ''} 川沿いの分岐に注意。`;
      if (i >= 1) waves[i].groups.splice(1, 0, { type: 'runner', count: 4 + i * 2, gap: Math.max(180, 360 - i * 18), route: 'side' });
      if (i === 3) waves[i].groups.push({ type: 'saboteur', count: 4, gap: 580, route: 'main' });
      if (i >= 5) waves[i].groups.push({ type: i % 2 ? 'bomber' : 'shaman', count: 3 + Math.floor(i / 2), gap: 760, route: i % 2 ? 'side' : 'main' });
    }
  } else if (key === 'pass') {
    for (let i = 0; i < waves.length; i += 1) {
      waves[i].note = `${waves[i].note || ''} 峠は道が狭く、硬い敵が多い。`;
      if (i >= 1) waves[i].groups.push({ type: 'brute', count: 2 + Math.floor(i / 2), gap: 830, route: 'main' });
      if (i >= 2) waves[i].groups.splice(0, 0, { type: 'shield', count: 3 + i, gap: 520, route: 'side' });
      if (i >= 5) waves[i].groups.push({ type: 'siege', count: 1 + Math.floor(i / 3), gap: 1150, route: i % 2 ? 'side' : 'main' });
    }
  }
  for (let i = 0; i < waves.length; i += 1) {
    if (i >= 2) {
      waves[i].note = `${waves[i].note || ''} 一部の敵は発見済みの資源地や前哨拠点を狙う。`;
    }
    if (i === 3) waves[i].groups.push({ type: 'runner', count: 3, gap: 520, route: 'side', raid: true });
    if (i === 5) waves[i].groups.push({ type: 'saboteur', count: 2, gap: 760, route: 'main', raid: true });
    if (i >= 6 && i % 2 === 0) waves[i].groups.push({ type: 'runner', count: 3 + Math.floor(i / 2), gap: 430, route: i % 3 ? 'side' : 'main', raid: true });
  }
  return waves;
},

    updateWave(dt) {
  if (this.wave.done) return;
  if (!this.wave.active) {
    this.wave.rest -= dt;
    if (this.wave.rest <= 0) {
      this.wave.index += 1;
      if (this.wave.index >= this.waves.length) {
        this.wave.done = true;
        return;
      }
      this.wave.active = true;
      this.wave.groupIndex = 0;
      this.wave.spawnedInGroup = 0;
      this.wave.timer = 0;
      this.wave.banner = 1400;
      this.message = `ウェーブ ${this.wave.index + 1}: ${this.waves[this.wave.index].title}`;
      this.playSfx(this.waves[this.wave.index].boss ? 'boss' : 'wave');
    }
    return;
  }

  const waveDef = this.waves[this.wave.index];
  const group = waveDef.groups[this.wave.groupIndex];
  this.wave.timer -= dt;
  if (this.wave.timer <= 0 && group) {
    if (this.wave.spawnedInGroup === 0) this.warnGroup(group);
    this.spawnEnemy(group.type, group.route || 'main', !!group.raid);
    this.wave.spawnedInGroup += 1;
    this.wave.timer = group.gap;
    if (this.wave.spawnedInGroup >= group.count) {
      this.wave.groupIndex += 1;
      this.wave.spawnedInGroup = 0;
      this.wave.timer = 900;
    }
  }
  if (this.wave.groupIndex >= waveDef.groups.length && this.enemies.length === 0) {
    this.wave.active = false;
    this.wave.rest = (C.balance && C.balance.waveRest) || 4300;
    const bonus = Math.round((30 + this.wave.index * 14) * this.kingdom.economyBonus);
    this.king.coins += bonus;
    this.addFloater(`ウェーブ突破 +${bonus}`, C.w / 2, 170, '#f5d56b');
    this.message = 'ウェーブ突破。次の襲撃までに建設・強化してください。';
    this.playSfx('clear');
  }
},

    warnGroup(group) {
  const def = C.enemyTypes[group.type];
  if (group.raid) {
    this.routeAlert = { text: '略奪隊が接近', life: 1900, route: group.route || 'main' };
    this.message = '略奪隊は紫表示です。拠点を守るか、城防衛を優先するかを選んでください。';
    return;
  }
  if (def && def.boss) {
    this.routeAlert = { text: `${def.name}が接近`, life: 2300, route: group.route || 'main' };
    this.message = `${def.name}が接近。柵・壁・大砲を強化してください。`;
    this.wave.banner = Math.max(this.wave.banner, 1800);
    this.shake = Math.max(this.shake, 100);
    this.playSfx('boss');
    return;
  }
  if (group.type === 'bomber') {
    this.routeAlert = { text: '爆弾兵が接近', life: 1800, route: group.route || 'main' };
    this.message = '爆弾兵は防衛線で爆発します。壁に近づく前に倒してください。';
    return;
  }
  if (group.type === 'shaman') {
    this.routeAlert = { text: '呪術兵が敵を回復', life: 1800, route: group.route || 'main' };
    this.message = '呪術兵は周囲の敵を回復します。火力を集中してください。';
    return;
  }
  if (group.type === 'siege') {
    this.routeAlert = { text: '破城槌が進軍中', life: 1800, route: group.route || 'main' };
    this.message = '破城槌は柵や壁を素早く壊します。';
    return;
  }
  this.warnRoute(group.route || 'main');
},

    warnRoute(route) {
  const labels = C.routeLabels[this.stageKey()] || C.routeLabels.meadow;
  const text = `${route === 'side' ? labels.side : labels.main}から襲撃`;
  this.routeAlert = { text, life: 1500, route };
  this.message = text;
},

    routePath(route) {
  const paths = C.stagePaths[this.stageKey()] || C.stagePaths.meadow;
  return route === 'side' ? paths.side : paths.main;
},

    spawnEnemy(type, route = 'main', forceRaid = false) {
  const baseDef = C.enemyTypes[type];
  const hpMult = (this.currentStage.enemyHp || 1) * (this.currentDifficulty.enemyHp || 1);
  const damageMult = (this.currentStage.enemyDamage || 1) * (this.currentDifficulty.enemyDamage || 1);
  const speedMult = (this.currentStage.enemySpeed || 1) * (this.currentDifficulty.enemySpeed || 1);
  const def = {
    ...baseDef,
    hp: Math.round(baseDef.hp * hpMult),
    damage: Math.round(baseDef.damage * damageMult),
    kingDamage: Math.round((baseDef.kingDamage || baseDef.damage) * damageMult),
    speed: baseDef.speed * speedMult,
    coin: Math.max(1, Math.round(baseDef.coin * (this.currentDifficulty.crownMult > 1 ? 1.08 : 1))),
    score: Math.round(baseDef.score * (this.currentDifficulty.scoreMult || 1))
  };
  let path = this.routePath(route);
  const raidTarget = this.chooseRaidTarget ? this.chooseRaidTarget(type, route, forceRaid) : null;
  if (raidTarget && this.buildRaidPath) path = this.buildRaidPath(route, raidTarget);
  const s = path[0];
  const jitter = rand(-9, 9);
  this.enemies.push({
    id: cryptoRandom(), type, def, route,
    raidTargetId: raidTarget ? raidTarget.id : null,
    raidTargetName: raidTarget ? raidTarget.name : '',
    path,
    x: s.x + jitter, y: s.y + jitter,
    r: def.r, hp: def.hp, maxHp: def.hp,
    pathIndex: 1, attackTimer: rand(0, 300), slow: 0,
    blockedBy: null, hit: 0, kingHitTimer: 0, specialTimer: rand(250, 850),
    animSeed: rand(0, Math.PI * 2), spawnLife: 360,
    walkDistance: 0, lastDx: 0, lastDy: -1, isWalking: true
  });
}
  };
})();

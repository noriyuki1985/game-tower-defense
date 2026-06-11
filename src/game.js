(function () {
  'use strict';

  const C = window.KBD_CONFIG;
  const ASSET_MANIFEST = window.KBD_ASSET_MANIFEST;
  const loadGameImages = window.KBD_LOAD_IMAGES;
  const { $, clamp, dist, distXY, rand, rounded, cryptoRandom } = window.KBD_UTILS;
  const { defaultSave, loadSave, storeSave, metaCost } = window.KBD_SAVE;

  class Game {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.status = 'title';
      this.last = performance.now();
      this.pointerTarget = null;
      this.keys = new Set();
      this.speed = 1;
      this.paused = false;
      this.backgroundDebug = this.initialBackgroundDebug();
      this.backgroundPartDebug = this.initialBackgroundPartDebug();
      this.audio = this.loadAudioSettings();
      this.audioContext = null;
      this.masterGain = null;
      this.bgmGain = null;
      this.bgmNodes = [];
      this.sfxCooldown = {};
      this.images = loadGameImages();
      this.resultFx = null;
      this.message = '開始を押してください。';
      this.notice = { text: '', kind: 'info', life: 0, priority: 0 };
      this.save = loadSave();
      this.selectedStage = C.stages[this.save.selectedStage] ? this.save.selectedStage : 'meadow';
      this.selectedDifficulty = this.save.selectedDifficulty || 'normal';
      this.currentStage = C.stages[this.selectedStage] || C.stages.meadow;
      this.currentDifficulty = C.difficulties[this.selectedDifficulty] || C.difficulties.normal;
      this.resetState();
      this.bind();
      this.applyAudioUi();
      this.populateSetupControls();
      this.renderMetaUpgrades();
      this.updateSetupHud();
      this.render();
      requestAnimationFrame((t) => this.loop(t));
    }

    resetState() {
      this.king = {
        x: C.kingStart.x,
        y: C.kingStart.y,
        r: 17,
        coins: this.startingCoins(),
        hp: this.kingMaxHp(),
        maxHp: this.kingMaxHp(),
        invuln: 0,
        stunned: 0,
        reviveInvulnPending: 0,
        attackTimer: 0,
        payBuffer: 0,
        buildHoldPadId: null,
        buildHoldTime: 0,
        targetX: C.kingStart.x,
        targetY: C.kingStart.y,
        face: 1,
        animTime: 0,
        runDistance: 0,
        moveAngle: 0,
        stepTimer: 0,
        lastStepSide: 1,
        speedRatio: 0
      };
      this.kingDownCount = 0;
      const castleMax = this.castleMaxHp();
      this.castle = { ...C.castle, hp: castleMax, maxHp: castleMax, hit: 0 };
      this.kingdom = {
        territory: 1,
        maxTerritory: 3,
        popCap: 6,
        economyBonus: 1 + this.metaLevel('tradeCharter') * 0.07,
        soldierDamageBonus: 1 + this.metaLevel('troopDrill') * 0.06,
        soldierHpBonus: 1 + this.metaLevel('troopDrill') * 0.06,
        buildRateBonus: 1 + this.metaLevel('builderDiscipline') * 0.08,
        developmentBuilt: 0
      };
      this.enemies = [];
      this.projectiles = [];
      this.coins = [];
      this.floaters = [];
      this.bursts = [];
      this.impactRings = [];
      this.motionParticles = [];
      this.spriteEffects = [];
      this.deathSprites = [];
      this.facilities = [];
      this.soldiers = [];
      this.discoveryToast = null;
      this.discoveries = this.stageDiscoveries().map((d) => ({
        ...d,
        discovered: false,
        pulse: rand(0, 1000),
        flash: 0,
        siteHp: this.discoverySiteMaxHp(d),
        siteMaxHp: this.discoverySiteMaxHp(d),
        siteUnderRaid: 0,
        siteDisabled: false,
        siteDisabledTimer: 0,
        siteDamageNotice: 0
      }));
      this.pads = this.stagePads().map((p) => ({ ...p, invested: 0, upgradeInvested: 0, facilityId: null, pulse: rand(0, 1000), holdTime: 0, discovered: !p.requiresDiscovery }));
      this.waves = this.buildStageWaves();
      this.wave = { index: -1, groupIndex: 0, spawnedInGroup: 0, timer: 0, rest: 1800, active: false, done: false, banner: 0 };
      this.score = 0;
      this.shake = 0;
      this.time = 0;
      this.flash = 0;
      this.routeAlert = { text: '', life: 0, route: 'main' };
      this.notice = { text: '', kind: 'info', life: 0, priority: 0 };
      this.resultFx = null;
      this.hintTimer = 0;
      this.upgradeChoice = null;
      this.wasPausedBeforeChoice = false;
      this.camera = { x: 0, y: 0, targetX: 0, targetY: 0 };
      this.minimapExpanded = false;
      this.updateCamera(true);
      this.message = 'まず近くの弓塔・柵・金鉱を見比べ、0.6秒滞在して投資してください。';
      this.updateHud();
    }

    setNotice(text, kind = 'info', life = 2400, priority = 1) {
      if (!text) return;
      const current = this.notice || { life: 0, priority: 0 };
      if (current.life > 0 && current.priority > priority) return;
      this.notice = { text, kind, life, priority };
      this.message = text;
    }

    setMessage(text, kind = 'info', priority = 1) {
      this.setNotice(text, kind, 2300, priority);
    }

    stageKey() {
      if (this.tutorialMode) return 'tutorial';
      return (this.currentStage && this.currentStage.key) || this.selectedStage || 'meadow';
    }

    stageTheme() {
      return C.stageThemes[this.stageKey()] || C.stageThemes.meadow;
    }

    stagePads() {
      return (C.stagePadLayouts[this.stageKey()] || C.pads).filter((pad) => C.facilityTypes[pad.type]);
    }

    stageDiscoveries() {
      return (C.discoveryPoints && C.discoveryPoints[this.stageKey()]) || [];
    }

    isPadVisible(pad) {
      return !pad || !pad.requiresDiscovery || !!pad.discovered;
    }

    discoveryCountText() {
      const total = this.discoveries ? this.discoveries.length : 0;
      if (!total) return '探索 0/0';
      const found = this.discoveries.filter((d) => d.discovered).length;
      return `探索 ${found}/${total}`;
    }

    discoverySiteMaxHp(d) {
      const kind = typeof d === 'string' ? d : (d && d.kind);
      return {
        cache: 0,
        resource: 135
      }[kind] || 140;
    }

    discoverySiteLabel(d) {
      const kind = typeof d === 'string' ? d : (d && d.kind);
      return {
        cache: '物資',
        resource: '金鉱'
      }[kind] || '拠点';
    }

    isRaidableDiscovery(d) {
      return !!(d && d.discovered && d.kind !== 'cache' && d.siteMaxHp > 0);
    }

    activeDiscoverySites() {
      return (this.discoveries || []).filter((d) => this.isRaidableDiscovery(d));
    }


    discoveryRewardLines(d, revealedPads) {
      const lines = [];
      if (d.rewardCoins) lines.push(`コイン +${d.rewardCoins}`);
      if (d.rewardPop) lines.push(`人口上限 +${d.rewardPop}`);
      if (d.economyBonus) lines.push(`収入効率 +${Math.round(d.economyBonus * 100)}%`);
      if (revealedPads) lines.push(`建設床 +${revealedPads}`);
      if (this.isRaidableDiscovery(d)) lines.push(`${this.discoverySiteLabel(d)}を確保`);
      return lines;
    }

    showDiscoveryToast(d, lines) {
      this.discoveryToast = {
        title: `${d.name}を発見`,
        note: d.note || '',
        lines: lines && lines.length ? lines : ['周辺を展開しました'],
        life: 4200,
        max: 4200
      };
    }

    raidTrailPathForSite(site, route = 'main') {
      const base = this.routePath(route) || [];
      if (!site || !base.length) return [];
      let nearest = base[0];
      let nearestIndex = 0;
      let best = Infinity;
      for (let i = 0; i < base.length; i += 1) {
        const d = distXY(site.x, site.y, base[i].x, base[i].y);
        if (d < best) { best = d; nearest = base[i]; nearestIndex = i; }
      }
      const start = base[0];
      const join = nearest;
      const bend = {
        x: Math.round(join.x * 0.70 + site.x * 0.30),
        y: Math.round(join.y * 0.70 + site.y * 0.30)
      };
      return [start, ...base.slice(1, nearestIndex + 1), bend, { x: site.x, y: site.y }];
    }

    siteStatusText() {
      const sites = this.activeDiscoverySites();
      if (!sites.length) return '拠点 0';
      const damaged = sites.filter((d) => (d.siteHp || 0) < (d.siteMaxHp || 1) * 0.55).length;
      return damaged ? `拠点 ${sites.length} / 損傷${damaged}` : `拠点 ${sites.length}`;
    }

    updateDiscoverySites(dt) {
      for (const d of (this.discoveries || [])) {
        d.siteUnderRaid = Math.max(0, (d.siteUnderRaid || 0) - dt);
        d.siteDamageNotice = Math.max(0, (d.siteDamageNotice || 0) - dt);
        if (!this.isRaidableDiscovery(d)) continue;
        if (d.siteDisabledTimer > 0) {
          d.siteDisabledTimer = Math.max(0, d.siteDisabledTimer - dt);
          if (d.siteDisabledTimer <= 0) {
            d.siteDisabled = false;
            d.siteHp = Math.max(d.siteHp || 0, Math.round((d.siteMaxHp || 120) * 0.45));
            this.addFloater('復旧', d.x, d.y - 48, '#9ee1bb');
          }
        }
        if (d.siteUnderRaid <= 0 && (d.siteHp || 0) < (d.siteMaxHp || 0)) {
          const regen = (d.siteDisabled ? 3.5 : 7) * dt / 1000;
          d.siteHp = Math.min(d.siteMaxHp, (d.siteHp || 0) + regen);
        }
      }
    }

    damageDiscoverySite(site, amount, enemy) {
      if (!site || !this.isRaidableDiscovery(site)) return;
      const before = site.siteHp || site.siteMaxHp || 1;
      site.siteHp = Math.max(0, before - amount);
      site.siteUnderRaid = 1800;
      site.flash = Math.max(site.flash || 0, 700);
      this.addBurst(site.x, site.y, '#ff8b5e', 10, 'warning');
      this.playSfx('raidHit', 260);
      if (site.siteDamageNotice <= 0) {
        this.addFloater(`${this.discoverySiteLabel(site)}進軍`, site.x, site.y - 42, '#ffb08a');
        site.siteDamageNotice = 1800;
      }
      if (site.siteHp <= 0 && !site.siteDisabled) {
        site.siteDisabled = true;
        site.siteDisabledTimer = 12000;
        const lost = Math.min(30, Math.floor(this.king.coins * 0.12));
        this.king.coins = Math.max(0, this.king.coins - lost);
        this.message = `${site.name}が進軍され、一時停止しました。失ったコイン: ${lost}`;
        this.addFloater(`-${lost}`, site.x, site.y - 60, '#ff6b5e');
        this.shake = Math.max(this.shake, 110);
      } else {
        this.message = `${site.name}が進軍されています。王や防衛施設で周辺を守ってください。`;
      }
    }

    updateDiscoveries(dt) {
      if (!this.discoveries || !this.discoveries.length) return;
      const revealRadius = C.discoveryRevealRadius || 76;
      for (const d of this.discoveries) {
        d.pulse = (d.pulse || 0) + dt;
        d.flash = Math.max(0, (d.flash || 0) - dt);
        if (d.discovered) continue;
        if (distXY(this.king.x, this.king.y, d.x, d.y) > revealRadius) continue;
        d.discovered = true;
        d.flash = 1200;
        let rewardText = '';
        if (d.rewardCoins) {
          this.king.coins += d.rewardCoins;
          rewardText += ` +${d.rewardCoins}コイン`;
          this.addFloater(`+${d.rewardCoins}`, d.x, d.y - 34, '#ffd35b');
        }
        if (d.rewardPop) {
          this.kingdom.popCap += d.rewardPop;
          rewardText += ` 人口+${d.rewardPop}`;
          this.addFloater(`人口+${d.rewardPop}`, d.x, d.y - 52, '#d6f2a3');
        }
        if (d.economyBonus) {
          this.kingdom.economyBonus += d.economyBonus;
          rewardText += ` 収入+${Math.round(d.economyBonus * 100)}%`;
          this.addFloater(`収入+${Math.round(d.economyBonus * 100)}%`, d.x, d.y - 70, '#ffd35b');
        }
        let revealedPads = 0;
        for (const pad of this.pads) {
          if (pad.requiresDiscovery === d.id) {
            pad.discovered = true;
            pad.revealFlash = 1200;
            revealedPads += 1;
          }
        }
        if (revealedPads) rewardText += ` 建設床+${revealedPads}`;
        if (this.isRaidableDiscovery(d)) {
          d.siteHp = d.siteMaxHp;
          d.siteDisabled = false;
          rewardText += ` ${this.discoverySiteLabel(d)}確保`;
        }
        const rewardLines = this.discoveryRewardLines ? this.discoveryRewardLines(d, revealedPads) : [];
        this.showDiscoveryToast(d, rewardLines);
        this.addBurst(d.x, d.y, '#fff3a3', 24, 'upgrade');
        this.message = `${d.name}を発見。${rewardLines.join(' / ') || rewardText || '周辺を展開'}`;
        this.playSfx('discovery', 180);
      }
    }

    start() {
      this.overlayAction = null;
      this.tutorialMode = false;
      this.tutorial = null;
      this.selectedStage = $('stageSelect') ? $('stageSelect').value : this.selectedStage;
      this.selectedDifficulty = $('difficultySelect') ? $('difficultySelect').value : this.selectedDifficulty;
      this.currentStage = C.stages[this.selectedStage] || C.stages.meadow;
      this.currentDifficulty = C.difficulties[this.selectedDifficulty] || C.difficulties.normal;
      this.save.selectedStage = this.selectedStage;
      this.save.selectedDifficulty = this.selectedDifficulty;
      storeSave(this.save);
      this.resetState();
      this.status = 'playing';
      this.paused = false;
      this.unlockAudio();
      this.startBgm();
      this.playSfx('start');
      this.speed = 1;
      this.wave.rest = (C.balance && C.balance.firstWaveRest) || 1100;
      this.hideOverlay();
      this.hideUpgradeOverlay();
      this.closeMobileMenu();
      this.message = '主人公だけが操作対象です。次の進軍と床アイコンを見て、守るか金鉱へ投資するか選んでください。';
      this.updateHud();
    }


    startTutorial() {
      this.overlayAction = null;
      this.selectedStage = 'meadow';
      this.selectedDifficulty = 'normal';
      this.currentStage = C.stages.meadow;
      this.currentDifficulty = C.difficulties.normal;
      this.tutorialMode = true;
      this.resetState();
      this.tutorial = { step: 0, spawned: {}, rejectedTimer: 0, completed: false, coinsPicked: 0, coinsPickedAtStep: 0 };
      this.status = 'playing';
      this.paused = false;
      this.speed = 1;
      this.king.coins = Math.max(this.king.coins, 720);
      this.wave.active = false;
      this.wave.done = false;
      this.wave.index = -1;
      this.wave.rest = 999999;
      this.enemies = [];
      this.coins = [];
      this.unlockAudio();
      this.startBgm();
      this.playSfx('start');
      this.hideOverlay();
      this.hideUpgradeOverlay();
      this.closeMobileMenu();
      this.setTutorialStep(0);
      this.updateHud();
    }

    tutorialSteps() {
      return [
        { id: 'move', complete: 'move', title: '移動', text: '赤い円まで主人公を動かしてください。まずは移動だけ確認します。', target: { x: 244, y: 600 }, radius: 38 },
        { id: 'buildPalisade', complete: 'build', title: '柵で止める', text: '道の中央にある「柵」を建てます。敵を止める場所を作ってください。', targetPadId: 't_palisade_gate', requireType: 'palisade' },
        { id: 'buildArcher', complete: 'build', title: '弓塔で削る', text: '柵の近くに「弓塔」を建てます。止めた敵を遠くから倒す施設です。', targetPadId: 't_archer_gate', requireType: 'archer' },
        { id: 'collectAfterArcher', complete: 'collect', title: '倒して拾う', text: '小さな敵軍が来ます。弓塔が倒した後、落ちたコインを主人公で拾ってください。', spawnGroup: 'first' },
        { id: 'upgradeArcher', complete: 'upgrade', title: '弓塔をLv2へ', text: '同じ弓塔にもう一度投資し、Lv2へ強化してください。青から緑へ変わります。', targetPadId: 't_archer_gate', requireType: 'archer', requireLevel: 2 },
        { id: 'buildMine', complete: 'build', title: '金鉱で収入を作る', text: '右下の金鉱を建てます。戦闘力はありませんが、強化資金を作れます。', targetPadId: 't_mine_east', requireType: 'mine' },
        { id: 'buildBarracks', complete: 'build', title: '兵舎で側道を守る', text: '左側道の脇に兵舎を建てます。兵士が出て敵を足止めします。', targetPadId: 't_barracks_left', requireType: 'barracks' },
        { id: 'buildCannon', complete: 'build', title: '大砲で群れを処理', text: '合流地点の脇に大砲を建てます。敵がまとまる場所に強い施設です。', targetPadId: 't_cannon_merge', requireType: 'cannon' },
        { id: 'finalDefense', complete: 'defend', title: '総合防衛', text: '最後に小さな三路進軍を防ぎます。柵・弓塔・兵舎・大砲・金鉱の役割を確認してください。', spawnGroup: 'final', finish: true }
      ];
    }

    tutorialStep() {
      if (!this.tutorial) return null;
      return this.tutorialSteps()[this.tutorial.step] || null;
    }

    setTutorialStep(index) {
      if (!this.tutorial) return;
      this.tutorial.step = index;
      this.tutorial.stepStartedAt = this.time || 0;
      this.tutorial.coinsPickedAtStep = this.tutorial.coinsPicked || 0;
      this.tutorial.rejectedTimer = 0;
      const step = this.tutorialStep();
      if (!step) return;
      this.message = `チュートリアル ${index + 1}/${this.tutorialSteps().length}: ${step.text}`;
      this.setNotice(this.message, 'info', 2600, 6);
      this.playSfx(index === 0 ? 'click' : 'upgrade', 220, true);
    }

    tutorialTargetPoint() {
      const step = this.tutorialStep();
      if (!step) return null;
      if (step.target) return step.target;
      if (step.targetPadId) {
        const pad = this.pads.find((p) => p.id === step.targetPadId);
        return pad ? { x: pad.x, y: pad.y } : null;
      }
      if (step.targetDiscoveryId) {
        const d = (this.discoveries || []).find((x) => x.id === step.targetDiscoveryId);
        return d ? { x: d.x, y: d.y } : null;
      }
      if (step.complete === 'collect' && this.coins && this.coins.length) return { x: this.coins[0].x, y: this.coins[0].y };
      if (step.spawnGroup && this.enemies.length) return { x: this.enemies[0].x, y: this.enemies[0].y };
      return null;
    }

    tutorialInstructionText() {
      const step = this.tutorialStep();
      if (!step) return 'チュートリアル';
      return `${this.tutorial.step + 1}/${this.tutorialSteps().length} ${step.title}: ${step.text}`;
    }

    tutorialCanUsePad(pad) {
      if (!this.tutorialMode) return true;
      const step = this.tutorialStep();
      if (!step || !step.targetPadId) return false;
      return pad && pad.id === step.targetPadId;
    }

    tutorialRejectPad(pad) {
      if (!this.tutorial) return;
      this.tutorial.rejectedTimer = 900;
      const step = this.tutorialStep();
      const name = pad && C.facilityTypes[pad.type] ? C.facilityTypes[pad.type].name : 'この建設床';
      this.message = `${name}ではまだ進みません。${step ? step.text : '指示された場所へ向かってください。'}`;
    }

    tutorialSpawnEnemy(type, route, pathIndex = 4, hpRate = 0.6) {
      const before = this.enemies.length;
      this.spawnEnemy(type, route || 'main', false);
      const enemy = this.enemies[this.enemies.length - 1];
      if (!enemy || this.enemies.length === before) return;
      const path = enemy.path || [];
      const safeIndex = Math.max(1, Math.min(path.length - 1, pathIndex));
      const p = path[safeIndex - 1] || path[0];
      enemy.x = p.x + rand(-8, 8);
      enemy.y = p.y + rand(-8, 8);
      enemy.pathIndex = safeIndex;
      enemy.maxHp = Math.max(10, Math.round(enemy.maxHp * hpRate));
      enemy.hp = enemy.maxHp;
      enemy.def = { ...enemy.def, hp: enemy.maxHp, damage: Math.max(2, Math.round(enemy.def.damage * 0.55)), kingDamage: Math.max(2, Math.round((enemy.def.kingDamage || enemy.def.damage) * 0.55)) };
    }

    tutorialSpawnGroup(key) {
      if (!this.tutorial || this.tutorial.spawned[key]) return;
      this.tutorial.spawned[key] = true;
      if (key === 'first') {
        this.tutorialSpawnEnemy('grunt', 'main', 5, 0.36);
        this.tutorialSpawnEnemy('grunt', 'main', 5, 0.36);
        this.tutorialSpawnEnemy('runner', 'main', 5, 0.32);
        this.message = '敵軍が来ました。弓塔が倒したら、落ちたコインを主人公で拾ってください。';
      } else if (key === 'final') {
        this.tutorialSpawnEnemy('grunt', 'main', 5, 0.50);
        this.tutorialSpawnEnemy('grunt', 'main', 5, 0.50);
        this.tutorialSpawnEnemy('runner', 'side', 5, 0.44);
        this.tutorialSpawnEnemy('shield', 'main', 4, 0.36);
        this.tutorialSpawnEnemy('runner', 'side', 6, 0.38);
        this.message = '最後の練習進軍です。施設の役割を見ながら防衛してください。';
      }
      this.setNotice(this.message, 'warning', 2400, 7);
    }

    tutorialRevealDiscovery(id) {
      const d = (this.discoveries || []).find((x) => x.id === id);
      if (!d || d.discovered) return false;
      d.discovered = true;
      d.flash = 1200;
      if (d.rewardCoins) {
        this.king.coins += d.rewardCoins;
        this.addFloater(`+${d.rewardCoins}`, d.x, d.y - 34, '#ffd35b');
      }
      if (d.rewardPop) this.kingdom.popCap += d.rewardPop;
      if (d.economyBonus) this.kingdom.economyBonus += d.economyBonus;
      let revealedPads = 0;
      for (const pad of this.pads) {
        if (pad.requiresDiscovery === d.id) {
          pad.discovered = true;
          pad.revealFlash = 1200;
          revealedPads += 1;
        }
      }
      this.showDiscoveryToast(d, this.discoveryRewardLines(d, revealedPads));
      this.addBurst(d.x, d.y, '#fff3a3', 24, 'upgrade');
      this.playSfx('discovery', 180);
      return true;
    }

    updateTutorial(dt) {
      if (!this.tutorialMode || !this.tutorial || this.status !== 'playing') return;
      const step = this.tutorialStep();
      if (!step) return;
      if (step.spawnGroup) this.tutorialSpawnGroup(step.spawnGroup);
      if (this.tutorial.rejectedTimer > 0) this.tutorial.rejectedTimer = Math.max(0, this.tutorial.rejectedTimer - dt);

      const advance = () => {
        if (step.finish) this.finishTutorial();
        else this.setTutorialStep(this.tutorial.step + 1);
      };
      if (step.complete === 'move') {
        const target = step.target;
        if (target && distXY(this.king.x, this.king.y, target.x, target.y) <= (step.radius || 36)) advance();
      } else if (step.complete === 'build') {
        const pad = this.pads.find((p) => p.id === step.targetPadId);
        const facility = pad && pad.facilityId ? this.facilities.find((f) => f.id === pad.facilityId) : null;
        if (facility && (!step.requireType || facility.type === step.requireType)) advance();
      } else if (step.complete === 'upgrade') {
        const pad = this.pads.find((p) => p.id === step.targetPadId);
        const facility = pad && pad.facilityId ? this.facilities.find((f) => f.id === pad.facilityId) : null;
        if (facility && (!step.requireType || facility.type === step.requireType) && facility.level >= (step.requireLevel || 2)) advance();
      } else if (step.complete === 'collect') {
        if (step.spawnGroup && this.tutorial.spawned[step.spawnGroup] && this.enemies.length === 0 && this.coins.length === 0 && (this.tutorial.coinsPicked || 0) > (this.tutorial.coinsPickedAtStep || 0)) advance();
      } else if (step.complete === 'defend') {
        if (step.spawnGroup && this.tutorial.spawned[step.spawnGroup] && this.enemies.length === 0) advance();
      } else if (step.complete === 'discover') {
        const d = (this.discoveries || []).find((x) => x.id === step.targetDiscoveryId);
        if (d && distXY(this.king.x, this.king.y, d.x, d.y) <= (C.discoveryRevealRadius || 76)) {
          this.tutorialRevealDiscovery(d.id);
          advance();
        }
      }
      if (this.tutorialMode && this.tutorial.rejectedTimer <= 0) {
        const current = this.tutorialInstructionText();
        if (this.message !== current) this.message = current;
      }
    }

    finishTutorial() {
      if (!this.tutorialMode) return;
      this.tutorial.completed = true;
      this.tutorialMode = false;
      this.status = 'tutorialClear';
      this.stopBgm();
      this.startResultFx('win');
      this.playSfx('victory');
      this.showOverlay('チュートリアル完了', '5つの建物と強化の基本を確認しました。\n\n覚えること: 柵で止める / 弓塔で削る / コインを拾う / Lv2へ強化する / 金鉱で資金を作る / 兵舎で側道を守る / 大砲で群れを処理する', '通常ステージへ', 'win');
      this.updateHud();
    }

    failTutorial() {
      if (!this.tutorialMode) return;
      this.tutorialMode = false;
      this.status = 'tutorialLose';
      this.stopBgm();
      this.startResultFx('lose');
      this.playSfx('defeat');
      this.overlayAction = 'tutorial';
      this.showOverlay('チュートリアル失敗', '城が落ちました。通常ステージの敗北処理とは分けています。\n\nもう一度、指示された建設床だけを使い、敵のコインを拾ってから次へ進んでください。', 'チュートリアル再挑戦', 'lose');
      this.updateHud();
    }

    drawTutorialGuide(ctx) {
      if (!this.tutorialMode || this.status !== 'playing') return;
      const step = this.tutorialStep();
      const text = this.tutorialInstructionText();
      const compact = this.isMobileView && this.isMobileView();
      const w = compact ? 430 : 430;
      const h = compact ? 74 : 66;
      const x = Math.round((C.w - w) / 2);
      const y = compact ? 86 : 76;
      ctx.save();
      ctx.fillStyle = 'rgba(8, 14, 13, 0.93)';
      rounded(ctx, x, y, w, h, 18);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 211, 91, 0.78)';
      ctx.lineWidth = 2;
      rounded(ctx, x + 0.5, y + 0.5, w - 1, h - 1, 18);
      ctx.stroke();
      ctx.fillStyle = '#ffd35b';
      ctx.font = compact ? '900 14px system-ui' : '900 13px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`チュートリアル ${this.tutorial.step + 1}/${this.tutorialSteps().length}: ${step ? step.title : ''}`, C.w / 2, y + 22);
      ctx.fillStyle = '#fff0bb';
      ctx.font = compact ? '900 13px system-ui' : '800 12px system-ui';
      const body = text.replace(/^\d+\/\d+ [^:]+: /, '');
      ctx.fillText(body.slice(0, compact ? 30 : 42), C.w / 2, y + 46);
      if (body.length > (compact ? 30 : 42)) ctx.fillText(body.slice(compact ? 30 : 42, compact ? 60 : 84), C.w / 2, y + 62);
      const target = this.tutorialTargetPoint();
      if (target) {
        const raw = this.worldToScreen(target.x, target.y);
        const kingScreen = this.worldToScreen(this.king.x, this.king.y);
        const pulse = 0.5 + 0.5 * Math.sin((this.time || 0) * 0.010);
        const marker = {
          x: clamp(raw.x, 38, C.w - 38),
          y: clamp(raw.y, 112, C.h - 38)
        };
        const dx = marker.x - kingScreen.x;
        const dy = marker.y - kingScreen.y;
        const len = Math.hypot(dx, dy) || 1;
        const nx = dx / len;
        const ny = dy / len;
        const ringRadius = 28 + pulse * 10;
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = `rgba(255, 68, 68, ${0.72 + pulse * 0.26})`;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(marker.x, marker.y, ringRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = `rgba(255, 225, 225, ${0.50 + pulse * 0.25})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(marker.x, marker.y, ringRadius + 7, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = `rgba(255, 38, 38, ${0.10 + pulse * 0.08})`;
        ctx.beginPath();
        ctx.arc(marker.x, marker.y, ringRadius - 2, 0, Math.PI * 2);
        ctx.fill();

        const arrowEnd = {
          x: marker.x - nx * (ringRadius + 10),
          y: marker.y - ny * (ringRadius + 10)
        };
        const arrowStart = {
          x: arrowEnd.x - nx * 72,
          y: arrowEnd.y - ny * 72
        };
        const head = 15;
        const wing = 0.72;
        const angle = Math.atan2(ny, nx);
        ctx.strokeStyle = 'rgba(255, 42, 42, 0.92)';
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(arrowStart.x, arrowStart.y);
        ctx.lineTo(arrowEnd.x, arrowEnd.y);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255, 236, 236, 0.72)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(arrowStart.x, arrowStart.y);
        ctx.lineTo(arrowEnd.x, arrowEnd.y);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255, 42, 42, 0.96)';
        ctx.beginPath();
        ctx.moveTo(arrowEnd.x, arrowEnd.y);
        ctx.lineTo(arrowEnd.x - Math.cos(angle - wing) * head, arrowEnd.y - Math.sin(angle - wing) * head);
        ctx.lineTo(arrowEnd.x - Math.cos(angle + wing) * head, arrowEnd.y - Math.sin(angle + wing) * head);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    }

    bind() {
      $('startButton').addEventListener('click', () => {
        if (this.overlayAction === 'tutorial') {
          this.overlayAction = null;
          this.startTutorial();
          return;
        }
        this.start();
      });
      if ($('tutorialButton')) $('tutorialButton').addEventListener('click', () => this.startTutorial());
      $('restartButton').addEventListener('click', () => this.start());
      if ($('mobileMenuButton')) $('mobileMenuButton').addEventListener('click', () => this.toggleMobileMenu());
      if ($('mobilePanelCloseButton')) $('mobilePanelCloseButton').addEventListener('click', () => this.closeMobileMenu());
      if ($('mobilePanelBackdrop')) $('mobilePanelBackdrop').addEventListener('click', () => this.closeMobileMenu());
      if ($('mobilePauseButton')) $('mobilePauseButton').addEventListener('click', () => this.togglePause());
      if ($('mobileSpeedButton')) $('mobileSpeedButton').addEventListener('click', () => this.toggleSpeed());
      $('pauseButton').addEventListener('click', () => this.togglePause());
      $('speedButton').addEventListener('click', () => this.toggleSpeed());
      if ($('audioButton')) $('audioButton').addEventListener('click', () => this.toggleAudio());
      if ($('bgmButton')) $('bgmButton').addEventListener('click', () => this.toggleBgm());
      if ($('volumeRange')) $('volumeRange').addEventListener('input', () => this.changeVolume());
      $('upgradeChoiceA').addEventListener('click', () => this.chooseUpgrade(0));
      $('upgradeChoiceB').addEventListener('click', () => this.chooseUpgrade(1));
      if ($('stageSelect')) $('stageSelect').addEventListener('change', () => this.changeStage());
      if ($('difficultySelect')) $('difficultySelect').addEventListener('change', () => this.changeDifficulty());
      if ($('resetSaveButton')) $('resetSaveButton').addEventListener('click', () => this.resetSaveData());

      window.addEventListener('keydown', (e) => {
        const k = e.key.toLowerCase();
        if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', ' '].includes(k)) e.preventDefault();
        if (k === 'escape') this.closeMobileMenu();
        else if (k === ' ') this.togglePause();
        else if (k === 'f') this.toggleSpeed();
        else if (k === ((C.backgroundDebug && C.backgroundDebug.toggleKey) || 'b')) this.toggleBackgroundDebug();
        else if (k === ((C.backgroundPartDebug && C.backgroundPartDebug.toggleKey) || 'p')) this.toggleBackgroundPartDebug();
        else if (k === ((C.backgroundDebug && C.backgroundDebug.labelToggleKey) || 'n')) this.toggleBackgroundDebugLabels();
        else this.keys.add(k);
      });
      window.addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));

      const suppressGameTouch = (e) => {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();
      };
      const setTarget = (e) => {
        if (this.status !== 'playing' || this.king.stunned > 0) return;
        const p = this.screenToCanvas(e.clientX, e.clientY);
        this.pointerTarget = p;
        this.king.targetX = p.x;
        this.king.targetY = p.y;
      };
      const canvasPointFromEvent = (e) => {
        const r = this.canvas.getBoundingClientRect();
        return {
          x: (e.clientX - r.left) * (this.canvas.width / r.width),
          y: (e.clientY - r.top) * (this.canvas.height / r.height)
        };
      };
      this.canvas.addEventListener('contextmenu', suppressGameTouch);
      this.canvas.addEventListener('selectstart', suppressGameTouch);
      this.canvas.addEventListener('dragstart', suppressGameTouch);
      this.canvas.addEventListener('touchstart', suppressGameTouch, { passive: false });
      this.canvas.addEventListener('touchmove', suppressGameTouch, { passive: false });
      this.canvas.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'touch' || e.pointerType === 'pen') e.preventDefault();
        const screen = canvasPointFromEvent(e);
        if (this.isMiniMapHit && this.isMiniMapHit(screen.x, screen.y)) {
          this.minimapExpanded = !this.minimapExpanded;
          this.pointerTarget = null;
          return;
        }
        this.canvas.setPointerCapture(e.pointerId);
        setTarget(e);
      });
      this.canvas.addEventListener('pointermove', (e) => {
        if (e.pointerType === 'touch' || e.pointerType === 'pen') e.preventDefault();
        if (e.buttons) setTarget(e);
      });
      this.canvas.addEventListener('pointerup', (e) => {
        if (e.pointerType === 'touch' || e.pointerType === 'pen') e.preventDefault();
        this.pointerTarget = null;
      });
      this.canvas.addEventListener('pointercancel', () => {
        this.pointerTarget = null;
      });
    }


    openMobileMenu() {
      document.body.classList.add('mobile-menu-open');
      if ($('mobileMenuButton')) $('mobileMenuButton').setAttribute('aria-expanded', 'true');
    }

    closeMobileMenu() {
      document.body.classList.remove('mobile-menu-open');
      if ($('mobileMenuButton')) $('mobileMenuButton').setAttribute('aria-expanded', 'false');
    }

    toggleMobileMenu() {
      if (document.body.classList.contains('mobile-menu-open')) this.closeMobileMenu();
      else this.openMobileMenu();
    }

    metaLevel(key) {
      return this.save && this.save.meta ? (this.save.meta[key] || 0) : 0;
    }

    startingCoins() {
      const base = C.startCoins + (this.currentStage.startCoinsBonus || 0) + this.metaLevel('startingCoins') * 25;
      return Math.round(base * (this.currentDifficulty.startCoins || 1));
    }

    kingMaxHp() {
      return 100 + this.metaLevel('kingTraining') * 12;
    }

    castleMaxHp() {
      return Math.round((this.currentStage.castleHp || C.castle.hp) + this.metaLevel('castleMasonry') * 50);
    }

    populateSetupControls() {
      const stageSelect = $('stageSelect');
      const difficultySelect = $('difficultySelect');
      if (stageSelect) {
        stageSelect.innerHTML = '';
        for (const key of Object.keys(C.stages)) {
          const st = C.stages[key];
          const opt = document.createElement('option');
          opt.value = key;
          const meta = this.stageUiMeta(key);
          const routeCount = this.stageRouteCount(key);
          const lockText = this.save.unlockedStages.includes(key) ? '' : ' - 未解放';
          opt.textContent = `${st.name}（${meta.stageType}・${routeCount}ルート・${meta.difficultyLabel}）${lockText}`;
          opt.disabled = !this.save.unlockedStages.includes(key);
          stageSelect.appendChild(opt);
        }
        const selectableStage = C.stages[this.selectedStage] && this.save.unlockedStages.includes(this.selectedStage) ? this.selectedStage : 'meadow';
        stageSelect.value = selectableStage;
        this.selectedStage = selectableStage;
        this.currentStage = C.stages[this.selectedStage] || C.stages.meadow;
      }
      if (difficultySelect) {
        difficultySelect.innerHTML = '';
        for (const key of Object.keys(C.difficulties)) {
          const df = C.difficulties[key];
          const opt = document.createElement('option');
          opt.value = key;
          opt.textContent = `${df.name} / クラウン x${df.crownMult}`;
          difficultySelect.appendChild(opt);
        }
        difficultySelect.value = this.selectedDifficulty;
      }
    }

    changeStage() {
      if (!$('stageSelect')) return;
      this.selectedStage = $('stageSelect').value;
      this.currentStage = C.stages[this.selectedStage] || C.stages.meadow;
      this.save.selectedStage = this.selectedStage;
      storeSave(this.save);
      this.updateSetupHud();
      this.message = `${this.currentStage.name}: ${this.currentStage.desc}`;
      this.updateHud();
    }

    changeDifficulty() {
      if (!$('difficultySelect')) return;
      this.selectedDifficulty = $('difficultySelect').value;
      this.currentDifficulty = C.difficulties[this.selectedDifficulty] || C.difficulties.normal;
      this.save.selectedDifficulty = this.selectedDifficulty;
      storeSave(this.save);
      this.updateSetupHud();
      this.message = `${this.currentDifficulty.name}を選択しました。`;
      this.updateHud();
    }

    renderMetaUpgrades() {
      const root = $('metaUpgradeList');
      if (!root) return;
      root.innerHTML = '';
      for (const key of Object.keys(C.metaUpgrades)) {
        const def = C.metaUpgrades[key];
        const level = this.metaLevel(key);
        const cost = metaCost(key, level);
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'meta-upgrade';
        button.disabled = level >= def.max || this.save.crowns < cost;
        button.innerHTML = `<b>${def.name} Lv.${level}/${def.max}</b><em>${level >= def.max ? 'MAX' : cost + ' クラウン'}</em><span>${def.desc}</span>`;
        button.addEventListener('click', () => this.buyMetaUpgrade(key));
        root.appendChild(button);
      }
    }

    buyMetaUpgrade(key) {
      const def = C.metaUpgrades[key];
      const level = this.metaLevel(key);
      if (!def || level >= def.max) return;
      const cost = metaCost(key, level);
      if (this.save.crowns < cost) return;
      this.save.crowns -= cost;
      this.save.meta[key] = level + 1;
      storeSave(this.save);
      this.renderMetaUpgrades();
      this.updateSetupHud();
      this.message = `${def.name}をLv.${level + 1}に強化しました。`;
      this.updateHud();
    }

    resetSaveData() {
      if (!confirm('クラウン、ステージ解放、ベストスコア、恒久強化を初期化しますか？')) return;
      this.save = defaultSave();
      this.selectedStage = 'meadow';
      this.selectedDifficulty = 'normal';
      this.currentStage = C.stages.meadow;
      this.currentDifficulty = C.difficulties.normal;
      storeSave(this.save);
      this.populateSetupControls();
      this.renderMetaUpgrades();
      this.updateSetupHud();
      this.message = 'セーブデータを初期化しました。';
      this.updateHud();
    }

    stageUiMeta(stageKey) {
      const stage = C.stages[stageKey] || C.stages.meadow;
      const paths = C.stagePaths[stageKey] || C.stagePaths.meadow || {};
      const routeKeys = Object.keys(paths).filter((key) => Array.isArray(paths[key]) && paths[key].length);
      const fallbackRouteNames = C.routeLabels[stageKey] || C.routeLabels.meadow || {};
      const meta = (C.stageUiMeta && C.stageUiMeta[stageKey]) || {};
      return {
        stageType: meta.stageType || '通常',
        stageTypeKey: meta.stageTypeKey || 'normal',
        difficultyLabel: meta.difficultyLabel || '標準',
        difficultyRank: meta.difficultyRank || 1,
        routeCount: meta.routeCount || routeKeys.length || 1,
        routeNames: meta.routeNames || routeKeys.map((key) => fallbackRouteNames[key] || key),
        recommendedFacilities: meta.recommendedFacilities || ['柵', '弓塔'],
        recommendedFacilityKeys: meta.recommendedFacilityKeys || [],
        purpose: meta.purpose || (stage && stage.desc) || '',
        summary: meta.summary || (stage && stage.desc) || ''
      };
    }

    stageRouteCount(stageKey) {
      const meta = C.stageUiMeta && C.stageUiMeta[stageKey];
      if (meta && meta.routeCount) return meta.routeCount;
      const paths = C.stagePaths[stageKey] || C.stagePaths.meadow || {};
      return Math.max(1, Object.keys(paths).filter((key) => Array.isArray(paths[key]) && paths[key].length).length);
    }

    stageBalanceDiagnostics(stageKey) {
      const stage = C.stages[stageKey] || C.stages.meadow;
      const waveDefs = (C.waves || []).slice(0, stage.waveCount || (C.waves || []).length);
      const labels = C.routeLabels[stageKey] || C.routeLabels.meadow || {};
      const routeCounts = {};
      let totalEnemies = 0;
      for (const wave of waveDefs) {
        for (const group of (wave.groups || [])) {
          const route = group.route || 'main';
          const count = group.count || 0;
          routeCounts[route] = (routeCounts[route] || 0) + count;
          totalEnemies += count;
        }
      }
      const routeText = Object.entries(routeCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([route, count]) => `${labels[route] || route}:${count}`)
        .join(' / ');
      const pads = (C.stagePadLayouts && C.stagePadLayouts[stageKey]) || [];
      const hiddenPads = pads.filter((pad) => pad.requiresDiscovery).length;
      const visiblePads = Math.max(0, pads.length - hiddenPads);
      return {
        startCoins: C.startCoins + (stage.startCoinsBonus || 0),
        enemyHp: stage.enemyHp || 1,
        enemyDamage: stage.enemyDamage || 1,
        enemySpeed: stage.enemySpeed || 1,
        padTotal: pads.length,
        visiblePads,
        hiddenPads,
        totalEnemies,
        routeText,
        waveCount: waveDefs.length
      };
    }

    updateStageSummary() {
      const stageKey = this.selectedStage || this.stageKey();
      const stage = C.stages[stageKey] || C.stages.meadow;
      const meta = this.stageUiMeta(stageKey);
      const routeNames = (meta.routeNames || []).join('・');
      if ($('stageSummaryName')) $('stageSummaryName').textContent = stage.name;
      if ($('stageTypeBadge')) {
        $('stageTypeBadge').textContent = meta.stageType;
        $('stageTypeBadge').className = `stage-badge ${meta.stageTypeKey === 'background-test' ? 'is-background-test' : meta.stageTypeKey === 'candidate' ? 'is-candidate' : ''}`.trim();
      }
      if ($('stageSummaryText')) $('stageSummaryText').textContent = `${meta.summary || stage.desc}${routeNames ? ` / ルート:${routeNames}` : ''}`;
      if ($('stageRouteCountText')) $('stageRouteCountText').textContent = `ルート:${meta.routeCount}`;
      if ($('stageDifficultyText')) $('stageDifficultyText').textContent = `難度:${meta.difficultyLabel}${'★'.repeat(Math.max(1, meta.difficultyRank || 1))}`;
      if ($('stageRecommendedText')) $('stageRecommendedText').textContent = `推奨:${(meta.recommendedFacilities || []).join('・')}`;
      const diag = this.stageBalanceDiagnostics(stageKey);
      if ($('stageDiagnosticTotalText')) $('stageDiagnosticTotalText').textContent = `${diag.waveCount}波・敵${diag.totalEnemies}`;
      if ($('stageStartCoinsText')) $('stageStartCoinsText').textContent = `資金:${diag.startCoins}`;
      if ($('stageEnemyRateText')) $('stageEnemyRateText').textContent = `倍率:H${diag.enemyHp.toFixed(2)} A${diag.enemyDamage.toFixed(2)} S${diag.enemySpeed.toFixed(2)}`;
      if ($('stagePadCountText')) $('stagePadCountText').textContent = `床:${diag.padTotal}${diag.hiddenPads ? `+${diag.hiddenPads}` : ''}`;
      if ($('stageRouteCountsText')) $('stageRouteCountsText').textContent = diag.routeText ? `敵:${diag.routeText}` : '-';
    }

    updateSetupHud() {
      if ($('crownText')) $('crownText').textContent = `${this.save.crowns}`;
      if ($('bestText')) {
        const key = `${this.selectedStage}:${this.selectedDifficulty}`;
        const best = this.save.bestScores[key] || 0;
        $('bestText').textContent = best ? `${best}` : '-';
      }
      this.updateStageSummary();
    }


    loadAudioSettings() {
      const base = { sfx: true, bgm: true, volume: 0.45 };
      try {
        const raw = localStorage.getItem(C.audioKey);
        return raw ? { ...base, ...JSON.parse(raw) } : base;
      } catch (_) {
        return base;
      }
    }

    saveAudioSettings() {
      try { localStorage.setItem(C.audioKey, JSON.stringify(this.audio)); } catch (_) {}
    }

    applyAudioUi() {
      if ($('audioButton')) $('audioButton').textContent = `効果音 ${this.audio.sfx ? 'ON' : 'OFF'}`;
      if ($('bgmButton')) $('bgmButton').textContent = `BGM ${this.audio.bgm ? 'ON' : 'OFF'}`;
      if ($('volumeRange')) $('volumeRange').value = `${Math.round(this.audio.volume * 100)}`;
      if (this.masterGain) this.masterGain.gain.value = this.audio.volume;
      if (this.audio.bgm) this.startBgm();
      else this.stopBgm();
    }

    unlockAudio() {
      if (!window.AudioContext && !window.webkitAudioContext) return;
      if (!this.audioContext) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new Ctx();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = this.audio.volume;
        this.masterGain.connect(this.audioContext.destination);
      }
      if (this.audioContext.state === 'suspended') this.audioContext.resume();
    }

    toggleAudio() {
      this.unlockAudio();
      this.audio.sfx = !this.audio.sfx;
      this.saveAudioSettings();
      this.applyAudioUi();
      this.playSfx('click', 0, true);
    }

    toggleBgm() {
      this.unlockAudio();
      this.audio.bgm = !this.audio.bgm;
      this.saveAudioSettings();
      this.applyAudioUi();
      this.playSfx('click', 0, true);
    }

    changeVolume() {
      const v = $('volumeRange') ? Number($('volumeRange').value) / 100 : this.audio.volume;
      this.audio.volume = clamp(v, 0, 1);
      this.saveAudioSettings();
      this.applyAudioUi();
    }

    startBgm() {
      if (!this.audio.bgm || this.bgmNodes.length || !this.audioContext || !this.masterGain) return;
      const ctx = this.audioContext;
      const now = ctx.currentTime;
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(5200, now);
      filter.Q.setValueAtTime(0.35, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.072, now + 0.65);
      gain.connect(filter);
      filter.connect(this.masterGain);
      this.bgmGain = gain;
      this.bgmFilter = filter;

      const droneNotes = [55.00, 110.00];
      this.bgmNodes = droneNotes.map((freq, i) => {
        const osc = ctx.createOscillator();
        const nodeGain = ctx.createGain();
        osc.type = i === 0 ? 'triangle' : 'square';
        osc.frequency.setValueAtTime(freq, now);
        nodeGain.gain.setValueAtTime(i === 0 ? 0.030 : 0.010, now);
        osc.connect(nodeGain);
        nodeGain.connect(gain);
        osc.start(now + i * 0.018);
        return { osc, nodeGain };
      });

      this.bgmStep = 0;
      this.bgmBar = 0;
      this.bgmPhrase = 0;
      this.bgmStepDur = 0.135;
      this.bgmNextTick = now + 0.05;
      this.scheduleBgmStep(this.bgmNextTick);
      this.bgmTimer = setInterval(() => {
        if (!this.audio.bgm || !this.audioContext || !this.bgmGain) return;
        const lookAhead = this.audioContext.currentTime + 0.70;
        while (this.bgmNextTick < lookAhead) {
          this.bgmNextTick += this.bgmStepDur || 0.135;
          this.bgmStep = (this.bgmStep + 1) % 16;
          if (this.bgmStep === 0) {
            this.bgmBar = ((this.bgmBar || 0) + 1) % 4;
            if (this.bgmBar === 0) this.bgmPhrase = ((this.bgmPhrase || 0) + 1) % 2;
          }
          this.scheduleBgmStep(this.bgmNextTick);
        }
      }, 80);
    }

    stopBgm() {
      if (!this.audioContext) return;
      if (this.bgmTimer) clearInterval(this.bgmTimer);
      this.bgmTimer = null;
      const now = this.audioContext.currentTime;
      if (this.bgmGain) {
        this.bgmGain.gain.cancelScheduledValues(now);
        this.bgmGain.gain.setTargetAtTime(0.0001, now, 0.12);
      }
      for (const node of this.bgmNodes) {
        try { node.osc.stop(now + 0.26); } catch (_) {}
      }
      this.bgmNodes = [];
      this.bgmGain = null;
      this.bgmFilter = null;
    }

    playBgmToneAt(startTime, freq, duration, volume, type = 'triangle', endFreq = null, pan = 0) {
      if (!this.audioContext || !this.bgmGain) return;
      const ctx = this.audioContext;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      osc.type = type;
      osc.frequency.setValueAtTime(Math.max(20, freq), startTime);
      if (endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), startTime + duration);
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), startTime + 0.004);
      gain.gain.setTargetAtTime(0.0001, startTime + Math.max(0.018, duration * 0.35), Math.max(0.018, duration * 0.20));
      osc.connect(gain);
      if (panner) {
        panner.pan.setValueAtTime(clamp(pan, -1, 1), startTime);
        gain.connect(panner);
        panner.connect(this.bgmGain);
      } else {
        gain.connect(this.bgmGain);
      }
      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);
    }

    playBgmNoiseAt(startTime, duration, volume, filterType = 'highpass', frequency = 4200) {
      if (!this.audioContext || !this.bgmGain) return;
      const ctx = this.audioContext;
      const len = Math.max(1, Math.floor(ctx.sampleRate * duration));
      const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < len; i += 1) {
        const t = i / Math.max(1, len - 1);
        const bit = Math.random() > 0.5 ? 1 : -1;
        data[i] = bit * Math.pow(1 - t, 2.0);
      }
      const source = ctx.createBufferSource();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      source.buffer = buffer;
      filter.type = filterType;
      filter.frequency.setValueAtTime(frequency, startTime);
      filter.Q.setValueAtTime(0.85, startTime);
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), startTime + 0.003);
      gain.gain.setTargetAtTime(0.0001, startTime + Math.max(0.014, duration * 0.20), Math.max(0.010, duration * 0.18));
      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.bgmGain);
      source.start(startTime);
      source.stop(startTime + duration + 0.03);
    }

    playBgmArpAt(startTime, notes, volume = 0.022, pan = 0) {
      const dur = (this.bgmStepDur || 0.135) / Math.max(1, notes.length);
      for (let i = 0; i < notes.length; i += 1) {
        this.playBgmToneAt(startTime + i * dur, notes[i], dur * 0.92, volume, 'square', null, pan);
      }
    }

    scheduleBgmStep(t) {
      const step = this.bgmStep || 0;
      const bar = this.bgmBar || 0;
      const phrase = this.bgmPhrase || 0;
      const rootSeq = [146.83, 174.61, 130.81, 196.00];
      const root = rootSeq[bar % rootSeq.length];
      const fifth = root * 1.5;
      const octave = root * 2;
      const minorThird = root * 1.2;
      const raid = this.wave && this.wave.active;
      const boss = this.enemies && this.enemies.some((enemy) => enemy.def && enemy.def.boss);
      const stageShift = 1;

      if (this.bgmFilter && this.audioContext) {
        const target = boss ? 6600 : raid ? 5900 : 5100;
        this.bgmFilter.frequency.setTargetAtTime(target, t, 0.25);
      }

      if (step === 0 || step === 8) {
        const bass = (step === 8 ? root : root / 2) * stageShift;
        this.playBgmToneAt(t, bass, 0.22, raid ? 0.070 : 0.056, 'triangle', bass * 0.997, -0.08);
      }
      if (step === 4 || step === 12) {
        const bass = (bar % 2 ? fifth / 2 : root / 2) * stageShift;
        this.playBgmToneAt(t, bass, 0.18, raid ? 0.052 : 0.040, 'triangle', null, -0.05);
      }

      if (step % 2 === 0) {
        const notes = phrase
          ? [root, minorThird, fifth, octave].map((n) => n * stageShift)
          : [root, fifth, octave, fifth].map((n) => n * stageShift);
        this.playBgmArpAt(t + 0.010, notes, raid ? 0.018 : 0.014, step % 4 === 0 ? -0.18 : 0.18);
      }

      const leadPatternA = [0, null, 3, null, 5, null, 7, 10, 12, null, 10, null, 7, 5, 3, null];
      const leadPatternB = [12, null, 10, 7, 5, null, 7, null, 10, 12, null, 15, 14, null, 12, 10];
      const scale = [root, minorThird, fifth, octave, octave * 1.2, octave * 1.5, octave * 2];
      const p = phrase ? leadPatternB[step] : leadPatternA[step];
      if (p != null) {
        const degree = Math.min(scale.length - 1, Math.max(0, Math.floor(p / 3)));
        const note = scale[degree] * (p >= 12 ? 2 : 1) * stageShift;
        this.playBgmToneAt(t + 0.012, note, 0.092, raid ? 0.027 : 0.020, 'square', null, 0.05);
      }

      if (step === 0 || step === 8) this.playBgmNoiseAt(t, 0.070, raid ? 0.040 : 0.026, 'lowpass', 900);
      if (step === 4 || step === 12) this.playBgmNoiseAt(t + 0.004, 0.038, 0.022, 'bandpass', 1800);
      if (step % 2 === 1) this.playBgmNoiseAt(t + 0.006, 0.030, raid ? 0.012 : 0.008, 'highpass', 5200);
      if (raid && (step === 2 || step === 6 || step === 10 || step === 14)) {
        this.playBgmToneAt(t, root / 1.5, 0.075, boss ? 0.036 : 0.024, 'square', root / 1.7, -0.12);
      }
      if (boss && (step === 3 || step === 11)) {
        this.playBgmNoiseAt(t, 0.095, 0.033, 'lowpass', 520);
        this.playBgmToneAt(t, root / 3, 0.180, 0.045, 'sawtooth', root / 4, 0);
      }
    }

    playToneAt(startTime, freq, endFreq, duration, volume, type = 'sine', attack = 0.006) {
      if (!this.audioContext || !this.masterGain) return;
      const ctx = this.audioContext;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const end = Math.max(20, endFreq == null ? freq : endFreq);
      osc.type = type;
      osc.frequency.setValueAtTime(Math.max(20, freq), startTime);
      osc.frequency.exponentialRampToValueAtTime(end, startTime + duration);
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), startTime + attack);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(startTime);
      osc.stop(startTime + duration + 0.03);
    }

    playNoiseAt(startTime, duration, volume, filterType = 'highpass', frequency = 5200, q = 0.8) {
      if (!this.audioContext || !this.masterGain) return;
      const ctx = this.audioContext;
      const len = Math.max(1, Math.floor(ctx.sampleRate * duration));
      const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < len; i += 1) {
        const t = i / Math.max(1, len - 1);
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 1.65);
      }
      const source = ctx.createBufferSource();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      source.buffer = buffer;
      filter.type = filterType;
      filter.frequency.setValueAtTime(frequency, startTime);
      filter.Q.setValueAtTime(q, startTime);
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), startTime + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      source.start(startTime);
      source.stop(startTime + duration + 0.03);
    }

    playTactileClick(now, power = 1) {
      this.playNoiseAt(now, 0.030, 0.070 * power, 'highpass', 5600, 1.1);
      this.playNoiseAt(now + 0.010, 0.026, 0.036 * power, 'bandpass', 2600, 4.2);
      this.playToneAt(now, 1180, 1860, 0.038, 0.030 * power, 'square', 0.003);
      this.playToneAt(now + 0.014, 2450, 1880, 0.030, 0.018 * power, 'triangle', 0.002);
    }

    playSparkle(now, base = 760, volume = 0.045) {
      this.playToneAt(now, base, base * 1.55, 0.070, volume, 'triangle', 0.004);
      this.playToneAt(now + 0.045, base * 1.5, base * 2.1, 0.090, volume * 0.75, 'sine', 0.004);
      this.playToneAt(now + 0.105, base * 2.2, base * 2.8, 0.105, volume * 0.55, 'sine', 0.004);
    }

    playThump(now, freq = 130, volume = 0.10, duration = 0.18) {
      this.playToneAt(now, freq, Math.max(35, freq * 0.45), duration, volume, 'sine', 0.006);
      this.playNoiseAt(now, Math.min(0.09, duration * 0.55), volume * 0.35, 'lowpass', 900, 0.7);
    }

    vibrate(pattern) {
      if (!this.audio.sfx || !navigator.vibrate) return;
      try { navigator.vibrate(pattern); } catch (_) {}
    }

    playChiptuneJingle(now, notes, unit = 0.085, volume = 0.045) {
      for (let i = 0; i < notes.length; i += 1) {
        const n = notes[i];
        if (!n) continue;
        const [freq, len = 1, type = 'square'] = Array.isArray(n) ? n : [n, 1, 'square'];
        this.playToneAt(now + i * unit, freq, freq * 1.002, unit * 0.92 * len, volume, type, 0.002);
        if (i % 2 === 0) this.playToneAt(now + i * unit, freq / 2, freq / 2, unit * 0.75, volume * 0.35, 'triangle', 0.002);
      }
    }

    playSfx(name, cooldown = 0, force = false) {
      if ((!this.audio.sfx && !force) || !window.AudioContext && !window.webkitAudioContext) return;
      this.unlockAudio();
      if (!this.audioContext || !this.masterGain) return;
      const nowMs = performance.now();
      if (cooldown && this.sfxCooldown[name] && nowMs - this.sfxCooldown[name] < cooldown) return;
      this.sfxCooldown[name] = nowMs;
      const now = this.audioContext.currentTime;

      if (name === 'click') {
        this.playTactileClick(now, 0.95);
        this.vibrate(8);
        return;
      }
      if (name === 'start') {
        this.playTactileClick(now, 0.85);
        this.playChiptuneJingle(now + 0.030, [523.25, 659.25, 783.99, 1046.50], 0.055, 0.034);
        return;
      }
      if (name === 'pause') {
        this.playToneAt(now, 360, 240, 0.090, 0.052, 'sine');
        return;
      }
      if (name === 'resume') {
        this.playToneAt(now, 260, 420, 0.090, 0.055, 'sine');
        return;
      }
      if (name === 'coin') {
        this.playToneAt(now, 920, 1320, 0.055, 0.038, 'triangle', 0.003);
        this.playToneAt(now + 0.040, 1320, 1760, 0.060, 0.026, 'sine', 0.003);
        return;
      }
      if (name === 'pay') {
        this.playTactileClick(now, 0.45);
        return;
      }
      if (name === 'build') {
        this.playThump(now, 150, 0.080, 0.120);
        this.playChiptuneJingle(now + 0.045, [392.00, 523.25, 659.25, [783.99, 1.4]], 0.065, 0.043);
        this.playSparkle(now + 0.065, 560, 0.038);
        this.vibrate([12, 18, 12]);
        return;
      }
      if (name === 'upgrade' || name === 'discovery') {
        this.playTactileClick(now, 0.62);
        if (name === 'discovery') {
          this.playChiptuneJingle(now + 0.030, [659.25, 783.99, 987.77, [1318.51, 1.45]], 0.070, 0.046);
          this.playSparkle(now + 0.070, 740, 0.052);
        } else {
          this.playChiptuneJingle(now + 0.020, [523.25, 659.25, 783.99, 987.77, [1174.66, 1.25]], 0.055, 0.044);
          this.playSparkle(now + 0.065, 760, 0.060);
        }
        this.vibrate([10, 20, 14]);
        return;
      }
      if (name === 'wave') {
        this.playThump(now, 120, 0.080, 0.240);
        this.playToneAt(now + 0.070, 300, 520, 0.180, 0.045, 'sawtooth');
        return;
      }
      if (name === 'boss') {
        this.playThump(now, 90, 0.145, 0.420);
        this.playNoiseAt(now + 0.040, 0.220, 0.052, 'lowpass', 620, 0.9);
        this.vibrate([24, 24, 32]);
        return;
      }
      if (name === 'clear') {
        this.playChiptuneJingle(now, [523.25, 659.25, 783.99, [1046.50, 1.25]], 0.070, 0.045);
        this.playSparkle(now + 0.050, 620, 0.052);
        return;
      }
      if (name === 'victory') {
        this.playChiptuneJingle(now, [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98, [2093.00, 2.0]], 0.075, 0.052);
        this.playSparkle(now + 0.080, 680, 0.075);
        this.playSparkle(now + 0.260, 940, 0.060);
        this.vibrate([30, 40, 30]);
        return;
      }
      if (name === 'defeat') {
        this.playChiptuneJingle(now, [392.00, 349.23, 293.66, 220.00, [146.83, 2.2, 'triangle']], 0.110, 0.055);
        this.playThump(now + 0.040, 120, 0.090, 0.300);
        this.playToneAt(now + 0.240, 160, 58, 0.520, 0.070, 'sawtooth');
        this.vibrate(60);
        return;
      }
      if (name === 'castleHit') {
        this.playThump(now, 95, 0.120, 0.180);
        this.playNoiseAt(now, 0.090, 0.055, 'lowpass', 900, 0.8);
        this.vibrate(28);
        return;
      }
      if (name === 'kingHit') {
        this.playNoiseAt(now, 0.050, 0.070, 'bandpass', 1600, 1.8);
        this.playToneAt(now, 220, 95, 0.120, 0.065, 'square');
        this.vibrate(24);
        return;
      }
      if (name === 'stun') {
        this.playThump(now, 100, 0.150, 0.330);
        this.playToneAt(now + 0.060, 180, 54, 0.480, 0.085, 'sawtooth');
        this.vibrate([32, 30, 32]);
        return;
      }
      if (name === 'enemyDown') {
        this.playNoiseAt(now, 0.040, 0.032, 'bandpass', 1100, 1.5);
        this.playToneAt(now, 260, 150, 0.055, 0.026, 'triangle');
        return;
      }
      if (name === 'bossDown') {
        this.playThump(now, 150, 0.130, 0.280);
        this.playNoiseAt(now + 0.030, 0.180, 0.075, 'lowpass', 780, 0.8);
        this.playSparkle(now + 0.170, 420, 0.060);
        this.vibrate([35, 40, 35]);
        return;
      }
      if (name === 'arrowShot') {
        this.playNoiseAt(now, 0.035, 0.026, 'highpass', 3200, 0.9);
        this.playToneAt(now, 1650, 980, 0.040, 0.014, 'triangle', 0.002);
        return;
      }
      if (name === 'cannonShot') {
        this.playThump(now, 92, 0.115, 0.190);
        this.playNoiseAt(now, 0.075, 0.070, 'lowpass', 700, 0.7);
        this.vibrate(18);
        return;
      }
      if (name === 'spawn') {
        this.playToneAt(now, 340, 510, 0.070, 0.030, 'triangle');
        this.playTactileClick(now + 0.018, 0.40);
        return;
      }
      if (name === 'raidHit') {
        this.playNoiseAt(now, 0.050, 0.060, 'bandpass', 1450, 1.3);
        this.playToneAt(now, 190, 120, 0.090, 0.040, 'square');
        this.vibrate(16);
        return;
      }
      if (name === 'explosion') {
        this.playThump(now, 105, 0.125, 0.250);
        this.playNoiseAt(now, 0.150, 0.090, 'lowpass', 680, 0.7);
        this.vibrate(22);
        return;
      }

      this.playTactileClick(now, 0.65);
    }

    startResultFx(type) {
      this.resultFx = { type, life: 3600, max: 3600, seed: cryptoRandom() };
      const color = type === 'win' ? '#ffd35b' : '#ff6b5e';
      const count = type === 'win' ? 72 : 42;
      for (let i = 0; i < count; i += 1) this.addBurst(rand(40, C.w - 40), rand(110, 230), color, 1);
    }

    worldWidth() {
      return C.world && C.world.w ? C.world.w : C.w;
    }

    worldHeight() {
      return C.world && C.world.h ? C.world.h : C.h;
    }

    updateCamera(force = false) {
      if (!this.camera) this.camera = { x: 0, y: 0, targetX: 0, targetY: 0 };
      const maxX = Math.max(0, this.worldWidth() - C.w);
      const maxY = Math.max(0, this.worldHeight() - C.h);
      const targetX = clamp(this.king.x - C.w / 2, 0, maxX);
      const targetY = clamp(this.king.y - C.h / 2, 0, maxY);
      this.camera.targetX = targetX;
      this.camera.targetY = targetY;
      if (force) {
        this.camera.x = targetX;
        this.camera.y = targetY;
      } else {
        this.camera.x += (targetX - this.camera.x) * 0.18;
        this.camera.y += (targetY - this.camera.y) * 0.18;
      }
    }

    worldToScreen(x, y) {
      return { x: x - (this.camera ? this.camera.x : 0), y: y - (this.camera ? this.camera.y : 0) };
    }

    screenToCanvas(clientX, clientY) {
      const r = this.canvas.getBoundingClientRect();
      const screenX = (clientX - r.left) * (this.canvas.width / r.width);
      const screenY = (clientY - r.top) * (this.canvas.height / r.height);
      return {
        x: clamp(screenX + (this.camera ? this.camera.x : 0), 18, this.worldWidth() - 18),
        y: clamp(screenY + (this.camera ? this.camera.y : 0), 128, this.worldHeight() - 18)
      };
    }


    initialBackgroundDebug() {
      const cfg = C.backgroundDebug || {};
      let enabled = !!cfg.defaultEnabled;
      let labels = true;
      try {
        const params = new URLSearchParams(window.location.search || '');
        if (params.get('bgdebug') === '1') enabled = true;
        if (params.get('bgdebug') === '0') enabled = false;
        if (params.get('bglabels') === '0') labels = false;
      } catch (_) {}
      return { enabled, labels };
    }


    initialBackgroundPartDebug() {
      const cfg = C.backgroundPartDebug || {};
      let enabled = !!cfg.defaultEnabled;
      let labels = true;
      try {
        const params = new URLSearchParams(window.location.search || '');
        if (params.get('bgparts') === '1') enabled = true;
        if (params.get('bgparts') === '0') enabled = false;
        if (params.get('bgpartlabels') === '0') labels = false;
      } catch (_) {}
      return { enabled, labels };
    }

    toggleBackgroundDebug() {
      this.backgroundDebug = this.backgroundDebug || { enabled: false, labels: true };
      this.backgroundDebug.enabled = !this.backgroundDebug.enabled;
      const text = this.backgroundDebug.enabled ? '背景レイヤー可視化: ON' : '背景レイヤー可視化: OFF';
      this.message = text;
      if (this.showNotice) this.showNotice(text, 'info', 1500, 5);
      this.updateHud();
    }


    toggleBackgroundPartDebug() {
      this.backgroundPartDebug = this.backgroundPartDebug || { enabled: false, labels: true };
      this.backgroundPartDebug.enabled = !this.backgroundPartDebug.enabled;
      const text = this.backgroundPartDebug.enabled ? '背景パーツ確認: ON' : '背景パーツ確認: OFF';
      this.message = text;
      if (this.showNotice) this.showNotice(text, 'info', 1500, 5);
      this.updateHud();
    }

    toggleBackgroundDebugLabels() {
      this.backgroundDebug = this.backgroundDebug || { enabled: false, labels: true };
      this.backgroundPartDebug = this.backgroundPartDebug || { enabled: false, labels: true };
      const next = !(this.backgroundDebug.labels !== false || this.backgroundPartDebug.labels !== false);
      this.backgroundDebug.labels = next;
      this.backgroundPartDebug.labels = next;
      const text = next ? '背景デバッグラベル: ON' : '背景デバッグラベル: OFF';
      this.message = text;
      if (this.showNotice) this.showNotice(text, 'info', 1300, 5);
      this.updateHud();
    }

    togglePause() {
      if (this.status !== 'playing') return;
      this.paused = !this.paused;
      this.message = this.paused ? '一時停止中です。' : '再開しました。';
      this.playSfx(this.paused ? 'pause' : 'resume');
      this.updateHud();
    }

    toggleSpeed() {
      if (this.status !== 'playing') return;
      this.speed = this.speed === 1 ? 2 : 1;
      $('speedButton').textContent = `${this.speed}x`;
      this.message = `速度: ${this.speed}x`;
      this.playSfx('click');
      this.updateHud();
    }

    loop(t) {
      try {
        const rawDt = Math.min(50, t - this.last);
        this.last = t;
        const dt = rawDt * (this.status === 'playing' && !this.paused ? this.speed : 1);
        if (this.status === 'playing' && !this.paused) this.update(dt);
        this.render();
      } catch (error) {
        console.error('[Game Loop Error]', error);
        this.paused = true;
        this.message = 'エラーが発生しました。再読み込みしてください。';
        this.showNotice && this.showNotice('表示エラー。再読み込みしてください', 'danger', 1800, 9);
      }
      requestAnimationFrame((n) => this.loop(n));
    }

    update(dt) {
      this.time += dt;
      this.flash = Math.max(0, this.flash - dt);
      this.shake = Math.max(0, this.shake - dt);
      this.castle.hit = Math.max(0, this.castle.hit - dt);
      this.wave.banner = Math.max(0, this.wave.banner - dt);
      this.routeAlert.life = Math.max(0, this.routeAlert.life - dt);
      if (this.notice) this.notice.life = Math.max(0, (this.notice.life || 0) - dt);
      const wasKingStunned = this.king.stunned > 0;
      this.king.invuln = Math.max(0, this.king.invuln - dt);
      this.king.stunned = Math.max(0, this.king.stunned - dt);
      if (wasKingStunned && this.king.stunned <= 0 && this.king.reviveInvulnPending > 0) {
        this.king.invuln = Math.max(this.king.invuln, this.king.reviveInvulnPending);
        this.king.reviveInvulnPending = 0;
        this.message = '主人公が復帰しました。2秒間は敵からダメージを受けません。HPは少しずつ自動回復します。';
        if (this.setNotice) this.setNotice(this.message, 'info', 3200, 8);
        this.addFloater('主人公、復帰', this.king.x, this.king.y - 52, '#fff3a3');
        if (this.addAuraRipple) this.addAuraRipple(this.king.x, this.king.y, '#fff3a3', 76, 4, 760);
      }

      this.updateKing(dt);
      this.updateCamera();
      if (!this.tutorialMode) {
        this.updateDiscoveries(dt);
        this.updateDiscoverySites(dt);
        this.updateWave(dt);
      }
      this.updateEnemies(dt);
      this.updateFacilities(dt);
      this.updateSoldiers(dt);
      this.updateProjectiles(dt);
      this.updateCoins(dt);
      this.updateBuildPayments(dt);
      if (this.tutorialMode) this.updateTutorial(dt);
      else this.updateContextHint(dt);
      this.updateEffects(dt);
      this.checkEnd();
      this.updateHud();
    }

    updateContextHint(dt) {
      if (this.tutorialMode) return;
      this.hintTimer -= dt;
      if (this.hintTimer > 0) return;
      this.hintTimer = 620;
      if (this.paused || this.status !== 'playing') return;
      const nearHint = this.activePadHint();
      if (nearHint && !this.wave.active) {
        this.message = nearHint;
        return;
      }
      if (this.wave.active && this.routeAlert.life <= 0) {
        const living = this.enemies.length;
        if (living >= 12) this.message = `敵が${living}体います。主人公を危険地帯に置きすぎず、防衛床へ投資してください。`;
      }
    }

    isMobileView() {
      return !!(window.matchMedia && window.matchMedia('(max-width: 860px)').matches);
    }

    miniMapBounds() {
      const expanded = !!this.minimapExpanded;
      if (expanded) {
        const mapW = 350;
        const mapH = 430;
        return { x: Math.round((C.w - mapW) / 2), y: 176, w: mapW, h: mapH, expanded: true };
      }
      const compact = this.isMobileView();
      const mapW = compact ? 118 : 128;
      const mapH = compact ? 154 : 188;
      const margin = compact ? 10 : 12;
      return { x: C.w - mapW - margin, y: C.h - mapH - (compact ? 16 : 18), w: mapW, h: mapH, expanded: false };
    }

    isMiniMapHit(x, y) {
      const worldW = this.worldWidth ? this.worldWidth() : C.w;
      const worldH = this.worldHeight ? this.worldHeight() : C.h;
      if (worldW <= C.w && worldH <= C.h) return false;
      const b = this.miniMapBounds();
      return x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
    }

    nextWaveShortSummary() {
      if (!this.waves || !this.waves.length) return '-';
      if (this.wave.done) return '進軍完了';
      const nextIndex = this.wave.active ? this.wave.index : this.wave.index + 1;
      const wave = this.waves[nextIndex];
      if (!wave) return '最終確認中';
      const counts = {};
      for (const group of wave.groups) {
        const name = C.enemyTypes[group.type] ? C.enemyTypes[group.type].name : group.type;
        counts[name] = (counts[name] || 0) + group.count;
      }
      const main = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
      const major = main ? `${main[0]}多め` : wave.title;
      const labels = C.routeLabels[this.stageKey()] || C.routeLabels.meadow;
      const routes = [...new Set(wave.groups.map((g) => g.route || 'main'))];
      const routeText = routes.length >= 3 ? '三方向' : routes.length === 2 ? '二方向' : (labels[routes[0]] || labels.main || routes[0]);
      const rest = this.wave.active ? '進行中' : `${Math.ceil(Math.max(0, this.wave.rest) / 1000)}秒`;
      return `次:${major} / ${routeText} / ${rest}`;
    }

    nextWaveSummary() {
      if (!this.waves || !this.waves.length) return '-';
      if (this.wave.done) return '進軍完了';
      const nextIndex = this.wave.active ? this.wave.index : this.wave.index + 1;
      const wave = this.waves[nextIndex];
      if (!wave) return '最終確認中';
      const counts = {};
      for (const group of wave.groups) {
        const name = C.enemyTypes[group.type] ? C.enemyTypes[group.type].name : group.type;
        counts[name] = (counts[name] || 0) + group.count;
      }
      const major = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([name, count]) => `${name}${count}`).join(' / ');
      const labels = C.routeLabels[this.stageKey()] || C.routeLabels.meadow;
      const routes = [...new Set(wave.groups.map((g) => g.route || 'main'))];
      const routeText = routes.length >= 3 ? '三方向' : routes.length === 2 ? '二方向' : (labels[routes[0]] || labels.main || routes[0]);
      const rest = this.wave.active ? '進行中' : `あと${Math.ceil(Math.max(0, this.wave.rest) / 1000)}秒`;
      return `${nextIndex + 1}/${this.waves.length} ${wave.title}｜${routeText}｜${major}｜${rest}`;
    }

    activePadHint() {
      let nearest = null;
      let best = 64;
      for (const pad of this.pads) {
        if (!this.isPadVisible(pad)) continue;
        const d = distXY(this.king.x, this.king.y, pad.x, pad.y);
        if (d < best) { nearest = pad; best = d; }
      }
      if (!nearest) return '';
      const def = C.facilityTypes[nearest.type];
      const existing = nearest.facilityId ? this.facilities.find((f) => f.id === nearest.facilityId) : null;
      if (!this.isPadUnlocked(nearest)) return `${def.name}: 前線${nearest.territory}が必要。前哨基地で前線を広げる。`;
      if (!existing) {
        const remain = Math.max(0, Math.ceil(def.cost - nearest.invested));
        const short = this.facilityShortText ? this.facilityShortText(nearest.type) : (def.desc || '');
        const label = this.facilityCategoryLabel ? this.facilityCategoryLabel(nearest.type) : '施設';
        const advice = this.padStrategicAdvice ? this.padStrategicAdvice(nearest) : '';
        return `${def.name} / ${label}: 残り${remain}コイン。${short}${advice ? ' / ' + advice : ''}`;
      }
      const maxLevel = this.facilityMaxLevel ? this.facilityMaxLevel(existing.type) : 4;
      if (existing.level >= maxLevel) return `${def.name}: Lv.${maxLevel} MAX。別の床へ向かう。`;
      const need = this.getUpgradeNeed(existing);
      const remain = Math.max(0, Math.ceil(need - nearest.upgradeInvested));
      const nextLevel = existing.level + 1;
      const colorName = C.levelColorNames && C.levelColorNames[nextLevel] ? C.levelColorNames[nextLevel] : '';
      return `${def.name} Lv.${existing.level}: 残り${remain}コインでLv.${nextLevel}${colorName ? '（' + colorName + '）' : ''}へ強化。`;
    }

    stageGoal() {
      return (C.stageGoals && C.stageGoals[this.stageKey()]) || C.stageGoals && C.stageGoals.meadow || { title: '防衛', intro: '', opening: '', winTip: '', loseTip: '' };
    }

    nextWaveProfile() {
      const nextIndex = this.wave && this.wave.active ? this.wave.index : (this.wave ? this.wave.index + 1 : 0);
      const wave = this.waves && this.waves[nextIndex];
      const profile = { total: 0, main: 0, left: 0, side: 0, raid: 0, fast: 0, heavy: 0, swarm: 0, siege: 0, boss: 0, support: 0 };
      if (!wave) return profile;
      for (const group of wave.groups || []) {
        const count = group.count || 0;
        const def = C.enemyTypes[group.type] || {};
        profile.total += count;
        if ((group.route || 'main') === 'side') profile.side += count; else if ((group.route || 'main') === 'left') profile.left += count; else profile.main += count;
        if (group.raid) profile.raid += count;
        if (group.type === 'runner') profile.fast += count;
        if (group.type === 'shield' || group.type === 'brute') profile.heavy += count;
        if (group.type === 'siege') profile.siege += count;
        if (group.type === 'shaman') profile.support += count;
        if (def.boss) profile.boss += count;
      }
      profile.swarm = profile.total >= 26 ? profile.total : 0;
      return profile;
    }

    builtCount(type) {
      return (this.facilities || []).filter((f) => f.type === type && f.hp > 0).length;
    }

    builtCategoryCount(category) {
      if (!this.facilityCategory) return 0;
      return (this.facilities || []).filter((f) => f.hp > 0 && this.facilityCategory(f.type) === category).length;
    }

    distanceToNearestRoute(x, y) {
      let best = Infinity;
      const paths = (C.stagePaths && C.stagePaths[this.stageKey()]) || C.stagePaths.meadow || {};
      const routes = Object.keys(paths).length ? Object.keys(paths) : ['main', 'side'];
      for (const route of routes) {
        const path = this.routePath ? this.routePath(route) : [];
        for (let i = 1; i < path.length; i += 1) {
          const a = path[i - 1];
          const b = path[i];
          const denom = ((b.x - a.x) ** 2 + (b.y - a.y) ** 2) || 1;
          const t = clamp(((x - a.x) * (b.x - a.x) + (y - a.y) * (b.y - a.y)) / denom, 0, 1);
          const px = a.x + (b.x - a.x) * t;
          const py = a.y + (b.y - a.y) * t;
          best = Math.min(best, distXY(x, y, px, py));
        }
      }
      return best;
    }


    distanceToRouteSet(x, y, routes) {
      let best = Infinity;
      for (const route of routes || []) {
        const path = this.routePath ? this.routePath(route) : [];
        for (let i = 1; i < path.length; i += 1) {
          const a = path[i - 1];
          const b = path[i];
          const denom = ((b.x - a.x) ** 2 + (b.y - a.y) ** 2) || 1;
          const t = clamp(((x - a.x) * (b.x - a.x) + (y - a.y) * (b.y - a.y)) / denom, 0, 1);
          const px = a.x + (b.x - a.x) * t;
          const py = a.y + (b.y - a.y) * t;
          best = Math.min(best, distXY(x, y, px, py));
        }
      }
      return best;
    }

    nearNextWaveRoute(x, y, radius = 96) {
      if (!this.waves || !this.wave) return false;
      const next = this.wave.active ? this.waves[this.wave.index] : this.waves[this.wave.index + 1];
      if (!next || !next.groups) return false;
      const routes = Array.from(new Set(next.groups.map((g) => g.route || 'main')));
      return this.distanceToRouteSet(x, y, routes) <= radius;
    }

    padStrategicScore(pad) {
      const def = C.facilityTypes[pad.type];
      if (!pad || !def || (this.isPadVisible && !this.isPadVisible(pad))) return { score: 0, grade: '', reason: '' };
      const existing = pad.facilityId ? this.facilities.find((f) => f.id === pad.facilityId) : null;
      if (existing || (this.isPadUnlocked && !this.isPadUnlocked(pad))) return { score: 0, grade: '', reason: '' };
      const profile = this.nextWaveProfile();
      const category = this.facilityCategory ? this.facilityCategory(pad.type) : 'defense';
      const routeD = this.distanceToNearestRoute(pad.x, pad.y);
      let score = 35;
      const reasons = [];
      const early = !this.wave || this.wave.index < 2;
      if (routeD < 70) { score += 18; reasons.push('道に近い'); }
      if (routeD > 170 && (category === 'attack' || category === 'defense')) score -= 16;
      if (category === 'attack') {
        if (this.builtCategoryCount('attack') < 1) { score += 18; reasons.push('火力不足'); }
        if (pad.type === 'archer' && (profile.fast || early)) { score += 12; reasons.push(profile.fast ? '走り兵対策' : '序盤安定'); }
        if (pad.type === 'archer' && profile.heavy && !profile.swarm) { score += 8; reasons.push('単体処理'); }
        if (pad.type === 'cannon' && (profile.swarm || profile.left + profile.side + profile.main >= 22)) { score += 18; reasons.push('群れ対策'); }
        if (pad.type === 'cannon' && profile.heavy) { score += 10; reasons.push('硬い敵をまとめて削る'); }
        if (profile.support) { score += 8; reasons.push('支援敵を早く倒す'); }
      }
      if (category === 'defense') {
        if (this.builtCategoryCount('defense') < 1) { score += 16; reasons.push('足止め不足'); }
        if (profile.fast || profile.siege || profile.swarm) { score += 17; reasons.push('進軍を止める'); }
        if (this.builtCount('cannon') > 0 || this.builtCount('archer') > 0) { score += 7; reasons.push('火力の前で止める'); }
      }
      if (category === 'economy') {
        if (early) { score += 20; reasons.push('早いほど得'); }
        if (this.king && this.king.coins < 90) { score += 8; reasons.push('強化資金'); }
        if (this.builtCategoryCount('attack') < 1 && this.builtCategoryCount('defense') < 1) { score -= 18; reasons.push('防衛不足に注意'); }
        if (this.builtCategoryCount('economy') >= 2) score -= 18;
        if (profile.siege || profile.boss || profile.swarm) score -= 10;
      }
      if (category === 'support') {
        if (this.facilities.length >= 2) { score += 10; reasons.push('既存防衛を伸ばす'); }
        if (pad.type === 'barracks' && (profile.left || profile.side)) { score += 14; reasons.push('側道対応'); }
        if (pad.type === 'barracks' && profile.left && profile.side) { score += 8; reasons.push('複数ルート対応'); }
        if (pad.type === 'barracks' && this.kingdom && this.soldiers.length < this.kingdom.popCap) { score += 8; reasons.push('自動防衛'); }
      }
      if (profile.raid && category !== 'economy') { score += 8; reasons.push('略奪隊対応'); }
      score = clamp(Math.round(score), 0, 100);
      const grade = score >= 72 ? '◎' : score >= 55 ? '○' : score >= 38 ? '△' : '・';
      return { score, grade, reason: reasons.slice(0, 2).join(' / ') || '状況次第' };
    }

    padStrategicAdvice(pad) {
      const r = this.padStrategicScore ? this.padStrategicScore(pad) : null;
      if (!r || !r.grade) return '';
      return `${r.grade} ${r.reason}`;
    }

    enemyIntentSummary() {
      const raids = (this.enemies || []).filter((e) => e.raidTargetId && e.hp > 0);
      const bosses = (this.enemies || []).filter((e) => e.def && e.def.boss && e.hp > 0);
      if (bosses.length) return 'ボスが城へ圧力。足止めと範囲火力を確認。';
      if (raids.length) {
        const target = raids[0].raidTargetName || '拠点';
        return `略奪隊が${target}を狙っています。守るか、城防衛を優先するか判断。`;
      }
      const profile = this.nextWaveProfile();
      if ((profile.side && profile.main) || (profile.left && profile.main) || (profile.left && profile.side)) return '次は複数ルート。片方は施設、危険な側は主人公で補助。';
      if (profile.swarm) return '次は数が多い。柵で止め、大砲でまとめて削る。兵舎は側道維持に回す。';
      if (profile.heavy) return '次は硬い敵。弓塔で削り、柵で止める。群れなら大砲も必要。';
      return (this.stageGoal().opening || '次の進軍に合わせて投資先を選ぶ。');
    }

    runAssessment(won) {
      const built = this.facilities || [];
      const found = (this.discoveries || []).filter((d) => d.discovered).length;
      const totalDiscoveries = (this.discoveries || []).length || 1;
      const defense = this.builtCategoryCount ? this.builtCategoryCount('defense') : 0;
      const attack = this.builtCategoryCount ? this.builtCategoryCount('attack') : 0;
      const economy = this.builtCategoryCount ? this.builtCategoryCount('economy') : 0;
      const support = this.builtCategoryCount ? this.builtCategoryCount('support') : 0;
      const castleRatio = this.castle ? this.castle.hp / Math.max(1, this.castle.maxHp) : 0;
      const defendScore = Math.round(clamp(castleRatio * 70 + defense * 7 + attack * 6, 0, 100));
      const developScore = Math.round(clamp((found / totalDiscoveries) * 78 + support * 5, 0, 100));
      const economyScore = Math.round(clamp(economy * 26 + (this.kingdom.economyBonus - 1) * 120, 0, 100));
      const grade = (s) => s >= 85 ? 'S' : s >= 70 ? 'A' : s >= 55 ? 'B' : s >= 40 ? 'C' : 'D';
      const tips = [];
      if (defense < 1) tips.push('足止め施設が不足。柵で敵を止める。');
      if (attack < 1) tips.push('火力施設が不足。弓塔か大砲を早めに置く。');
      if (economy < 1 && found >= 2) tips.push('金鉱への投資が弱い。防衛が安定したら早めに金鉱を建てる。');
      if (found < Math.ceil(totalDiscoveries / 2)) tips.push('金鉱エリアへの展開が少ない。安全な合間に右下を確認する。');
      if (!tips.length) tips.push(won ? (this.stageGoal().winTip || '次は別の配置を試す。') : (this.stageGoal().loseTip || '城近くの防衛線を見直す。'));
      return {
        defendScore, developScore, economyScore,
        defendGrade: grade(defendScore), developGrade: grade(developScore), economyGrade: grade(economyScore),
        builtCount: built.length, found, totalDiscoveries, tips,
        defense, attack, economy, support,
        kingDownCount: this.kingDownCount || 0
      };
    }

    resultText(won, reward) {
      const a = this.runAssessment ? this.runAssessment(won) : null;
      if (!a) return `${won ? '防衛成功' : '城が陥落しました'}。スコア: ${this.score}。獲得クラウン: ${reward}`;
      const goal = this.stageGoal();
      if (won) {
        return `防衛成功
スコア: ${this.score} / 獲得クラウン: ${reward}
防衛 ${a.defendGrade} / 展開 ${a.developGrade} / 経済 ${a.economyGrade}
施設 ${a.builtCount} / 発見 ${a.found}/${a.totalDiscoveries}
次の改善: ${a.tips[0]}
防衛方針: ${goal.winTip}`;
      }
      const causes = [];
      if (a.defense < 1) causes.push('城前の足止め施設が不足');
      if (a.attack < 1) causes.push('敵を削る火力施設が不足');
      if (a.kingDownCount > 0) causes.push(`主人公が${a.kingDownCount}回倒れ、建設と回収が停止`);
      if (a.economy < 1 && a.found >= 2) causes.push('展開後の経済化が遅れた');
      if (!causes.length) causes.push('防衛線の維持が追いつかなかった');
      const tips = a.tips.slice(0, 3);
      if (!tips.includes(goal.loseTip)) tips.push(goal.loseTip || '城近くの防衛線を見直す。');
      return `城が陥落しました
スコア: ${this.score} / 獲得クラウン: ${reward}
防衛 ${a.defendGrade} / 展開 ${a.developGrade} / 経済 ${a.economyGrade}

主な敗因:
- ${causes.slice(0, 3).join('\n- ')}

次に試すこと:
- ${tips.slice(0, 3).join('\n- ')}

もう一度押すと同じ条件で再挑戦できます。`;
    }

    updateHud() {
      $('hpText').textContent = `${Math.max(0, Math.ceil(this.castle.hp))}/${this.castle.maxHp}`;
      $('coinText').textContent = `${Math.floor(this.king.coins)}`;
      $('kingHpText').textContent = `${Math.ceil(this.king.hp)}/${this.king.maxHp}`;
      $('waveText').textContent = this.tutorialMode && this.tutorial ? `練習 ${this.tutorial.step + 1}/${this.tutorialSteps().length}` : (this.wave.index < 0 ? `0/${this.waves.length}` : `${Math.min(this.wave.index + 1, this.waves.length)}/${this.waves.length}`);
      $('scoreText').textContent = `${this.score}`;
      if ($('popText')) $('popText').textContent = `${this.soldiers.length}/${this.kingdom.popCap}`;
      if ($('territoryText')) $('territoryText').textContent = `${this.kingdom.territory}/${this.kingdom.maxTerritory}`;
      if ($('economyText')) $('economyText').textContent = `${Math.round(this.kingdom.economyBonus * 100)}%`;
      if ($('nextWaveText')) $('nextWaveText').textContent = this.tutorialMode ? this.tutorialInstructionText() : `${this.nextWaveSummary()} / ${this.discoveryCountText()} / ${this.siteStatusText()}`;
      this.updateSetupHud();
      $('pauseButton').textContent = this.paused ? '再開' : '一時停止';
      $('speedButton').textContent = `${this.speed}x`;
      if ($('mobilePauseButton')) $('mobilePauseButton').textContent = this.paused ? '再開' : '一時停止';
      if ($('mobileSpeedButton')) $('mobileSpeedButton').textContent = `${this.speed}x`;
      $('guideText').textContent = (this.notice && this.notice.life > 0) ? this.notice.text : this.message;
    }

    showOverlay(title, text, button, resultType = '', action = null) {
      $('overlayTitle').textContent = title;
      $('overlayText').textContent = text;
      $('startButton').textContent = button;
      if (action !== null) this.overlayAction = action;
      const card = document.querySelector('.overlay-card');
      if (card) {
        card.classList.toggle('is-win', resultType === 'win');
        card.classList.toggle('is-lose', resultType === 'lose');
      }
      $('overlay').classList.remove('is-hidden');
    }

    hideOverlay() {
      const card = document.querySelector('.overlay-card');
      if (card) {
        card.classList.remove('is-win');
        card.classList.remove('is-lose');
      }
      $('overlay').classList.add('is-hidden');
    }


  }


  if (!window.KBD_SYSTEMS) {
    throw new Error('System descriptors are not loaded. Load src/systems/*.js before src/game.js.');
  }
  const SYSTEM_GROUPS = window.KBD_SYSTEMS;
  Object.assign(
    Game.prototype,
    SYSTEM_GROUPS.king || {},
    SYSTEM_GROUPS.wave || {},
    SYSTEM_GROUPS.enemy || {},
    SYSTEM_GROUPS.facility || {},
    SYSTEM_GROUPS.soldier || {},
    SYSTEM_GROUPS.projectile || {},
    SYSTEM_GROUPS.build || {},
    SYSTEM_GROUPS.effect || {},
    SYSTEM_GROUPS.end || {}
  );

  if (!window.KBD_RENDERER_DESCRIPTORS) {
    throw new Error('Renderer descriptors are not loaded. Load src/render/renderers.js before src/game.js.');
  }
  Object.defineProperties(Game.prototype, window.KBD_RENDERER_DESCRIPTORS);

  window.addEventListener('DOMContentLoaded', () => {
    try {
      const game = new Game($('gameCanvas'));
      window.__kingBuilderDefense = game;
    } catch (error) {
      console.error('[Boot Error]', error);
      const overlay = $('overlay');
      const title = $('overlayTitle');
      const text = $('overlayText');
      if (title) title.textContent = '起動エラー';
      if (text) text.textContent = 'ゲームの起動に失敗しました。ページを再読み込みしてください。';
      if (overlay) overlay.classList.remove('is-hidden');
    }
  });
})();

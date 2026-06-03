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
      this.audio = this.loadAudioSettings();
      this.audioContext = null;
      this.masterGain = null;
      this.bgmGain = null;
      this.bgmNodes = [];
      this.sfxCooldown = {};
      this.images = loadGameImages();
      this.resultFx = null;
      this.message = '開始を押してください。';
      this.save = loadSave();
      this.selectedStage = this.save.selectedStage || 'meadow';
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
        attackTimer: 0,
        payBuffer: 0,
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
      this.spriteEffects = [];
      this.deathSprites = [];
      this.facilities = [];
      this.soldiers = [];
      this.pads = this.stagePads().map((p) => ({ ...p, invested: 0, upgradeInvested: 0, facilityId: null, pulse: rand(0, 1000) }));
      this.waves = this.buildStageWaves();
      this.wave = { index: -1, groupIndex: 0, spawnedInGroup: 0, timer: 0, rest: 1800, active: false, done: false, banner: 0 };
      this.score = 0;
      this.shake = 0;
      this.time = 0;
      this.flash = 0;
      this.routeAlert = { text: '', life: 0, route: 'main' };
      this.resultFx = null;
      this.hintTimer = 0;
      this.upgradeChoice = null;
      this.wasPausedBeforeChoice = false;
      this.camera = { x: 0, y: 0, targetX: 0, targetY: 0 };
      this.updateCamera(true);
      this.message = '王を動かし、コインを拾って建設床に投資してください。';
      this.updateHud();
    }

    stageKey() {
      return (this.currentStage && this.currentStage.key) || this.selectedStage || 'meadow';
    }

    stageTheme() {
      return C.stageThemes[this.stageKey()] || C.stageThemes.meadow;
    }

    stagePads() {
      return C.stagePadLayouts[this.stageKey()] || C.pads;
    }

    start() {
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
      this.wave.rest = 800;
      this.hideOverlay();
      this.hideUpgradeOverlay();
      this.closeMobileMenu();
      this.message = '王だけが操作対象です。次の襲撃を見て、必要な床へ先回りしてください。';
      this.updateHud();
    }

    bind() {
      $('startButton').addEventListener('click', () => this.start());
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
        else this.keys.add(k);
      });
      window.addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));

      const setTarget = (e) => {
        if (this.status !== 'playing') return;
        const p = this.screenToCanvas(e.clientX, e.clientY);
        this.pointerTarget = p;
        this.king.targetX = p.x;
        this.king.targetY = p.y;
      };
      this.canvas.addEventListener('pointerdown', (e) => {
        this.canvas.setPointerCapture(e.pointerId);
        setTarget(e);
      });
      this.canvas.addEventListener('pointermove', (e) => {
        if (e.buttons) setTarget(e);
      });
      this.canvas.addEventListener('pointerup', () => {
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
          opt.textContent = `${st.name}${this.save.unlockedStages.includes(key) ? '' : ' - 未解放'}`;
          opt.disabled = !this.save.unlockedStages.includes(key);
          stageSelect.appendChild(opt);
        }
        stageSelect.value = this.save.unlockedStages.includes(this.selectedStage) ? this.selectedStage : 'meadow';
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

    updateSetupHud() {
      if ($('crownText')) $('crownText').textContent = `${this.save.crowns}`;
      if ($('bestText')) {
        const key = `${this.selectedStage}:${this.selectedDifficulty}`;
        const best = this.save.bestScores[key] || 0;
        $('bestText').textContent = best ? `${best}` : '-';
      }
      if ($('stageRuleText')) {
        const st = C.stageThemes[this.selectedStage] || C.stageThemes.meadow;
        $('stageRuleText').textContent = st.rule;
      }
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
      const now = this.audioContext.currentTime;
      const gain = this.audioContext.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.055, now + 1.4);
      gain.connect(this.masterGain);
      const notes = [82.41, 123.47, 164.81];
      this.bgmNodes = notes.map((freq, i) => {
        const osc = this.audioContext.createOscillator();
        osc.type = i === 0 ? 'sine' : 'triangle';
        osc.frequency.value = freq;
        const nodeGain = this.audioContext.createGain();
        nodeGain.gain.value = i === 0 ? 0.62 : 0.22;
        osc.connect(nodeGain);
        nodeGain.connect(gain);
        osc.start(now + i * 0.05);
        return { osc, nodeGain };
      });
      this.bgmGain = gain;
    }

    stopBgm() {
      if (!this.audioContext) return;
      const now = this.audioContext.currentTime;
      if (this.bgmGain) {
        this.bgmGain.gain.cancelScheduledValues(now);
        this.bgmGain.gain.setTargetAtTime(0.0001, now, 0.18);
      }
      for (const node of this.bgmNodes) {
        try { node.osc.stop(now + 0.35); } catch (_) {}
      }
      this.bgmNodes = [];
      this.bgmGain = null;
    }

    playSfx(name, cooldown = 0, force = false) {
      if ((!this.audio.sfx && !force) || !window.AudioContext && !window.webkitAudioContext) return;
      this.unlockAudio();
      if (!this.audioContext || !this.masterGain) return;
      const nowMs = performance.now();
      if (cooldown && this.sfxCooldown[name] && nowMs - this.sfxCooldown[name] < cooldown) return;
      this.sfxCooldown[name] = nowMs;
      const presets = {
        click: [520, 680, 0.055, 0.05, 'sine'],
        start: [220, 420, 0.10, 0.18, 'triangle'],
        pause: [320, 240, 0.07, 0.12, 'sine'],
        resume: [240, 360, 0.07, 0.12, 'sine'],
        wave: [170, 260, 0.12, 0.30, 'sawtooth'],
        boss: [95, 58, 0.18, 0.45, 'sawtooth'],
        clear: [450, 760, 0.12, 0.28, 'triangle'],
        coin: [740, 1120, 0.06, 0.08, 'sine'],
        pay: [310, 250, 0.035, 0.045, 'square'],
        build: [360, 620, 0.13, 0.22, 'triangle'],
        upgrade: [520, 900, 0.14, 0.25, 'triangle'],
        castleHit: [110, 70, 0.16, 0.20, 'sawtooth'],
        kingHit: [180, 110, 0.13, 0.15, 'square'],
        stun: [120, 55, 0.18, 0.45, 'sawtooth'],
        enemyDown: [280, 160, 0.05, 0.06, 'triangle'],
        bossDown: [260, 90, 0.20, 0.55, 'sawtooth'],
        victory: [420, 880, 0.18, 0.75, 'triangle'],
        defeat: [155, 58, 0.20, 0.90, 'sawtooth']
      };
      const p = presets[name] || presets.click;
      const now = this.audioContext.currentTime;
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      osc.type = p[4];
      osc.frequency.setValueAtTime(p[0], now);
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, p[1]), now + p[3]);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(p[2], now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + p[3]);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + p[3] + 0.05);
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
      const rawDt = Math.min(50, t - this.last);
      this.last = t;
      const dt = rawDt * (this.status === 'playing' && !this.paused ? this.speed : 1);
      if (this.status === 'playing' && !this.paused) this.update(dt);
      this.render();
      requestAnimationFrame((n) => this.loop(n));
    }

    update(dt) {
      this.time += dt;
      this.flash = Math.max(0, this.flash - dt);
      this.shake = Math.max(0, this.shake - dt);
      this.castle.hit = Math.max(0, this.castle.hit - dt);
      this.wave.banner = Math.max(0, this.wave.banner - dt);
      this.routeAlert.life = Math.max(0, this.routeAlert.life - dt);
      this.king.invuln = Math.max(0, this.king.invuln - dt);
      this.king.stunned = Math.max(0, this.king.stunned - dt);

      this.updateKing(dt);
      this.updateCamera();
      this.updateWave(dt);
      this.updateEnemies(dt);
      this.updateFacilities(dt);
      this.updateSoldiers(dt);
      this.updateProjectiles(dt);
      this.updateCoins(dt);
      this.updateBuildPayments(dt);
      this.updateContextHint(dt);
      this.updateEffects(dt);
      this.checkEnd();
      this.updateHud();
    }

    updateContextHint(dt) {
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
        if (living >= 12) this.message = `敵が${living}体います。王を危険地帯に置きすぎず、防衛床へ投資してください。`;
      }
    }

    nextWaveSummary() {
      if (!this.waves || !this.waves.length) return '-';
      if (this.wave.done) return '襲撃完了';
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
      const routeText = wave.groups.some((g) => g.route === 'side') && wave.groups.some((g) => (g.route || 'main') === 'main') ? '二方向' : (wave.groups.some((g) => g.route === 'side') ? labels.side : labels.main);
      const rest = this.wave.active ? '進行中' : `あと${Math.ceil(Math.max(0, this.wave.rest) / 1000)}秒`;
      return `${nextIndex + 1}/${this.waves.length} ${wave.title}｜${routeText}｜${major}｜${rest}`;
    }

    activePadHint() {
      let nearest = null;
      let best = 64;
      for (const pad of this.pads) {
        const d = distXY(this.king.x, this.king.y, pad.x, pad.y);
        if (d < best) { nearest = pad; best = d; }
      }
      if (!nearest) return '';
      const def = C.facilityTypes[nearest.type];
      const existing = nearest.facilityId ? this.facilities.find((f) => f.id === nearest.facilityId) : null;
      if (!this.isPadUnlocked(nearest)) return `${def.name}: 領土${nearest.territory}が必要。前哨基地で領土を広げる。`;
      if (!existing) {
        const remain = Math.max(0, Math.ceil(def.cost - nearest.invested));
        return `${def.name}: 残り${remain}コインで建設。${def.desc || ''}`;
      }
      if (existing.level >= 3) return `${def.name}: 最大レベル。別の床へ向かう。`;
      const need = this.getUpgradeNeed(existing);
      const remain = Math.max(0, Math.ceil(need - nearest.upgradeInvested));
      return `${def.name} Lv.${existing.level}: 残り${remain}コインで強化。`;
    }

    updateHud() {
      $('hpText').textContent = `${Math.max(0, Math.ceil(this.castle.hp))}/${this.castle.maxHp}`;
      $('coinText').textContent = `${Math.floor(this.king.coins)}`;
      $('kingHpText').textContent = `${Math.ceil(this.king.hp)}/${this.king.maxHp}`;
      $('waveText').textContent = this.wave.index < 0 ? `0/${this.waves.length}` : `${Math.min(this.wave.index + 1, this.waves.length)}/${this.waves.length}`;
      $('scoreText').textContent = `${this.score}`;
      if ($('popText')) $('popText').textContent = `${this.soldiers.length}/${this.kingdom.popCap}`;
      if ($('territoryText')) $('territoryText').textContent = `${this.kingdom.territory}/${this.kingdom.maxTerritory}`;
      if ($('economyText')) $('economyText').textContent = `${Math.round(this.kingdom.economyBonus * 100)}%`;
      if ($('nextWaveText')) $('nextWaveText').textContent = this.nextWaveSummary();
      this.updateSetupHud();
      $('pauseButton').textContent = this.paused ? '再開' : '一時停止';
      $('speedButton').textContent = `${this.speed}x`;
      if ($('mobilePauseButton')) $('mobilePauseButton').textContent = this.paused ? '再開' : '一時停止';
      if ($('mobileSpeedButton')) $('mobileSpeedButton').textContent = `${this.speed}x`;
      $('guideText').textContent = this.message;
    }

    showOverlay(title, text, button, resultType = '') {
      $('overlayTitle').textContent = title;
      $('overlayText').textContent = text;
      $('startButton').textContent = button;
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
    const game = new Game($('gameCanvas'));
    window.__kingBuilderDefense = game;
  });
})();

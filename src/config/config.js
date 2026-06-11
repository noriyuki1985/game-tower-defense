/*
 * Grouped JS file generated in v3.2.2.
 * Behavior should remain identical; only file grouping/script loading changed.
 */


/* ===== src/config/game-data.js ===== */

(function () {
  'use strict';

  const C = {
    w: 480,
    h: 800,
    castle: { x: 136, y: 194, hp: 390, r: 38 },
    kingStart: { x: 244, y: 666 },
    startCoins: 180,
    coinPickupRange: 42,
    kingSpeed: 202,
    payRate: 112,
    buildHoldTime: 620,
    maxCoinsOnGround: 95,
    saveKey: 'game-tower-defense-v124-save',
    audioKey: 'game-tower-defense-v124-audio',
    path: [
      { x: 24, y: 762 },
      { x: 66, y: 704 },
      { x: 104, y: 645 },
      { x: 166, y: 596 },
      { x: 255, y: 552 },
      { x: 348, y: 485 },
      { x: 382, y: 406 },
      { x: 327, y: 338 },
      { x: 244, y: 282 },
      { x: 174, y: 230 },
      { x: 144, y: 203 }
    ],
    sidePath: [
      { x: 456, y: 770 },
      { x: 418, y: 706 },
      { x: 391, y: 640 },
      { x: 331, y: 590 },
      { x: 253, y: 536 },
      { x: 203, y: 468 },
      { x: 196, y: 392 },
      { x: 215, y: 320 },
      { x: 174, y: 246 },
      { x: 144, y: 203 }
    ],
    enemyTypes: {
      grunt: { name: '雑兵', hp: 34, speed: 48, damage: 8, coin: 5, score: 8, color: '#d8322f', r: 11, kingDamage: 8 },
      runner: { name: '走り兵', hp: 24, speed: 82, damage: 6, coin: 5, score: 10, color: '#ff5548', r: 9, kingDamage: 7 },
      brute: { name: '重兵', hp: 118, speed: 31, damage: 18, coin: 13, score: 25, color: '#a71f20', r: 15, kingDamage: 16 },
      shield: { name: '盾兵', hp: 78, speed: 40, damage: 11, coin: 10, score: 20, color: '#c92c40', r: 12, armor: 0.45, kingDamage: 12 },
      saboteur: { name: '破壊兵', hp: 42, speed: 61, damage: 14, coin: 8, score: 18, color: '#eb6b2c', r: 10, kingDamage: 13, targetFacility: true },
      bomber: { name: '爆弾兵', hp: 54, speed: 47, damage: 24, coin: 12, score: 26, color: '#f06b2f', r: 12, kingDamage: 18, explode: true, explodeRadius: 58 },
      shaman: { name: '呪術兵', hp: 86, speed: 34, damage: 7, coin: 15, score: 34, color: '#8d43c7', r: 13, kingDamage: 10, healAura: 66, healRate: 9 },
      siege: { name: '破城槌', hp: 210, speed: 23, damage: 35, coin: 22, score: 55, color: '#7f3426', r: 18, armor: 0.12, kingDamage: 22, siege: true },
      warlord: { name: '将軍', hp: 620, speed: 24, damage: 36, coin: 82, score: 160, color: '#7e151b', r: 24, armor: 0.18, kingDamage: 28, boss: true, aura: 72 },
      overlord: { name: '大将軍', hp: 980, speed: 20, damage: 52, coin: 135, score: 260, color: '#541016', r: 29, armor: 0.26, kingDamage: 36, boss: true, aura: 92, siege: true }
    },
    facilityTypes: {
      palisade: {
        name: '柵', cost: 34, upgradeCost: 46, hp: 440, range: 46, block: true, blockArmor: 0.18,
        color: '#8a5b35', accent: '#7fb7ff', desc: '最安の足止め施設。敵を止めて火力施設の攻撃時間を作る。',
        options: []
      },
      archer: {
        name: '弓塔', cost: 70, upgradeCost: 72, hp: 145, range: 198, cooldown: 560, damage: 20,
        projectile: '#f3d57b', color: '#9c7041', accent: '#7fb7ff', desc: '長射程の安定火力。走り兵や単体敵を早めに削る。',
        options: []
      },
      cannon: {
        name: '大砲', cost: 142, upgradeCost: 128, hp: 175, range: 142, cooldown: 1420, damage: 56, splash: 82,
        projectile: '#ffb25c', color: '#646c76', accent: '#7fb7ff', desc: '遅いが強い範囲火力。合流地点の群れをまとめて削る。',
        options: []
      },
      barracks: {
        name: '兵舎', cost: 88, upgradeCost: 86, hp: 210, range: 144, spawn: true, spawnTime: 3200, soldierCap: 2,
        color: '#7e6d52', accent: '#7fb7ff', desc: '兵士で前線を維持する支援施設。側道や複数ルートに強い。',
        options: []
      },
      mine: {
        name: '金鉱', cost: 116, upgradeCost: 108, hp: 125, economy: true, incomeTime: 3600, income: 13,
        color: '#8c7332', accent: '#7fb7ff', desc: '防衛力を直接増やさない経済施設。早期投資ほど後半が楽になる。',
        options: []
      }
    },
    waves: [
      { title: '先遣隊の接近', note: '主街道から軽い敵が来る。城前の柵と弓塔で基本の防衛線を作る。', groups: [
        { type: 'grunt', count: 9, gap: 430, route: 'main' }
      ] },
      { title: '左側道の小隊', note: '左側道から少数の敵が来る。兵舎を左側道の脇に置くと守りやすい。', groups: [
        { type: 'grunt', count: 11, gap: 360, route: 'main' },
        { type: 'runner', count: 5, gap: 520, route: 'left' }
      ] },
      { title: '右迂回の圧力', note: '右迂回路から走り兵が来る。金鉱へ投資しすぎると対応が遅れる。', groups: [
        { type: 'runner', count: 8, gap: 410, route: 'side' },
        { type: 'grunt', count: 12, gap: 320, route: 'main' }
      ] },
      { title: '合流地点の乱戦', note: '主街道と右迂回が合流する。大砲が最も活きる進軍。', groups: [
        { type: 'grunt', count: 18, gap: 245, route: 'main' },
        { type: 'runner', count: 8, gap: 340, route: 'side' },
        { type: 'shield', count: 4, gap: 620, route: 'main' }
      ] },
      { title: '前線破壊部隊', note: '破壊兵と爆弾兵が防衛線を崩しに来る。柵で止め、大砲と弓塔で削る。', groups: [
        { type: 'saboteur', count: 6, gap: 520, route: 'left' },
        { type: 'bomber', count: 4, gap: 720, route: 'main' },
        { type: 'grunt', count: 16, gap: 255, route: 'side' }
      ] },
      { title: '硬い敵の本隊', note: '盾兵と重兵が前線を押す。城前だけでなく合流地点で削る。', groups: [
        { type: 'shield', count: 10, gap: 470, route: 'main' },
        { type: 'brute', count: 6, gap: 760, route: 'side' },
        { type: 'runner', count: 10, gap: 300, route: 'left' }
      ] },
      { title: '三路同時進軍', note: '主街道・左側道・右迂回が同時に動く。主人公をどこへ走らせるかが勝敗を分ける。', groups: [
        { type: 'grunt', count: 15, gap: 260, route: 'main' },
        { type: 'runner', count: 10, gap: 280, route: 'left' },
        { type: 'shield', count: 7, gap: 470, route: 'side' },
        { type: 'shaman', count: 2, gap: 860, route: 'side' }
      ] },
      { title: '防衛都市包囲戦', note: '敵将が主街道を進み、左右から別働隊が迫る最終進軍。', boss: true, groups: [
        { type: 'siege', count: 2, gap: 1100, route: 'main' },
        { type: 'runner', count: 16, gap: 230, route: 'left' },
        { type: 'bomber', count: 6, gap: 640, route: 'side' },
        { type: 'shield', count: 10, gap: 370, route: 'main' },
        { type: 'warlord', count: 1, gap: 1100, route: 'main' }
      ] }
    ],
    
stages: {
  meadow: { key: 'meadow', order: 0, name: '防衛都市前線', desc: '国境の防衛都市へ続く主街道・左側道・右迂回を守る作り込み用メインマップ。', waveCount: 8, castleHp: 420, startCoinsBonus: 0, enemyHp: 1.0, enemyDamage: 1.0, enemySpeed: 1.0, crownBase: 6, next: 'crossroads' },
  crossroads: { key: 'crossroads', order: 1, name: '分岐路の前線', desc: '背景パーツ化とマップ別差し替え確認のための仮マップ。草地・柵・木箱・霧表現を同じ部品で再構成した検証用ステージ。', waveCount: 8, castleHp: 430, startCoinsBonus: 15, enemyHp: 1.04, enemyDamage: 1.02, enemySpeed: 1.03, crownBase: 7, next: 'ridge' },
  ridge: { key: 'ridge', order: 2, name: '高台の前線', desc: 'ridge専用の岩・崖・高台パーツを追加した高台ステージ。中央坂道・左崖道・右斜面路の3ルートを、専用差分でより見分けやすく確認できる。', waveCount: 8, castleHp: 440, startCoinsBonus: 24, enemyHp: 1.08, enemyDamage: 1.05, enemySpeed: 1.04, crownBase: 8, next: null }
},
    difficulties: {
      normal: { key: 'normal', name: 'ふつう', enemyHp: 1, enemyDamage: 1, enemySpeed: 1, startCoins: 1, crownMult: 1, scoreMult: 1 },
      hard: { key: 'hard', name: 'むずかしい', enemyHp: 1.18, enemyDamage: 1.15, enemySpeed: 1.05, startCoins: 0.92, crownMult: 1.55, scoreMult: 1.25 },
      nightmare: { key: 'nightmare', name: '悪夢', enemyHp: 1.42, enemyDamage: 1.32, enemySpeed: 1.10, startCoins: 0.84, crownMult: 2.35, scoreMult: 1.55 }
    },
    metaUpgrades: {
      startingCoins: { name: '辺境金庫', desc: 'レベルごとに初期コイン +25。', max: 5, baseCost: 2 },
      kingTraining: { name: '主人公の鍛錬', desc: 'レベルごとに主人公の最大HP +12。', max: 5, baseCost: 2 },
      castleMasonry: { name: '防衛都市補強', desc: 'レベルごとに城の最大HP +50。', max: 5, baseCost: 3 },
      builderDiscipline: { name: '建設訓練', desc: 'レベルごとに投資速度 +8%。', max: 5, baseCost: 3 },
      tradeCharter: { name: '交易許可', desc: 'レベルごとにコイン効率 +7%。', max: 5, baseCost: 3 },
      troopDrill: { name: '兵士訓練', desc: 'レベルごとに兵士性能 +6%。', max: 5, baseCost: 4 }
    },
    pads: [
      { id: 'p1', type: 'palisade', x: 238, y: 530 },
      { id: 'p2', type: 'archer', x: 188, y: 560 },
      { id: 'p3', type: 'archer', x: 286, y: 514 },
      { id: 'p4', type: 'barracks', x: 116, y: 558 },
      { id: 'p5', type: 'mine', x: 420, y: 700 },
      { id: 'p6', type: 'palisade', x: 205, y: 405 },
      { id: 'p7', type: 'cannon', x: 306, y: 486 },
      { id: 'p8', type: 'archer', x: 150, y: 360 },
      { id: 'p9', type: 'barracks', x: 182, y: 506 },
      { id: 'p10', type: 'cannon', x: 250, y: 372 },
      { id: 'p11', type: 'palisade', x: 160, y: 276 },
      { id: 'p12', type: 'archer', x: 226, y: 300 },
      { id: 'p13', type: 'mine', x: 386, y: 742, requiresDiscovery: 'meadow_mine' },
      { id: 'p14', type: 'cannon', x: 338, y: 552, requiresDiscovery: 'meadow_mine' }
    ]
  };


  
C.stageGoals = {
  meadow: {
    title: '防衛都市前線',
    intro: '防衛都市前線は、国境の防衛都市へ敵軍が迫る標準防衛マップ。まず城前を守り、次に合流地点・左側道・右下の金鉱へ判断を広げる。',
    opening: '序盤は弓塔と柵で城前を固める。余裕が出たら右下の金鉱を取りに行く。ただし右迂回路が近く、欲張ると前線対応が遅れる。',
    winTip: '合流地点に大砲、左側道に兵舎、城前に柵と弓塔を置けると安定する。金鉱は早いほど得だが、守りを薄くしすぎない。',
    loseTip: '城前だけに寄せすぎると左右同時進軍で崩れる。合流地点に大砲、左側道に兵舎を置き、主人公は危険な側へ走る。'
  },
  crossroads: {
    title: '分岐路の前線',
    intro: '分岐路の前線は、背景パーツを使った差し替え検証用ステージ。主街道・左丘・右林道の3方向が少し早めに合流する。',
    opening: '中央の主街道だけでなく、左丘ルートと右林道の寄り方を早めに確認する。建設床は近いが、分岐の見落としに注意。',
    winTip: '中央合流点へ大砲、左右分岐へ弓塔か兵舎を散らすと安定しやすい。同じ背景パーツでも奥行きが違って見えるかを確認する。',
    loseTip: '中央に寄せすぎると左右の分岐で押し込まれる。背景の見やすさ確認も兼ねて、左右の床を早めに使って比較する。'
  },
  ridge: {
    title: '高台の前線',
    intro: '高台の前線は、同じ背景パーツを使いながら岩場寄りの雰囲気へ並べ替えた新マップ。中央坂道・左崖道・右斜面路の3ルートがやや縦長に重なる。',
    opening: '主戦場は中央坂道。左崖道は早めに兵舎で押さえ、右斜面路は金脈解放とあわせて大砲配置を試す。',
    winTip: '中央坂の折り返しに大砲、左崖道に兵舎、城前に柵を置くと安定しやすい。新マップでも背景パーツの見え方が崩れないかを確認する。',
    loseTip: '中央だけを見ると左崖道から抜けられやすい。右斜面路の金脈を急ぎすぎると中央対応が遅れるため、主戦場の足止めを先に整える。'
  }
};

  C.balance = {
    waveRest: 5400,
    firstWaveRest: 1800,
    raidSuppression: 0.88,
    recommendationRadius: 136,
    kingRegenPerSecond: 2.8,
    kingDownStunMs: 5000,
    kingReviveHpRatio: 0.10,
    kingReviveInvulnMs: 2000
  };


  C.activeFacilityTypes = Object.freeze(['palisade', 'archer', 'cannon', 'barracks', 'mine']);
  C.levelColors = {
    1: '#4da3ff',
    2: '#57c66b',
    3: '#f0c94a',
    4: '#e45858'
  };
  C.levelColorNames = {
    1: '青',
    2: '緑',
    3: '黄',
    4: '赤'
  };

  
C.stageThemes = {
  meadow: {
    name: '防衛都市前線', rule: '主街道・左側道・右迂回が合流する。城前と合流地点の二段防衛が重要。',
    bgTop: '#55aa63', bgMid: '#348a52', bgBottom: '#256443',
    blob: 'rgba(27, 76, 55, 0.55)', tree: '#1f6348', treeTop: '#2b7956',
    roadOuter: '#e1c693', roadInner: '#c79e68', water: 'rgba(34,64,100,0.28)',
    object: 'tree'
  },
  crossroads: {
    name: '分岐路の前線', rule: '同じ部品を並べ替え、主街道・左丘・右林道の見え方を比較する背景差し替えテスト。',
    bgTop: '#7cb182', bgMid: '#5a8e66', bgBottom: '#436654',
    blob: 'rgba(36, 66, 48, 0.34)', tree: '#3f7455', treeTop: '#5f9a73',
    roadOuter: '#d9c198', roadInner: '#b98b60', water: 'rgba(60,83,112,0.18)',
    object: 'tree'
  },
  ridge: {
    name: '高台の前線', rule: '背景パーツを岩場寄りに並べ替え、中央坂道・左崖道・右斜面路の見え方を比較する新マップ。',
    bgTop: '#95a68d', bgMid: '#77866f', bgBottom: '#596457',
    blob: 'rgba(44, 54, 42, 0.28)', tree: '#47624b', treeTop: '#6c8d6c',
    roadOuter: '#d8c39c', roadInner: '#b6895e', water: 'rgba(52,69,94,0.14)',
    object: 'tree'
  }
};

C.stageUiMeta = {
  meadow: {
    stageType: '本番候補',
    stageTypeKey: 'candidate',
    difficultyLabel: '標準',
    difficultyRank: 1,
    routeCount: 3,
    routeNames: ['主街道', '左側道', '右迂回'],
    recommendedFacilities: ['柵', '弓塔', '大砲'],
    recommendedFacilityKeys: ['palisade', 'archer', 'cannon'],
    purpose: '基準マップ。城前と合流地点の二段防衛を確認する。',
    summary: '標準的な三方向マップ。防衛線・火力・経済の基本判断を見る。'
  },
  crossroads: {
    stageType: '背景テスト',
    stageTypeKey: 'background-test',
    difficultyLabel: 'やや高い',
    difficultyRank: 2,
    routeCount: 3,
    routeNames: ['中央街道', '左丘ルート', '右林道'],
    recommendedFacilities: ['大砲', '弓塔', '兵舎'],
    recommendedFacilityKeys: ['cannon', 'archer', 'barracks'],
    purpose: '背景パーツ差し替え検証用。既存パーツを並べ替えた時の視認性を見る。',
    summary: '分岐が早く、左右の寄り方を見落としやすいテストマップ。'
  },
  ridge: {
    stageType: '本番候補',
    stageTypeKey: 'candidate',
    difficultyLabel: '高め',
    difficultyRank: 3,
    routeCount: 3,
    routeNames: ['中央坂道', '左崖道', '右斜面路'],
    recommendedFacilities: ['柵', '大砲', '兵舎'],
    recommendedFacilityKeys: ['palisade', 'cannon', 'barracks'],
    purpose: '高台・岩場差分の本番候補。専用背景パーツと防衛導線の相性を見る。',
    summary: '縦長の三方向マップ。中央坂を止めつつ、左崖道を兵舎で支える。'
  }
};

  C.backgroundLayerOrder = Object.freeze([
    'base',
    'path',
    'buildPad',
    'decorationBack',
    'decorationFront',
    'atmosphere',
    'labels'
  ]);

  
C.stageBackgrounds = {
  meadow: {
    id: 'meadow',
    mode: 'rough-image',
    themeKey: 'meadow',
    note: 'v3.10.2 keeps the tuned rough meadow background and adds image-based background parts as overlays so the reusable part pipeline can be previewed on the main stage as well.',
    depthProfile: 'rough-meadow-depth',
    layers: {
      base: {
        kind: 'rough-base-image',
        assetKey: 'bgMeadowRoughBase',
        textureAsset: 'tileGrassMeadow',
        textureFallback: 'tileGrass',
        textureAlpha: 0.00,
        hideTexture: true,
        useParts: true
      },
      path: {
        kind: 'rough-path-image',
        assetKey: 'bgMeadowRoughPath',
        hideRuntimeLines: true,
        visibilityGuide: true,
        guideOuterWidth: 60,
        guideInnerWidth: 38,
        guideCenterWidth: 2,
        guideOuterColor: 'rgba(50, 40, 26, 0.05)',
        guideInnerColor: 'rgba(255, 231, 169, 0.035)',
        guideCenterColor: 'rgba(31, 77, 52, 0.10)',
        outerWidth: 56,
        innerWidth: 40,
        detailWidth: 2
      },
      buildPad: {
        kind: 'runtime-pads',
        owner: 'drawPads',
        note: 'Build pads are intentionally rendered above the world background so future backgrounds do not hide them.'
      },
      decorationBack: {
        kind: 'rough-decoration-back-image',
        assetKey: 'bgMeadowRoughDecorationBack',
        hideProcedural: true,
        alpha: 0.78,
        minCount: 28,
        densityBase: 24,
        avoidPathDistance: 62,
        avoidPadDistance: 72,
        avoidCastleDistance: 108,
        useParts: true
      },
      decorationFront: {
        kind: 'rough-decoration-front-image',
        assetKey: 'bgMeadowRoughDecorationFront',
        hideProcedural: true,
        alpha: 0.64,
        edgeHeight: 0,
        waterBlob: false,
        safeBottomMargin: 84,
        useParts: true
      },
      atmosphere: {
        kind: 'rough-atmosphere-image',
        assetKey: 'bgMeadowRoughAtmosphere',
        alpha: 0.52,
        useParts: true
      },
      labels: {
        kind: 'runtime-labels',
        visible: true,
        alpha: 0.92
      }
    }
  },
  crossroads: {
    id: 'crossroads',
    mode: 'parts-composite',
    themeKey: 'crossroads',
    partsLayoutKey: 'crossroads',
    note: 'v3.10.2 background part test stage. Reuses the same image-based part mini set across ground, route, prop, shadow, and atmosphere layers to prove stage-specific swapping.',
    depthProfile: 'parts-crossroads-depth',
    layers: {
      base: { kind: 'part-base-layer', useParts: true },
      path: { kind: 'part-path-layer', useParts: true, visibilityGuide: true, guideOuterWidth: 58, guideInnerWidth: 36, guideCenterWidth: 2 },
      buildPad: { kind: 'runtime-pads', owner: 'drawPads' },
      decorationBack: { kind: 'part-decoration-back', useParts: true, alpha: 0.94 },
      decorationFront: { kind: 'part-decoration-front', useParts: true, alpha: 0.82, safeBottomMargin: 86 },
      atmosphere: { kind: 'part-atmosphere', useParts: true, alpha: 1 },
      labels: { kind: 'runtime-labels', visible: true, alpha: 0.88 }
    }
  },
  ridge: {
    id: 'ridge',
    mode: 'parts-composite',
    themeKey: 'ridge',
    partsLayoutKey: 'ridge',
    note: 'v3.11.0 new stage test. Reuses the same part set in a more rocky and high-ground composition to verify that stage ID based background switching stays stable beyond meadow and crossroads.',
    depthProfile: 'parts-ridge-depth',
    layers: {
      base: { kind: 'part-base-layer', useParts: true },
      path: { kind: 'part-path-layer', useParts: true, visibilityGuide: true, guideOuterWidth: 56, guideInnerWidth: 34, guideCenterWidth: 2 },
      buildPad: { kind: 'runtime-pads', owner: 'drawPads' },
      decorationBack: { kind: 'part-decoration-back', useParts: true, alpha: 0.92 },
      decorationFront: { kind: 'part-decoration-front', useParts: true, alpha: 0.80, safeBottomMargin: 88 },
      atmosphere: { kind: 'part-atmosphere', useParts: true, alpha: 1 },
      labels: { kind: 'runtime-labels', visible: true, alpha: 0.88 }
    }
  },
  tutorial: {
    id: 'tutorial',
    mode: 'procedural',
    themeKey: 'meadow',
    inherits: 'meadow',
    layers: {}
  }
};



  
C.backgroundStyleGuide = {
  activeProfile: 'soft-toon-stage-system-v124',
  priority: ['playability', 'sprite-readability', 'depth-order', 'soft-toon-fit', 'background-detail'],
  notes: [
    'The rough meadow background is still validation art, not final art.',
    'Use soft outlines and rounded props so the background fits the current character and building assets.',
    'Keep path, pads, enemies, allies, and facilities clearer than decorative elements.',
    'Do not increase small-object density until gameplay visibility is confirmed.',
    'Reusable background parts should prefer broad readable shapes over dense detail.'
  ]
};

  C.backgroundDebug = {
    defaultEnabled: false,
    toggleKey: 'b',
    labelToggleKey: 'n',
    overlayAlpha: 0.16,
    labelAlpha: 0.86,
    layers: {
      base: { label: 'base / 地面', color: 'rgba(87, 198, 107, 0.28)' },
      path: { label: 'path / 敵ルート', color: 'rgba(255, 211, 91, 0.42)' },
      buildPad: { label: 'buildPad / 建設床', color: 'rgba(127, 183, 255, 0.45)' },
      decorationBack: { label: 'decorationBack / 背面装飾', color: 'rgba(146, 219, 170, 0.34)' },
      decorationFront: { label: 'decorationFront / 前面装飾', color: 'rgba(255, 139, 94, 0.34)' },
      atmosphere: { label: 'atmosphere / 空気感', color: 'rgba(176, 137, 255, 0.30)' },
      labels: { label: 'labels / 地形表示', color: 'rgba(255, 246, 170, 0.42)' }
    }
  };


  C.backgroundPartDebug = {
    defaultEnabled: false,
    toggleKey: 'p',
    labelToggleKey: 'n',
    overlayAlpha: 0.82,
    labelAlpha: 0.92,
    anchorRadius: 4,
    boundsColor: 'rgba(79, 213, 255, 0.78)',
    routeColor: 'rgba(255, 221, 91, 0.82)',
    warningColor: 'rgba(255, 88, 88, 0.92)',
    showHud: true,
    showWarnings: true,
    layers: {
      base: { label: 'base parts', color: 'rgba(87, 198, 107, 0.86)' },
      path: { label: 'path parts', color: 'rgba(255, 211, 91, 0.90)' },
      decorationBack: { label: 'back props', color: 'rgba(93, 211, 150, 0.90)' },
      decorationFront: { label: 'front props', color: 'rgba(255, 139, 94, 0.90)' },
      atmosphere: { label: 'atmosphere parts', color: 'rgba(176, 137, 255, 0.86)' }
    }
  };


  
C.padVisibility = {
  backgroundHalo: true,
  shadowColor: 'rgba(4, 10, 8, 0.22)',
  haloColor: 'rgba(255, 241, 184, 0.16)',
  lockedHaloColor: 'rgba(170, 178, 168, 0.12)',
  borderAlpha: 0.40,
  nearHaloBoost: 0.10,
  note: 'v3.11.1: build pad halo/border visibility tuned after adding the ridge stage.'
};

C.facilityGroundPlate = {
  enabled: true,
  shadowAlpha: 0.24,
  haloAlpha: 0.13,
  borderAlpha: 0.22,
  yOffset: 19,
  radiusX: 33,
  radiusY: 13
};

C.stagePlacementTuning = {
  ridge: {
    note: 'v3.11.1: ridge pads and discovery points were moved away from route stamps and heavy scenery clusters.',
    padFocus: ['r1', 'r6', 'r7', 'r13', 'r14'],
    discoveryFocus: ['ridge_cache', 'ridge_mine']
  }
};

C.backgroundDepthGuide = {
  rough: {
    decorationBackAlpha: 0.78,
    decorationFrontAlpha: 0.64,
    atmosphereAlpha: 0.52
  },
  parts: {
    decorationBackAlpha: 0.94,
    decorationFrontAlpha: 0.82,
    atmosphereAlpha: 1
  }
};

C.backgroundPartCatalog = {
  groundPatch: { kind: 'patch', assetKey: 'partDirtPatchSoft01', w: 176, h: 122, color: 'rgba(236, 224, 171, 0.10)', textureAsset: 'tileDirtMeadow', textureAlpha: 0.05 },
  groundPatchAlt: { kind: 'patch', assetKey: 'partDirtPatchSoft02', w: 164, h: 114, color: 'rgba(236, 224, 171, 0.10)', textureAsset: 'tileDirtMeadow', textureAlpha: 0.05 },
  grassPatch: { kind: 'patch', assetKey: 'partGrassPatchSoft01', w: 196, h: 128, color: 'rgba(132, 184, 124, 0.12)', textureAsset: 'tileGrassMeadow', textureAlpha: 0.05 },
  roadRibbon: { kind: 'routeRibbon', assetStraightKey: 'partRoadStraightSoft01', assetCurveKey: 'partRoadCurveSoft01', outerColor: '#d9c198', innerColor: '#b98b60', detailColor: 'rgba(96, 66, 42, 0.14)', outerWidth: 50, innerWidth: 34, detailWidth: 1.5 },
  softTree: { kind: 'tree', assetKey: 'partTreeRoundSoft01', width: 86, height: 98, scale: 0.84 },
  softRock: { kind: 'rock', assetKey: 'partRockClusterSoft01', width: 66, height: 56, scale: 0.78 },
  grassTuft: { kind: 'reed', scale: 0.76 },
  fence: { kind: 'fence', assetKey: 'partFenceWoodSoft01', width: 104, height: 36, postColor: '#76593e', railColor: '#9f7c57' },
  crate: { kind: 'crate', assetKey: 'partCrateWoodSoft01', width: 24, height: 24, fill: '#a97a4b', edge: '#6f4f33' },
  shadowBlob: { kind: 'shadow', assetKey: 'partShadowBlobSoft01', color: 'rgba(16, 24, 18, 0.08)', radiusX: 60, radiusY: 20 },
  mistVeil: { kind: 'overlay', assetKey: 'partMistVeilSoft01', style: 'mist', colorTop: 'rgba(255,255,255,0.03)', colorBottom: 'rgba(205,224,214,0.08)' },
  vignetteSoft: { kind: 'overlay', style: 'vignette', colorTop: 'rgba(10,16,14,0.00)', colorBottom: 'rgba(10,16,14,0.12)' },
  ridgeGroundPatch: { kind: 'patch', assetKey: 'partRidgeGroundRocky01', w: 208, h: 208, color: 'rgba(186, 152, 109, 0.08)' },
  ridgeCliffSegment: { kind: 'patch', assetKey: 'partRidgeCliffEdge01', w: 248, h: 164, color: 'rgba(132, 118, 98, 0.06)' },
  ridgeRockCluster: { kind: 'rock', assetKey: 'partRidgeRockCluster01', width: 122, height: 122, scale: 0.88 },
  ridgePlateau: { kind: 'patch', assetKey: 'partRidgePlateau01', w: 212, h: 212, color: 'rgba(172, 196, 116, 0.06)' },
  ridgeGrassClump: { kind: 'patch', assetKey: 'partRidgeGrassClump01', w: 96, h: 96, color: 'rgba(170, 188, 96, 0.06)' }
};

C.backgroundPartPresets = {
  rockyBackCluster: [
    { part: 'softRock', dx: -28, dy: -8, scale: 0.80, alpha: 0.92, label: 'preset-rock-a' },
    { part: 'softRock', dx: 30, dy: 16, scale: 0.66, alpha: 0.86, label: 'preset-rock-b' },
    { part: 'grassTuft', dx: 2, dy: 42, scale: 0.70, alpha: 0.50, label: 'preset-rock-grass' }
  ],
  forestEdgeCluster: [
    { part: 'softTree', dx: -24, dy: 0, scale: 0.82, alpha: 0.86, label: 'preset-tree-a' },
    { part: 'softTree', dx: 26, dy: 18, scale: 0.72, alpha: 0.78, label: 'preset-tree-b' },
    { part: 'softRock', dx: 8, dy: 48, scale: 0.56, alpha: 0.74, label: 'preset-edge-rock' }
  ],
  supplyFrontCluster: [
    { part: 'fence', dx: -26, dy: 0, width: 96, alpha: 0.36, label: 'preset-fence' },
    { part: 'crate', dx: 36, dy: -4, alpha: 0.76, label: 'preset-crate-a' },
    { part: 'crate', dx: 54, dy: 13, alpha: 0.58, label: 'preset-crate-b' }
  ],
  softMistSet: [
    { part: 'mistVeil', alpha: 0.52, label: 'preset-mist' },
    { part: 'vignetteSoft', alpha: 0.82, label: 'preset-vignette' }
  ],
  ridgeUpperShelf: [
    { part: 'ridgeCliffSegment', dx: 0, dy: 0, w: 228, h: 152, alpha: 0.88, label: 'ridge-cliff' },
    { part: 'ridgeRockCluster', dx: -66, dy: 22, scale: 0.74, alpha: 0.84, label: 'ridge-cliff-rock-a' },
    { part: 'ridgeRockCluster', dx: 72, dy: 30, scale: 0.60, alpha: 0.78, label: 'ridge-cliff-rock-b' },
    { part: 'ridgeGrassClump', dx: 54, dy: -12, w: 84, h: 84, alpha: 0.50, label: 'ridge-cliff-grass' }
  ],
  ridgePlateauNook: [
    { part: 'ridgePlateau', dx: 0, dy: 0, w: 194, h: 194, alpha: 0.54, label: 'ridge-plateau' },
    { part: 'shadowBlob', dx: 0, dy: 64, radiusX: 84, radiusY: 24, alpha: 0.18, label: 'ridge-plateau-shadow' },
    { part: 'ridgeGrassClump', dx: 42, dy: 44, w: 76, h: 76, alpha: 0.42, label: 'ridge-plateau-grass' }
  ],
  ridgeRockScatter: [
    { part: 'ridgeRockCluster', dx: -28, dy: -6, scale: 0.68, alpha: 0.84, label: 'ridge-rock-a' },
    { part: 'ridgeRockCluster', dx: 30, dy: 22, scale: 0.52, alpha: 0.74, label: 'ridge-rock-b' },
    { part: 'ridgeGrassClump', dx: 12, dy: 38, w: 68, h: 68, alpha: 0.36, label: 'ridge-rock-grass' }
  ]
};

C.expandBackgroundPartLayoutPresets = function expandBackgroundPartLayoutPresets(layouts) {
  const presets = C.backgroundPartPresets || {};
  const out = {};
  for (const [stageKey, stageLayout] of Object.entries(layouts || {})) {
    out[stageKey] = {};
    for (const [layerName, items] of Object.entries(stageLayout || {})) {
      const expanded = [];
      for (const item of items || []) {
        if (!item.preset) {
          expanded.push(item);
          continue;
        }
        const presetItems = presets[item.preset] || [];
        const baseX = item.x || 0;
        const baseY = item.y || 0;
        const baseScale = item.scale == null ? 1 : item.scale;
        const baseAlpha = item.alpha == null ? 1 : item.alpha;
        presetItems.forEach((presetItem, index) => {
          const child = { ...presetItem };
          child.id = item.id ? `${item.id}-${String(index + 1).padStart(2, '0')}` : undefined;
          child.sourcePreset = item.preset;
          child.x = child.x == null && child.dx != null ? Math.round(baseX + child.dx * baseScale) : child.x;
          child.y = child.y == null && child.dy != null ? Math.round(baseY + child.dy * baseScale) : child.y;
          if (child.scale != null) child.scale = Number((child.scale * baseScale).toFixed(3));
          else if (baseScale !== 1) child.scale = baseScale;
          if (child.alpha != null) child.alpha = Number((child.alpha * baseAlpha).toFixed(3));
          else if (baseAlpha !== 1) child.alpha = baseAlpha;
          child.debugLabel = item.label ? `${item.label}:${child.label || child.part}` : `${item.preset}:${child.label || child.part}`;
          delete child.dx;
          delete child.dy;
          expanded.push(child);
        });
      }
      out[stageKey][layerName] = expanded;
    }
  }
  return out;
};

C.backgroundPartLayouts = {
  meadow: {
    base: [
      { part: 'grassPatch', x: 118, y: 188, w: 194, h: 116, alpha: 0.66 },
      { part: 'groundPatch', x: 366, y: 168, w: 172, h: 102, alpha: 0.56 },
      { part: 'groundPatchAlt', x: 378, y: 702, w: 154, h: 98, alpha: 0.50 },
      { part: 'grassPatch', x: 392, y: 698, w: 158, h: 98, alpha: 0.58 }
    ],
    decorationBack: [
      { part: 'softTree', x: 74, y: 156, scale: 0.92, alpha: 0.94 },
      { part: 'softTree', x: 424, y: 184, scale: 0.84, alpha: 0.90 },
      { part: 'softRock', x: 370, y: 706, scale: 0.78, alpha: 0.90 }
    ],
    decorationFront: [
      { part: 'fence', x: 88, y: 616, width: 102, alpha: 0.38 },
      { part: 'crate', x: 328, y: 618, alpha: 0.76 },
      { part: 'crate', x: 350, y: 622, alpha: 0.64 }
    ],
    atmosphere: [
      { part: 'mistVeil', alpha: 0.44 },
      { part: 'vignetteSoft', alpha: 0.74 }
    ]
  },
  crossroads: {
    base: [
      { part: 'grassPatch', x: 88, y: 160, w: 184, h: 106, alpha: 0.68 },
      { part: 'grassPatch', x: 394, y: 158, w: 180, h: 104, alpha: 0.66 },
      { part: 'groundPatch', x: 232, y: 624, w: 176, h: 106, alpha: 0.58 },
      { part: 'groundPatchAlt', x: 404, y: 684, w: 140, h: 88, alpha: 0.60 }
    ],
    path: [
      { part: 'roadRibbon', route: 'main', outerWidth: 48, innerWidth: 32 },
      { part: 'roadRibbon', route: 'left', outerWidth: 44, innerWidth: 30 },
      { part: 'roadRibbon', route: 'side', outerWidth: 40, innerWidth: 26 }
    ],
    decorationBack: [
      { part: 'softTree', x: 74, y: 134, scale: 0.94 },
      { part: 'softTree', x: 128, y: 172, scale: 0.78 },
      { part: 'softTree', x: 426, y: 142, scale: 0.88 },
      { part: 'softTree', x: 398, y: 206, scale: 0.76 },
      { part: 'softRock', x: 328, y: 336, scale: 0.68 },
      { part: 'softRock', x: 112, y: 672, scale: 0.82 },
      { part: 'grassTuft', x: 164, y: 676, scale: 0.74 },
      { part: 'grassTuft', x: 408, y: 642, scale: 0.72 },
      { part: 'shadowBlob', x: 226, y: 520, radiusX: 84, radiusY: 24, alpha: 0.28 }
    ],
    decorationFront: [
      { part: 'fence', x: 84, y: 612, width: 110, alpha: 0.46 },
      { part: 'fence', x: 382, y: 602, width: 98, alpha: 0.38 },
      { part: 'crate', x: 278, y: 602, alpha: 0.84 },
      { part: 'crate', x: 302, y: 616, alpha: 0.68 },
      { part: 'grassTuft', x: 340, y: 654, scale: 0.78, alpha: 0.52 },
      { part: 'grassTuft', x: 72, y: 660, scale: 0.80, alpha: 0.52 }
    ],
    atmosphere: [
      { part: 'mistVeil', alpha: 0.70 },
      { part: 'vignetteSoft', alpha: 0.84 }
    ]
  },
  ridge: {
    base: [
      { part: 'ridgeGroundPatch', x: 112, y: 176, w: 196, h: 196, alpha: 0.34, label: '左上高台地面' },
      { part: 'ridgeGroundPatch', x: 392, y: 168, w: 190, h: 190, alpha: 0.30, label: '右上高台地面' },
      { part: 'ridgeGroundPatch', x: 214, y: 622, w: 202, h: 202, alpha: 0.28, label: '中央下高台地面' },
      { part: 'groundPatchAlt', x: 392, y: 684, w: 144, h: 92, alpha: 0.42, label: '右下乾いた土' },
      { preset: 'ridgePlateauNook', x: 100, y: 182, alpha: 0.78, label: '左上高台' },
      { preset: 'ridgePlateauNook', x: 392, y: 170, alpha: 0.70, label: '右上高台' }
    ],
    path: [
      { part: 'roadRibbon', route: 'main', outerWidth: 46, innerWidth: 30 },
      { part: 'roadRibbon', route: 'left', outerWidth: 42, innerWidth: 28 },
      { part: 'roadRibbon', route: 'side', outerWidth: 40, innerWidth: 26 }
    ],
    decorationBack: [
      { preset: 'ridgeUpperShelf', x: 102, y: 156, alpha: 0.90, label: '左上崖棚' },
      { preset: 'ridgeUpperShelf', x: 398, y: 162, alpha: 0.82, scale: 0.94, label: '右上崖棚' },
      { preset: 'ridgeRockScatter', x: 318, y: 332, alpha: 0.92, label: '中央岩群' },
      { preset: 'ridgeRockScatter', x: 130, y: 684, alpha: 0.90, scale: 1.02, label: '左下岩群' },
      { part: 'ridgeGrassClump', x: 404, y: 650, w: 84, h: 84, alpha: 0.44, label: '右下草束' },
      { part: 'shadowBlob', x: 246, y: 550, radiusX: 92, radiusY: 24, alpha: 0.20, label: '中央影' }
    ],
    decorationFront: [
      { part: 'fence', x: 96, y: 620, width: 108, alpha: 0.38, label: '左下柵' },
      { part: 'fence', x: 376, y: 614, width: 92, alpha: 0.30, label: '右下柵' },
      { part: 'crate', x: 286, y: 604, alpha: 0.78, label: '補給箱A' },
      { part: 'crate', x: 308, y: 620, alpha: 0.60, label: '補給箱B' },
      { part: 'ridgeRockCluster', x: 438, y: 734, scale: 0.46, alpha: 0.66, label: '右下前景岩' },
      { part: 'ridgeGrassClump', x: 78, y: 672, w: 76, h: 76, alpha: 0.40, label: '左下前景草' },
      { preset: 'supplyFrontCluster', x: 286, y: 628, alpha: 0.66, label: '高台補給' }
    ],
    atmosphere: [
      { preset: 'softMistSet', alpha: 0.88, label: '高台薄霧' }
    ]
  }
};

C.backgroundPartLayoutSchema = {
  fields: ['id', 'part', 'x', 'y', 'w', 'h', 'scale', 'alpha', 'rotation', 'route', 'label'],
  requiredByKind: {
    patch: ['part', 'x', 'y'],
    routeRibbon: ['part', 'route'],
    tree: ['part', 'x', 'y'],
    rock: ['part', 'x', 'y'],
    reed: ['part', 'x', 'y'],
    fence: ['part', 'x', 'y'],
    crate: ['part', 'x', 'y'],
    shadow: ['part', 'x', 'y'],
    overlay: ['part']
  },
  note: 'v3.12.0: ridge now uses dedicated rock, cliff, plateau, and dry-grass parts while reusable background presets are still expanded before layout normalization.'
};

C.normalizeBackgroundPartLayouts = function normalizeBackgroundPartLayouts(layouts) {
  const out = {};
  for (const [stageKey, stageLayout] of Object.entries(layouts || {})) {
    out[stageKey] = {};
    for (const [layerName, items] of Object.entries(stageLayout || {})) {
      out[stageKey][layerName] = (items || []).map((item, index) => ({
        id: item.id || `${stageKey}-${layerName}-${String(index + 1).padStart(2, '0')}`,
        stage: stageKey,
        layer: layerName,
        debugLabel: item.debugLabel || item.label || `${item.part || 'unknown'} #${index + 1}`,
        ...item
      }));
    }
  }
  return out;
};

C.backgroundPartLayouts = C.expandBackgroundPartLayoutPresets(C.backgroundPartLayouts);
C.backgroundPartLayouts = C.normalizeBackgroundPartLayouts(C.backgroundPartLayouts);


  C.backgroundAssetSlots = {
    meadow: {
      base: 'bgMeadowBase',
      path: 'bgMeadowPath',
      decorationBack: 'bgMeadowDecorationBack',
      decorationFront: 'bgMeadowDecorationFront',
      atmosphere: 'bgMeadowAtmosphere'
    },
    crossroads: {
      base: 'bgCrossroadsBase',
      path: 'bgCrossroadsPath',
      decorationBack: 'bgCrossroadsDecorationBack',
      decorationFront: 'bgCrossroadsDecorationFront',
      atmosphere: 'bgCrossroadsAtmosphere'
    },
    ridge: {
      base: 'bgRidgeBase',
      path: 'bgRidgePath',
      decorationBack: 'bgRidgeDecorationBack',
      decorationFront: 'bgRidgeDecorationFront',
      atmosphere: 'bgRidgeAtmosphere'
    },
    tutorial: {
      base: 'bgTutorialBase',
      path: 'bgTutorialPath',
      decorationBack: 'bgTutorialDecorationBack',
      decorationFront: 'bgTutorialDecorationFront',
      atmosphere: 'bgTutorialAtmosphere'
    }
  };

  
C.stagePaths = {
  meadow: {
    main: [
      { x: 238, y: 774 }, { x: 238, y: 716 }, { x: 242, y: 650 }, { x: 250, y: 590 },
      { x: 238, y: 530 }, { x: 215, y: 470 }, { x: 205, y: 405 }, { x: 185, y: 340 },
      { x: 160, y: 276 }, { x: 144, y: 203 }
    ],
    left: [
      { x: 42, y: 764 }, { x: 74, y: 706 }, { x: 104, y: 652 }, { x: 126, y: 594 },
      { x: 150, y: 535 }, { x: 185, y: 492 }, { x: 215, y: 470 }, { x: 205, y: 405 },
      { x: 185, y: 340 }, { x: 160, y: 276 }, { x: 144, y: 203 }
    ],
    side: [
      { x: 444, y: 764 }, { x: 414, y: 704 }, { x: 386, y: 650 }, { x: 360, y: 592 },
      { x: 334, y: 548 }, { x: 286, y: 522 }, { x: 238, y: 530 }, { x: 215, y: 470 },
      { x: 205, y: 405 }, { x: 185, y: 340 }, { x: 160, y: 276 }, { x: 144, y: 203 }
    ]
  },
  crossroads: {
    main: [
      { x: 240, y: 776 }, { x: 240, y: 724 }, { x: 244, y: 666 }, { x: 248, y: 608 },
      { x: 246, y: 552 }, { x: 232, y: 500 }, { x: 218, y: 448 }, { x: 202, y: 388 },
      { x: 176, y: 314 }, { x: 144, y: 203 }
    ],
    left: [
      { x: 38, y: 756 }, { x: 68, y: 700 }, { x: 100, y: 642 }, { x: 124, y: 590 },
      { x: 154, y: 540 }, { x: 188, y: 500 }, { x: 232, y: 500 }, { x: 218, y: 448 },
      { x: 202, y: 388 }, { x: 176, y: 314 }, { x: 144, y: 203 }
    ],
    side: [
      { x: 446, y: 752 }, { x: 422, y: 704 }, { x: 394, y: 654 }, { x: 362, y: 606 },
      { x: 328, y: 568 }, { x: 292, y: 540 }, { x: 246, y: 552 }, { x: 232, y: 500 },
      { x: 218, y: 448 }, { x: 202, y: 388 }, { x: 176, y: 314 }, { x: 144, y: 203 }
    ]
  },
  ridge: {
    main: [
      { x: 250, y: 778 }, { x: 248, y: 730 }, { x: 250, y: 678 }, { x: 256, y: 624 },
      { x: 252, y: 576 }, { x: 242, y: 526 }, { x: 228, y: 470 }, { x: 202, y: 412 },
      { x: 176, y: 340 }, { x: 148, y: 214 }
    ],
    left: [
      { x: 46, y: 760 }, { x: 78, y: 714 }, { x: 106, y: 662 }, { x: 136, y: 614 },
      { x: 164, y: 566 }, { x: 194, y: 528 }, { x: 242, y: 526 }, { x: 228, y: 470 },
      { x: 202, y: 412 }, { x: 176, y: 340 }, { x: 148, y: 214 }
    ],
    side: [
      { x: 444, y: 756 }, { x: 420, y: 718 }, { x: 396, y: 674 }, { x: 370, y: 628 },
      { x: 340, y: 594 }, { x: 304, y: 560 }, { x: 252, y: 576 }, { x: 242, y: 526 },
      { x: 228, y: 470 }, { x: 202, y: 412 }, { x: 176, y: 340 }, { x: 148, y: 214 }
    ]
  },
  tutorial: { main: C.path, side: C.sidePath }
};

C.routeLabels = {
    meadow: { main: '主街道', left: '左側道', side: '右迂回路' },
    crossroads: { main: '中央街道', left: '左丘ルート', side: '右林道' },
    ridge: { main: '中央坂道', left: '左崖道', side: '右斜面路' },
    tutorial: { main: '正面の道', side: '東の道' }
  };

  C.stagePadLayouts = {
    meadow: [
      { id: 'p1', type: 'palisade', x: 238, y: 530 },
      { id: 'p2', type: 'archer', x: 188, y: 560 },
      { id: 'p3', type: 'archer', x: 286, y: 514 },
      { id: 'p4', type: 'barracks', x: 116, y: 558 },
      { id: 'p5', type: 'mine', x: 420, y: 700 },
      { id: 'p6', type: 'palisade', x: 205, y: 405 },
      { id: 'p7', type: 'cannon', x: 306, y: 486 },
      { id: 'p8', type: 'archer', x: 150, y: 360 },
      { id: 'p9', type: 'barracks', x: 182, y: 506 },
      { id: 'p10', type: 'cannon', x: 250, y: 372 },
      { id: 'p11', type: 'palisade', x: 160, y: 276 },
      { id: 'p12', type: 'archer', x: 226, y: 300 },
      { id: 'p13', type: 'mine', x: 386, y: 742, requiresDiscovery: 'meadow_mine' },
      { id: 'p14', type: 'cannon', x: 338, y: 552, requiresDiscovery: 'meadow_mine' }
    ],

    crossroads: [
      { id: 'c1', type: 'palisade', x: 246, y: 552 },
      { id: 'c2', type: 'archer', x: 194, y: 578 },
      { id: 'c3', type: 'archer', x: 302, y: 536 },
      { id: 'c4', type: 'barracks', x: 126, y: 566 },
      { id: 'c5', type: 'mine', x: 408, y: 694 },
      { id: 'c6', type: 'palisade', x: 218, y: 448 },
      { id: 'c7', type: 'cannon', x: 306, y: 458 },
      { id: 'c8', type: 'archer', x: 154, y: 340 },
      { id: 'c9', type: 'barracks', x: 188, y: 474 },
      { id: 'c10', type: 'cannon', x: 258, y: 348 },
      { id: 'c11', type: 'palisade', x: 176, y: 314 },
      { id: 'c12', type: 'archer', x: 236, y: 280 },
      { id: 'c13', type: 'mine', x: 374, y: 726, requiresDiscovery: 'crossroads_mine' },
      { id: 'c14', type: 'cannon', x: 346, y: 564, requiresDiscovery: 'crossroads_mine' }
    ],

    ridge: [
      { id: 'r1', type: 'palisade', x: 252, y: 576 },
      { id: 'r2', type: 'archer', x: 206, y: 610 },
      { id: 'r3', type: 'archer', x: 316, y: 548 },
      { id: 'r4', type: 'barracks', x: 132, y: 592 },
      { id: 'r5', type: 'mine', x: 412, y: 700 },
      { id: 'r6', type: 'palisade', x: 228, y: 470 },
      { id: 'r7', type: 'cannon', x: 320, y: 486 },
      { id: 'r8', type: 'archer', x: 160, y: 364 },
      { id: 'r9', type: 'barracks', x: 186, y: 500 },
      { id: 'r10', type: 'cannon', x: 266, y: 364 },
      { id: 'r11', type: 'palisade', x: 176, y: 340 },
      { id: 'r12', type: 'archer', x: 236, y: 296 },
      { id: 'r13', type: 'mine', x: 380, y: 732, requiresDiscovery: 'ridge_mine' },
      { id: 'r14', type: 'cannon', x: 348, y: 574, requiresDiscovery: 'ridge_mine' }
    ],

    tutorial: [
      { id: 't_palisade_gate', type: 'palisade', x: 238, y: 530 },
      { id: 't_archer_gate', type: 'archer', x: 188, y: 560 },
      { id: 't_mine_east', type: 'mine', x: 420, y: 700 },
      { id: 't_barracks_left', type: 'barracks', x: 116, y: 558 },
      { id: 't_cannon_merge', type: 'cannon', x: 306, y: 486 },
      { id: 't_archer_city', type: 'archer', x: 150, y: 360 },
      { id: 't_palisade_city', type: 'palisade', x: 160, y: 276 }
    ]
  };


  C.discoveryRevealRadius = 76;
  C.discoveryPoints = {
    meadow: [
      { id: 'meadow_cache', name: '前線の物資箱', kind: 'cache', x: 70, y: 708, rewardCoins: 45, note: '左側道の物資。序盤の立て直しに使える。' },
      { id: 'meadow_mine', name: '右下の金脈', kind: 'resource', x: 426, y: 704, rewardCoins: 25, note: '右下の金鉱エリアを確保。追加の金鉱と大砲床が使える。' }
    ],
    crossroads: [
      { id: 'crossroads_cache', name: '分岐路の補給箱', kind: 'cache', x: 78, y: 692, rewardCoins: 50, note: '左丘ルートの補給箱。背景差し替えテストでも見落としにくいか確認する。' },
      { id: 'crossroads_mine', name: '林道の金脈', kind: 'resource', x: 418, y: 690, rewardCoins: 28, note: '右林道側の金鉱エリアを解放。追加の金鉱と大砲床を確認できる。' }
    ],
    ridge: [
      { id: 'ridge_cache', name: '高台の補給箱', kind: 'cache', x: 82, y: 704, rewardCoins: 54, note: '左崖道の補給箱。新マップでも発見物と背景パーツの視認性を確認する。' },
      { id: 'ridge_mine', name: '斜面の金脈', kind: 'resource', x: 418, y: 704, rewardCoins: 30, note: '右斜面路の金鉱エリアを解放。追加の金鉱と大砲床で背景切替後の配置を確認できる。' }
    ],
    tutorial: [
      { id: 'tutorial_cache', name: '前線の物資箱', kind: 'cache', x: 72, y: 706, rewardCoins: 60, note: '強化練習用の資金を確保。' },
      { id: 'tutorial_mine', name: '練習用の金脈', kind: 'resource', x: 426, y: 704, rewardCoins: 30, note: '金鉱を建てる意味を確認する地点。' }
    ]
  };

  C.discoveryPads = {
    meadow: [],
    crossroads: [],
    ridge: [],
    tutorial: []
  };

  for (const key of Object.keys(C.stagePadLayouts)) {
    C.stagePadLayouts[key] = C.stagePadLayouts[key].concat(C.discoveryPads[key] || []);
  }

  const activePadTypes = new Set(C.activeFacilityTypes);
  const roadCenterPadTypes = new Set(['palisade']);
  const roadSidePadTypes = new Set(['barracks']);

  function nearestRoadPoint(stageKey, x, y) {
    const paths = C.stagePaths[stageKey] || C.stagePaths.meadow;
    let best = null;
    for (const route of Object.keys(paths)) {
      const pts = paths[route] || [];
      for (let i = 1; i < pts.length; i += 1) {
        const a = pts[i - 1];
        const b = pts[i];
        const vx = b.x - a.x;
        const vy = b.y - a.y;
        const lenSq = vx * vx + vy * vy || 1;
        const t = Math.max(0, Math.min(1, ((x - a.x) * vx + (y - a.y) * vy) / lenSq));
        const px = a.x + vx * t;
        const py = a.y + vy * t;
        const d = Math.hypot(x - px, y - py);
        if (!best || d < best.d) best = { x: px, y: py, vx, vy, d, route };
      }
    }
    return best || { x, y, vx: 1, vy: 0, d: 0, route: 'main' };
  }

  function normalizePadPlacement(stageKey, pad, index) {
    if (!roadCenterPadTypes.has(pad.type) && !roadSidePadTypes.has(pad.type)) return;
    const nearest = nearestRoadPoint(stageKey, pad.x, pad.y);
    if (roadCenterPadTypes.has(pad.type)) {
      pad.x = Math.round(nearest.x);
      pad.y = Math.round(nearest.y);
      pad.placement = 'road-center';
      return;
    }
    const len = Math.hypot(nearest.vx, nearest.vy) || 1;
    const nx = -nearest.vy / len;
    const ny = nearest.vx / len;
    const sideHint = ((pad.x - nearest.x) * nx + (pad.y - nearest.y) * ny) >= 0 ? 1 : -1;
    const offset = 44;
    pad.x = Math.round(Math.max(42, Math.min(C.w - 42, nearest.x + nx * sideHint * offset)));
    pad.y = Math.round(Math.max(146, Math.min(C.h - 48, nearest.y + ny * sideHint * offset)));
    pad.placement = 'road-side';
  }

  for (const [stageKey, pads] of Object.entries(C.stagePadLayouts)) {
    C.stagePadLayouts[stageKey] = pads.filter((pad) => activePadTypes.has(pad.type));
    C.stagePadLayouts[stageKey].forEach((pad, index) => normalizePadPlacement(stageKey, pad, index));
  }
  C.pads = C.pads.filter((pad) => activePadTypes.has(pad.type));


  C.facilityUi = {
    palisade: { category: 'defense', icon: '柵', short: '足止め・防衛線', timing: '道の中央で敵を止める。単独では倒せないので弓塔や大砲の前に置く。', good: '高速・群れ・破城槌の足止め', weak: '火力なし' },
    archer: { category: 'attack', icon: '弓', short: '長射程・単体火力', timing: '道を長く撃てる脇に置く。序盤の主力火力で、走り兵にも対応しやすい。', good: '走り兵・単体敵・序盤', weak: '大群処理は遅い' },
    cannon: { category: 'attack', icon: '砲', short: '範囲火力・群れ対策', timing: '敵が合流する地点の脇に置く。連射は遅いが密集敵に強い。', good: '群れ・合流地点・最終進軍', weak: '高価で初動が遅い' },
    barracks: { category: 'support', icon: '兵舎', short: '兵士生成・前線維持', timing: '道の脇に置く。兵士が側道や複数ルートを押さえ、主人公の移動負荷を下げる。', good: '側道・複数ルート・継戦', weak: '瞬間火力は低い' },
    mine: { category: 'economy', icon: '金', short: '経済・強化資金', timing: '早いほど得。ただし防衛力は増えない。敵圧が低い合間に建てる。', good: '長期戦・強化資金', weak: '建てた直後は無防備' }
  };

  C.categoryColors = {
    attack: '#ffb25c',
    defense: '#ff6b5e',
    economy: '#ffd35b',
    support: '#9ee1bb'
  };

  C.categoryLabels = {
    attack: '攻撃',
    defense: '防衛',
    economy: '経済',
    support: '支援'
  };

  // v3.7.0: clarify five core facility roles through stats, UI hints, and behavior.
  Object.assign(C.facilityTypes.palisade, { cost: 34, hp: 440, upgradeCost: 46, blockArmor: 0.18 });
  Object.assign(C.facilityTypes.archer, { cost: 70, cooldown: 560, damage: 20, range: 198 });
  Object.assign(C.facilityTypes.cannon, { cost: 142, cooldown: 1420, damage: 56, splash: 82, range: 142 });
  Object.assign(C.facilityTypes.mine, { cost: 116, incomeTime: 3600, income: 13 });
  Object.assign(C.facilityTypes.barracks, { cost: 88, spawnTime: 3200, range: 144, soldierCap: 2 });

  C.facilityLevelStats = {
    palisade: {
      1: { hp: 440, blockRadius: 36, blockArmor: 0.18, upgradeCost: 46 },
      2: { hp: 620, blockRadius: 39, blockArmor: 0.24, upgradeCost: 76 },
      3: { hp: 860, blockRadius: 43, blockArmor: 0.30, upgradeCost: 112 },
      4: { hp: 1180, blockRadius: 48, blockArmor: 0.36, upgradeCost: null }
    },
    archer: {
      1: { hp: 145, damage: 20, range: 198, cooldown: 560, upgradeCost: 72 },
      2: { hp: 184, damage: 27, range: 216, cooldown: 512, upgradeCost: 110 },
      3: { hp: 228, damage: 36, range: 236, cooldown: 470, upgradeCost: 154 },
      4: { hp: 280, damage: 48, range: 258, cooldown: 430, upgradeCost: null }
    },
    cannon: {
      1: { hp: 175, damage: 56, range: 142, cooldown: 1420, splash: 82, upgradeCost: 128 },
      2: { hp: 230, damage: 74, range: 154, cooldown: 1350, splash: 92, upgradeCost: 180 },
      3: { hp: 292, damage: 98, range: 168, cooldown: 1280, splash: 104, upgradeCost: 240 },
      4: { hp: 370, damage: 130, range: 184, cooldown: 1190, splash: 118, upgradeCost: null }
    },
    barracks: {
      1: { hp: 210, range: 144, spawnTime: 3200, soldierCap: 2, soldierHp: 62, soldierDamage: 13, soldierSense: 120, soldierChase: 82, upgradeCost: 86 },
      2: { hp: 270, range: 156, spawnTime: 2850, soldierCap: 3, soldierHp: 78, soldierDamage: 17, soldierSense: 138, soldierChase: 94, upgradeCost: 130 },
      3: { hp: 346, range: 172, spawnTime: 2500, soldierCap: 4, soldierHp: 98, soldierDamage: 22, soldierSense: 158, soldierChase: 108, upgradeCost: 180 },
      4: { hp: 430, range: 190, spawnTime: 2150, soldierCap: 5, soldierHp: 124, soldierDamage: 28, soldierSense: 182, soldierChase: 124, upgradeCost: null }
    },
    mine: {
      1: { hp: 125, income: 13, incomeTime: 3600, upgradeCost: 108 },
      2: { hp: 162, income: 19, incomeTime: 3300, upgradeCost: 152 },
      3: { hp: 208, income: 27, incomeTime: 3000, upgradeCost: 204 },
      4: { hp: 268, income: 38, incomeTime: 2700, upgradeCost: null }
    }
  };

  C.facilityUpgradeHints = {
    palisade: {
      2: '耐久・足止め範囲・被ダメ軽減が上がる',
      3: '前線が崩れにくくなり、大砲の攻撃時間を作れる',
      4: '最終防衛線として大群と破城槌を止めやすい'
    },
    archer: {
      2: '攻撃力・射程・連射が上がる',
      3: '長い道を撃ち続ける主力単体火力になる',
      4: '走り兵や硬い単体敵への対応力が高い'
    },
    cannon: {
      2: '範囲火力と爆風が上がる',
      3: '合流地点の群れ処理が安定する',
      4: '最終進軍の密集敵に強い決戦火力になる'
    },
    barracks: {
      2: '兵士上限・出撃速度・兵士性能が上がる',
      3: '側道の足止めを任せやすくなる',
      4: '複数ルート進軍でも前線維持しやすくなる'
    },
    mine: {
      2: '収入額と収入頻度が上がる',
      3: '中盤以降の強化資金を作りやすくなる',
      4: '長期戦で大きな資金源になる'
    }
  };

  C.verifyUpgradeSetup = function verifyUpgradeSetup() {
    const missing = [];
    for (const type of C.activeFacilityTypes) {
      const def = C.facilityTypes[type];
      if (!def || def.maxLevel !== 4 || !def.levelStats) missing.push(`${type}:levelStats`);
      for (let lv = 1; lv <= 4; lv += 1) {
        if (!def.levelStats || !def.levelStats[lv]) missing.push(`${type}:Lv${lv}`);
      }
    }
    if (missing.length) console.warn('[Upgrade setup warning]', missing.join(', '));
  };

  for (const type of C.activeFacilityTypes) {
    const def = C.facilityTypes[type];
    if (!def) continue;
    def.maxLevel = 4;
    def.levelStats = C.facilityLevelStats[type];
    def.options = [];
    const lv1 = def.levelStats && def.levelStats[1];
    if (lv1) Object.assign(def, lv1, { cost: def.cost });
  }


  C.verifyUpgradeSetup();


  C.routeChokepoints = {
    meadow: [
      { id: 'capital_gate', label: '城前', x: 160, y: 276, r: 72, note: '最後の防衛線。柵と弓塔で守る。' },
      { id: 'capital_merge', label: '合流', x: 238, y: 530, r: 92, note: '主街道と右迂回路が重なる大砲ポイント。' },
      { id: 'capital_left', label: '左側道', x: 150, y: 535, r: 76, note: '兵舎が活きる側道。' },
      { id: 'capital_mine', label: '金鉱', x: 426, y: 704, r: 72, note: '取りに行く価値は高いが右迂回路が近い。' }
    ],
    ridge: [
      { id: 'ridge_gate', label: '城前', x: 176, y: 340, r: 72, note: '高台の最終防衛線。柵と弓塔を重ねたい。' },
      { id: 'ridge_merge', label: '中央坂', x: 242, y: 526, r: 92, note: '3ルートの圧が集まりやすい大砲候補地点。' },
      { id: 'ridge_left', label: '左崖道', x: 164, y: 566, r: 76, note: '兵舎で支えやすい側道。' },
      { id: 'ridge_mine_zone', label: '金脈', x: 418, y: 704, r: 72, note: '右斜面路の探索地点。取りに行く価値は高いが対応が遅れやすい。' }
    ],
    tutorial: [
      { id: 'tutorial_front', label: '前線', x: 270, y: 516, r: 78, note: '火力を置きやすい曲がり角' },
      { id: 'tutorial_gate', label: '城門前', x: 168, y: 244, r: 70, note: '最後の足止め位置' },
      { id: 'tutorial_east', label: '東道', x: 388, y: 560, r: 72, note: '側道の迎撃線' }
    ]
  };

  C.mapGuideTrails = {
    meadow: [
      { label: '合流地点へ', kind: 'defense', points: [{ x: 244, y: 666 }, { x: 250, y: 600 }, { x: 238, y: 530 }] },
      { label: '金鉱へ', kind: 'economy', points: [{ x: 244, y: 666 }, { x: 338, y: 684 }, { x: 426, y: 704 }] },
      { label: '左側道へ', kind: 'support', points: [{ x: 244, y: 666 }, { x: 176, y: 600 }, { x: 150, y: 535 }] }
    ],
    ridge: [
      { label: '中央坂へ', kind: 'defense', points: [{ x: 250, y: 678 }, { x: 256, y: 624 }, { x: 252, y: 576 }] },
      { label: '金脈へ', kind: 'economy', points: [{ x: 250, y: 678 }, { x: 342, y: 700 }, { x: 418, y: 704 }] },
      { label: '左崖道へ', kind: 'support', points: [{ x: 250, y: 678 }, { x: 192, y: 626 }, { x: 164, y: 566 }] }
    ],
    tutorial: [
      { label: '金鉱へ', kind: 'economy', points: [{ x: 244, y: 666 }, { x: 328, y: 670 }, { x: 426, y: 704 }] },
      { label: '前線へ', kind: 'defense', points: [{ x: 244, y: 666 }, { x: 268, y: 590 }, { x: 270, y: 516 }] }
    ]
  };

  C.worldScaleX = 2;
  C.worldScaleY = 2;
  C.world = {
    w: Math.round(C.w * C.worldScaleX),
    h: Math.round(C.h * C.worldScaleY)
  };

  function scalePointForWorld(point) {
    if (!point || point.__worldScaled) return point;
    point.x = Math.round(point.x * C.worldScaleX);
    point.y = Math.round(point.y * C.worldScaleY);
    point.__worldScaled = true;
    return point;
  }

  function scalePointArrayForWorld(points) {
    for (const point of points) scalePointForWorld(point);
    return points;
  }

  function scalePadArrayForWorld(pads) {
    for (const pad of pads) scalePointForWorld(pad);
    return pads;
  }

  scalePointForWorld(C.castle);
  scalePointForWorld(C.kingStart);
  scalePointArrayForWorld(C.path);
  scalePointArrayForWorld(C.sidePath);
  for (const stage of Object.values(C.stagePaths)) {
    for (const routePoints of Object.values(stage)) {
      scalePointArrayForWorld(routePoints || []);
    }
  }
  const seenPadArrays = new Set();
  for (const pads of Object.values(C.stagePadLayouts)) {
    if (seenPadArrays.has(pads)) continue;
    seenPadArrays.add(pads);
    scalePadArrayForWorld(pads);
  }
  for (const list of Object.values(C.discoveryPoints || {})) {
    scalePointArrayForWorld(list);
  }
  for (const list of Object.values(C.routeChokepoints || {})) {
    scalePointArrayForWorld(list);
  }
  for (const trails of Object.values(C.mapGuideTrails || {})) {
    for (const trail of trails) scalePointArrayForWorld(trail.points || []);
  }


  window.KBD_CONFIG = C;
})();


/* ===== src/config/assets.js ===== */

(function () {
  'use strict';

  const ASSET_VERSION = 'v3.12.4';

  const ASSET_MANIFEST = {
    kingIdle: 'assets/images/king/king_idle.png',
    kingRun1: 'assets/images/king/king_run_1.png',
    kingRun2: 'assets/images/king/king_run_2.png',
    kingIdle1: 'assets/images/king/idle/king_idle_1.png',
    kingIdle2: 'assets/images/king/idle/king_idle_2.png',
    kingRunFrame1: 'assets/images/king/run/king_run_1.png',
    kingRunFrame2: 'assets/images/king/run/king_run_2.png',
    kingRunFrame3: 'assets/images/king/run/king_run_3.png',
    kingRunFrame4: 'assets/images/king/run/king_run_4.png',
    kingHurt: 'assets/images/king/king_hurt.png',
    kingDown: 'assets/images/king/king_down.png',
    allyMilitia: 'assets/images/allies/ally_militia.png',
    allyShield: 'assets/images/allies/ally_shield.png',
    allySpear: 'assets/images/allies/ally_spear.png',
    allyMilitiaAttack1: 'assets/images/allies/attack/ally_militia_attack_1.png',
    allyMilitiaAttack2: 'assets/images/allies/attack/ally_militia_attack_2.png',
    allyMilitiaAttack3: 'assets/images/allies/attack/ally_militia_attack_3.png',
    allyMilitiaAttack4: 'assets/images/allies/attack/ally_militia_attack_4.png',
    allyShieldAttack1: 'assets/images/allies/attack/ally_shield_attack_1.png',
    allyShieldAttack2: 'assets/images/allies/attack/ally_shield_attack_2.png',
    allyShieldAttack3: 'assets/images/allies/attack/ally_shield_attack_3.png',
    allyShieldAttack4: 'assets/images/allies/attack/ally_shield_attack_4.png',
    allySpearAttack1: 'assets/images/allies/attack/ally_spear_attack_1.png',
    allySpearAttack2: 'assets/images/allies/attack/ally_spear_attack_2.png',
    allySpearAttack3: 'assets/images/allies/attack/ally_spear_attack_3.png',
    allySpearAttack4: 'assets/images/allies/attack/ally_spear_attack_4.png',
    enemyGrunt: 'assets/images/enemies/enemy_grunt.png',
    enemyRunner: 'assets/images/enemies/enemy_runner.png',
    enemyBrute: 'assets/images/enemies/enemy_brute.png',
    enemyShield: 'assets/images/enemies/enemy_shield.png',
    enemySaboteur: 'assets/images/enemies/enemy_saboteur.png',
    enemyBomber: 'assets/images/enemies/enemy_bomber.png',
    enemyShaman: 'assets/images/enemies/enemy_shaman.png',
    enemySiegeRam: 'assets/images/enemies/enemy_siege_ram.png',
    enemyWarlord: 'assets/images/enemies/enemy_warlord.png',
    enemyOverlord: 'assets/images/enemies/enemy_overlord.png',
    castleKeep: 'assets/images/castle/castle_keep.png',
    buildingPalisade: 'assets/images/buildings/building_palisade.png',
    buildingPalisadeLv1: 'assets/images/buildings/levels/building_palisade_lv1.png',
    buildingPalisadeLv2: 'assets/images/buildings/levels/building_palisade_lv2.png',
    buildingPalisadeLv3: 'assets/images/buildings/levels/building_palisade_lv3.png',
    buildingPalisadeLv4: 'assets/images/buildings/levels/building_palisade_lv4.png',
    buildingArcherTower: 'assets/images/buildings/building_archer_tower.png',
    buildingArcherTowerLv1: 'assets/images/buildings/levels/building_archer_tower_lv1.png',
    buildingArcherTowerLv2: 'assets/images/buildings/levels/building_archer_tower_lv2.png',
    buildingArcherTowerLv3: 'assets/images/buildings/levels/building_archer_tower_lv3.png',
    buildingArcherTowerLv4: 'assets/images/buildings/levels/building_archer_tower_lv4.png',
    buildingCannon: 'assets/images/buildings/building_cannon.png',
    buildingCannonLv1: 'assets/images/buildings/levels/building_cannon_lv1.png',
    buildingCannonLv2: 'assets/images/buildings/levels/building_cannon_lv2.png',
    buildingCannonLv3: 'assets/images/buildings/levels/building_cannon_lv3.png',
    buildingCannonLv4: 'assets/images/buildings/levels/building_cannon_lv4.png',
    buildingBarracks: 'assets/images/buildings/building_barracks.png',
    buildingBarracksLv1: 'assets/images/buildings/levels/building_barracks_lv1.png',
    buildingBarracksLv2: 'assets/images/buildings/levels/building_barracks_lv2.png',
    buildingBarracksLv3: 'assets/images/buildings/levels/building_barracks_lv3.png',
    buildingBarracksLv4: 'assets/images/buildings/levels/building_barracks_lv4.png',
    buildingGoldMine: 'assets/images/buildings/building_gold_mine.png',
    buildingGoldMineLv1: 'assets/images/buildings/levels/building_gold_mine_lv1.png',
    buildingGoldMineLv2: 'assets/images/buildings/levels/building_gold_mine_lv2.png',
    buildingGoldMineLv3: 'assets/images/buildings/levels/building_gold_mine_lv3.png',
    buildingGoldMineLv4: 'assets/images/buildings/levels/building_gold_mine_lv4.png',
    tileGrass: 'assets/images/terrain/tile_grass.png',
    tileDirt: 'assets/images/terrain/tile_dirt.png',
    tileRoad: 'assets/images/terrain/tile_road.png',
    tileRock: 'assets/images/terrain/tile_rock.png',
    tileMountain: 'assets/images/terrain/tile_mountain.png',
    tileBuildEmpty: 'assets/images/build_tiles/tile_build_empty.png',
    tileBuildInvesting: 'assets/images/build_tiles/tile_build_investing.png',
    tileBuildActive: 'assets/images/build_tiles/tile_build_active.png',
    tileBuildComplete: 'assets/images/build_tiles/tile_build_complete.png',
    tileBuildLocked: 'assets/images/build_tiles/tile_build_locked.png',
    uiCoin: 'assets/images/ui/ui_coin.png',
    uiHeart: 'assets/images/ui/ui_heart.png',
    uiCastleHp: 'assets/images/ui/ui_castle_hp.png',
    uiPopulation: 'assets/images/ui/ui_population.png',
    uiTerritory: 'assets/images/ui/ui_territory.png',
    uiWave: 'assets/images/ui/ui_wave.png',
    uiWarning: 'assets/images/ui/ui_warning.png',
    uiCrown: 'assets/images/ui/ui_crown.png',
    uiBuild: 'assets/images/ui/ui_build.png',
    uiUpgrade: 'assets/images/ui/ui_upgrade.png',
    fxHit: 'assets/images/effects/fx_hit.png',
    fxExplosion: 'assets/images/effects/fx_explosion.png',
    fxBuild: 'assets/images/effects/fx_build.png',
    fxHeal: 'assets/images/effects/fx_heal.png',
    fxCoinPickup: 'assets/images/effects/fx_coin_pickup.png',
    fxUpgrade: 'assets/images/effects/fx_upgrade.png',
    fxWarning: 'assets/images/effects/fx_warning.png',

    tileGrassMeadow: 'assets/images/terrain/stage/tile_grass_meadow.png',
    tileRoadMeadow: 'assets/images/terrain/stage/tile_road_meadow.png',
    tileDirtMeadow: 'assets/images/terrain/stage/tile_dirt_meadow.png',
    bgMeadowRoughBase: 'assets/images/backgrounds/meadow/bg_meadow_rough_base.png',
    bgMeadowRoughPath: 'assets/images/backgrounds/meadow/bg_meadow_rough_path.png',
    bgMeadowRoughDecorationBack: 'assets/images/backgrounds/meadow/bg_meadow_rough_decoration_back.png',
    bgMeadowRoughDecorationFront: 'assets/images/backgrounds/meadow/bg_meadow_rough_decoration_front.png',
    bgMeadowRoughAtmosphere: 'assets/images/backgrounds/meadow/bg_meadow_rough_atmosphere.png',
    partGrassPatchSoft01: 'assets/images/backgrounds/parts/part_grass_patch_soft_01.png',
    partDirtPatchSoft01: 'assets/images/backgrounds/parts/part_dirt_patch_soft_01.png',
    partDirtPatchSoft02: 'assets/images/backgrounds/parts/part_dirt_patch_soft_02.png',
    partRoadStraightSoft01: 'assets/images/backgrounds/parts/part_road_straight_soft_01.png',
    partRoadCurveSoft01: 'assets/images/backgrounds/parts/part_road_curve_soft_01.png',
    partTreeRoundSoft01: 'assets/images/backgrounds/parts/part_tree_round_soft_01.png',
    partRockClusterSoft01: 'assets/images/backgrounds/parts/part_rock_cluster_soft_01.png',
    partFenceWoodSoft01: 'assets/images/backgrounds/parts/part_fence_wood_soft_01.png',
    partCrateWoodSoft01: 'assets/images/backgrounds/parts/part_crate_wood_soft_01.png',
    partShadowBlobSoft01: 'assets/images/backgrounds/parts/part_shadow_blob_soft_01.png',
    partMistVeilSoft01: 'assets/images/backgrounds/parts/part_mist_veil_soft_01.png',
    partRidgeGroundRocky01: 'assets/images/backgrounds/parts/part_ridge_ground_rocky_01.png',
    partRidgeCliffEdge01: 'assets/images/backgrounds/parts/part_ridge_cliff_edge_01.png',
    partRidgeRockCluster01: 'assets/images/backgrounds/parts/part_ridge_rock_cluster_01.png',
    partRidgePlateau01: 'assets/images/backgrounds/parts/part_ridge_plateau_01.png',
    partRidgeGrassClump01: 'assets/images/backgrounds/parts/part_ridge_grass_clump_01.png',
    fxHit1: 'assets/images/effects/frames/fx_hit_1.png',
    fxHit2: 'assets/images/effects/frames/fx_hit_2.png',
    fxHit3: 'assets/images/effects/frames/fx_hit_3.png',
    fxExplosion1: 'assets/images/effects/frames/fx_explosion_1.png',
    fxExplosion2: 'assets/images/effects/frames/fx_explosion_2.png',
    fxExplosion3: 'assets/images/effects/frames/fx_explosion_3.png',
    fxBuild1: 'assets/images/effects/frames/fx_build_1.png',
    fxBuild2: 'assets/images/effects/frames/fx_build_2.png',
    fxBuild3: 'assets/images/effects/frames/fx_build_3.png',
    fxHeal1: 'assets/images/effects/frames/fx_heal_1.png',
    fxHeal2: 'assets/images/effects/frames/fx_heal_2.png',
    fxHeal3: 'assets/images/effects/frames/fx_heal_3.png',
    fxCoinPickup1: 'assets/images/effects/frames/fx_coin_pickup_1.png',
    fxCoinPickup2: 'assets/images/effects/frames/fx_coin_pickup_2.png',
    fxCoinPickup3: 'assets/images/effects/frames/fx_coin_pickup_3.png',
    fxUpgrade1: 'assets/images/effects/frames/fx_upgrade_1.png',
    fxUpgrade2: 'assets/images/effects/frames/fx_upgrade_2.png',
    fxUpgrade3: 'assets/images/effects/frames/fx_upgrade_3.png',
    fxWarning1: 'assets/images/effects/frames/fx_warning_1.png',
    fxWarning2: 'assets/images/effects/frames/fx_warning_2.png',
    fxWarning3: 'assets/images/effects/frames/fx_warning_3.png'
  };

  function versionedAssetSrc(src) {
    if (!src || src.includes('?')) return src;
    return `${src}?asset=${ASSET_VERSION}`;
  }

  function loadGameImages() {
    const images = {};
    for (const [key, src] of Object.entries(ASSET_MANIFEST)) {
      const img = new Image();
      img.src = versionedAssetSrc(src);
      images[key] = img;
    }
    return images;
  }

  window.KBD_ASSET_VERSION = ASSET_VERSION;
  window.KBD_ASSET_MANIFEST = ASSET_MANIFEST;
  window.KBD_LOAD_IMAGES = loadGameImages;
})();

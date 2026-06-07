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
    saveKey: 'game-tower-defense-v350-save',
    audioKey: 'game-tower-defense-v350-audio',
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
        name: '柵', cost: 50, upgradeCost: 54, hp: 305, range: 46, block: true,
        color: '#8a5b35', accent: '#c79453', desc: '安く作れる足止め施設。時間を稼ぐ。',
        options: [
          { key: 'thorns', name: '棘付き柵', desc: '敵を止めながら少しずつ削る。' },
          { key: 'reinforced', name: '強化柵', desc: '耐久力を大きく上げる。' }
        ]
      },
      wall: {
        name: '石壁', cost: 96, upgradeCost: 82, hp: 520, range: 50, block: true,
        color: '#68737a', accent: '#d2d7d9', desc: '高耐久の防衛壁。',
        options: [
          { key: 'bastion', name: '城壁', desc: 'HPと足止め範囲を強化する。' },
          { key: 'gate', name: '迎撃門', desc: '止めた敵に継続ダメージを与える。' }
        ]
      },
      archer: {
        name: '弓塔', cost: 78, upgradeCost: 82, hp: 150, range: 162, cooldown: 540, damage: 18,
        projectile: '#f3d57b', color: '#9c7041', accent: '#f3d57b', desc: '安定した遠距離攻撃。',
        options: [
          { key: 'longbow', name: '長弓塔', desc: '射程を伸ばして広く狙える。' },
          { key: 'rapid', name: '連射弓塔', desc: '攻撃速度を上げる。' }
        ]
      },
      barracks: {
        name: '兵舎', cost: 112, upgradeCost: 102, hp: 190, range: 124, spawn: true, spawnTime: 3600,
        color: '#7e6d52', accent: '#d6bf82', desc: '道を守る兵士を自動で出す。',
        options: [
          { key: 'shield', name: '盾部隊', desc: '耐久力が高く足止め向き。' },
          { key: 'spear', name: '槍部隊', desc: '攻撃力と間合いに優れる。' }
        ]
      },
      cannon: {
        name: '大砲', cost: 170, upgradeCost: 138, hp: 165, range: 126, cooldown: 1360, damage: 44, splash: 58,
        projectile: '#ffb25c', color: '#646c76', accent: '#d7dde4', desc: '敵の群れに強い範囲攻撃。',
        options: [
          { key: 'heavy', name: '重砲', desc: '直撃ダメージを強化する。' },
          { key: 'scatter', name: '散弾砲', desc: '爆風範囲を広げる。' }
        ]
      },
      mine: {
        name: '金鉱', cost: 132, upgradeCost: 118, hp: 125, economy: true, incomeTime: 3400, income: 12,
        color: '#8c7332', accent: '#ffd35b', desc: '時間経過でコインを生産する。',
        options: [
          { key: 'tax', name: '徴税所', desc: '定期収入を増やす。' },
          { key: 'vault', name: '金庫', desc: '間隔は長いが大きな収入を得る。' }
        ]
      },
      repair: {
        name: '修理小屋', cost: 96, upgradeCost: 86, hp: 130, repair: true, range: 116, repairRate: 10,
        color: '#4f7765', accent: '#9ee1bb', desc: '近くの施設を自動修理する。',
        options: [
          { key: 'fieldwork', name: '現場班', desc: '修理範囲を広げる。' },
          { key: 'workshop', name: '工房', desc: '修理速度を上げる。' }
        ]
      },
      trap: {
        name: '棘罠', cost: 66, upgradeCost: 62, hp: 92, trap: true, range: 48, cooldown: 1080, damage: 36, slow: 760,
        color: '#65513b', accent: '#f08b59', desc: '敵が通ると発動する罠。',
        options: [
          { key: 'barbed', name: '鋭利な罠', desc: 'ダメージを強化する。' },
          { key: 'frost', name: '氷結罠', desc: '鈍足効果を長くする。' }
        ]
      },
      banner: {
        name: '指揮所', cost: 116, upgradeCost: 90, hp: 120, aura: true, range: 132,
        color: '#8d3f42', accent: '#ffd6a2', desc: '近くの兵士を強化する支援施設。兵舎の近くに置くと効果が出る。',
        options: [
          { key: 'morale', name: '攻撃号令', desc: '範囲内の兵士の攻撃力を上げる。' },
          { key: 'command', name: '見張り号令', desc: '範囲内の兵士が敵に反応しやすくなる。' }
        ]
      },
      beacon: {
        name: '狼煙台', cost: 138, upgradeCost: 112, hp: 120, aura: true, range: 155,
        color: '#6b527f', accent: '#d7beff', desc: '周囲の味方の反応範囲を広げる。',
        options: [
          { key: 'scout', name: '見張り火', desc: '索敵能力を大きく伸ばす。' },
          { key: 'rally', name: '集結火', desc: '索敵と攻撃支援を両方伸ばす。' }
        ]
      },
      village: {
        name: '村', cost: 86, upgradeCost: 72, hp: 170, development: true, economy: true,
        incomeTime: 5200, income: 6, popBonus: 5,
        color: '#7a6347', accent: '#f0d28c', desc: '人口上限を増やし、少し収入も生む。'
      },
      market: {
        name: '市場', cost: 118, upgradeCost: 96, hp: 150, development: true, economy: true,
        incomeTime: 4700, income: 9, economyBonus: 0.12,
        color: '#6f5a89', accent: '#e7c7ff', desc: 'コイン獲得効率と定期収入を上げる。'
      },
      outpost: {
        name: '前哨基地', cost: 136, upgradeCost: 116, hp: 230, development: true, territoryBonus: 1, range: 148,
        color: '#4d7257', accent: '#a9e3b4', desc: '領土を広げ、外側の建設床を解放する。'
      },
      training: {
        name: '訓練場', cost: 136, upgradeCost: 108, hp: 155, development: true,
        popBonus: 2, soldierDamageBonus: 0.10, soldierHpBonus: 0.06,
        color: '#7f4d3e', accent: '#ffb78f', desc: '兵士の強さと人口上限を上げる。'
      },
      keep: {
        name: '領主の砦', cost: 172, upgradeCost: 138, hp: 260, development: true,
        castleHpBonus: 80, popBonus: 2, kingHpBonus: 8,
        color: '#5d6378', accent: '#dce5ff', desc: '防衛都市と主人公を強化する。'
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
      meadow: { key: 'meadow', order: 0, name: '防衛都市前線', desc: '国境の防衛都市へ続く主街道・左側道・右迂回を守る作り込み用メインマップ。', waveCount: 8, castleHp: 420, startCoinsBonus: 0, enemyHp: 1.0, enemyDamage: 1.0, enemySpeed: 1.0, crownBase: 6, next: null }
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
      { id: 'p1', type: 'palisade', x: 107, y: 625 },
      { id: 'p2', type: 'archer', x: 178, y: 571 },
      { id: 'p3', type: 'barracks', x: 265, y: 513 },
      { id: 'p4', type: 'cannon', x: 374, y: 418 },
      { id: 'p5', type: 'mine', x: 398, y: 626 },
      { id: 'p6', type: 'repair', x: 303, y: 300 },
      { id: 'p7', type: 'beacon', x: 216, y: 361 },
      { id: 'p8', type: 'palisade', x: 172, y: 249 },
      { id: 'p9', type: 'archer', x: 88, y: 318 },
      { id: 'p10', type: 'cannon', x: 70, y: 529 },
      { id: 'p11', type: 'trap', x: 318, y: 462 },
      { id: 'p12', type: 'wall', x: 225, y: 451 },
      { id: 'p13', type: 'banner', x: 283, y: 597 },
      { id: 'p14', type: 'trap', x: 201, y: 405 },
      { id: 'p15', type: 'wall', x: 230, y: 287 },
      { id: 'p16', type: 'archer', x: 388, y: 565 },
      { id: 'p17', type: 'village', x: 62, y: 688 },
      { id: 'p18', type: 'market', x: 391, y: 691 },
      { id: 'p19', type: 'outpost', x: 414, y: 332 },
      { id: 'p20', type: 'training', x: 305, y: 674 },
      { id: 'p21', type: 'keep', x: 82, y: 415 },
      { id: 'p22', type: 'archer', x: 421, y: 247, territory: 2 },
      { id: 'p23', type: 'cannon', x: 75, y: 214, territory: 2 },
      { id: 'p24', type: 'wall', x: 329, y: 229, territory: 2 },
      { id: 'p25', type: 'trap', x: 414, y: 492, territory: 2 },
      { id: 'p26', type: 'barracks', x: 55, y: 606, territory: 3 },
      { id: 'p27', type: 'cannon', x: 426, y: 173, territory: 3 },
      { id: 'p28', type: 'beacon', x: 98, y: 154, territory: 3 }
    ]
  };


  C.stageGoals = {
    meadow: {
      title: '防衛都市前線',
      intro: '防衛都市前線は、国境の防衛都市へ敵軍が迫る標準防衛マップ。まず城前を守り、次に合流地点・左側道・右下の金鉱へ判断を広げる。',
      opening: '序盤は弓塔と柵で城前を固める。余裕が出たら右下の金鉱を取りに行く。ただし右迂回路が近く、欲張ると前線対応が遅れる。',
      winTip: '合流地点に大砲、左側道に兵舎、城前に柵と弓塔を置けると安定する。金鉱は早いほど得だが、守りを薄くしすぎない。',
      loseTip: '城前だけに寄せすぎると左右同時進軍で崩れる。合流地点に大砲、左側道に兵舎を置き、主人公は危険な側へ走る。'
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


  C.activeFacilityTypes = ['palisade', 'archer', 'cannon', 'barracks', 'mine'];
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
    river: {
      name: '川辺', rule: '川で左右が分断される。東西どちらへ主人公を走らせるかが重要。',
      bgTop: '#61a871', bgMid: '#347f5c', bgBottom: '#225e4b',
      blob: 'rgba(22, 91, 75, 0.52)', tree: '#1e5c50', treeTop: '#2d7665',
      roadOuter: '#dfc08e', roadInner: '#bd8f5c', water: 'rgba(60, 140, 190, 0.58)',
      object: 'reed'
    },
    pass: {
      name: '峠', rule: '道が狭く敵が硬い。壁・大砲・修理小屋の価値が高い。',
      bgTop: '#8b815f', bgMid: '#665f47', bgBottom: '#454333',
      blob: 'rgba(55, 50, 38, 0.50)', tree: '#384631', treeTop: '#4f5d3d',
      roadOuter: '#d0b17d', roadInner: '#a98558', water: 'rgba(49, 56, 67, 0.34)',
      object: 'rock'
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
    tutorial: { main: C.path, side: C.sidePath }
  };

  C.routeLabels = {
    meadow: { main: '主街道', left: '左側道', side: '右迂回路' },
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
    tutorial: [
      { id: 'tutorial_cache', name: '前線の物資箱', kind: 'cache', x: 72, y: 706, rewardCoins: 60, note: '強化練習用の資金を確保。' },
      { id: 'tutorial_mine', name: '練習用の金脈', kind: 'resource', x: 426, y: 704, rewardCoins: 30, note: '金鉱を建てる意味を確認する地点。' }
    ]
  };

  C.discoveryPads = {
    meadow: [],
    tutorial: []
  };

  for (const key of Object.keys(C.stagePadLayouts)) {
    C.stagePadLayouts[key] = C.stagePadLayouts[key].concat(C.discoveryPads[key] || []);
  }

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
    const offset = pad.type === 'training' ? 50 : 44;
    pad.x = Math.round(Math.max(42, Math.min(C.w - 42, nearest.x + nx * sideHint * offset)));
    pad.y = Math.round(Math.max(146, Math.min(C.h - 48, nearest.y + ny * sideHint * offset)));
    pad.placement = 'road-side';
  }

  for (const [stageKey, pads] of Object.entries(C.stagePadLayouts)) {
    pads.forEach((pad, index) => normalizePadPlacement(stageKey, pad, index));
  }


  C.facilityUi = {
    palisade: { category: 'defense', icon: '柵', short: '安い足止め', timing: '道の中央で敵を止める。弓塔や大砲の前に置くと強い。' },
    archer: { category: 'attack', icon: '弓', short: '安定遠距離火力', timing: '最初の火力。道を長く撃てる脇に置く。' },
    cannon: { category: 'attack', icon: '砲', short: '範囲火力', timing: '敵が合流する地点の脇に置く。群れに強い。' },
    barracks: { category: 'support', icon: '兵舎', short: '兵士で足止め', timing: '道の脇に置く。兵士が出て敵を止める。' },
    mine: { category: 'economy', icon: '金', short: '定期収入', timing: '早いほど得。ただし右迂回路が近く、防衛が薄いと危険。' }
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

  // v3.4.0 focused balance: five core facilities only for the main map.
  Object.assign(C.facilityTypes.palisade, { cost: 38, hp: 385, upgradeCost: 48 });
  Object.assign(C.facilityTypes.archer, { cost: 72, cooldown: 555, damage: 18, range: 172 });
  Object.assign(C.facilityTypes.cannon, { cost: 145, cooldown: 1260, damage: 44, splash: 66, range: 134 });
  Object.assign(C.facilityTypes.mine, { cost: 112, incomeTime: 3800, income: 14 });
  Object.assign(C.facilityTypes.barracks, { cost: 92, spawnTime: 3500, range: 136 });

  C.facilityLevelStats = {
    palisade: {
      1: { hp: 385, blockRadius: 32, upgradeCost: 48 },
      2: { hp: 540, blockRadius: 35, upgradeCost: 78 },
      3: { hp: 760, blockRadius: 38, upgradeCost: 116 },
      4: { hp: 1040, blockRadius: 42, upgradeCost: null }
    },
    archer: {
      1: { hp: 150, damage: 18, range: 172, cooldown: 555, upgradeCost: 70 },
      2: { hp: 192, damage: 24, range: 188, cooldown: 505, upgradeCost: 108 },
      3: { hp: 238, damage: 32, range: 204, cooldown: 462, upgradeCost: 152 },
      4: { hp: 292, damage: 42, range: 222, cooldown: 418, upgradeCost: null }
    },
    cannon: {
      1: { hp: 170, damage: 44, range: 134, cooldown: 1260, splash: 66, upgradeCost: 126 },
      2: { hp: 220, damage: 58, range: 144, cooldown: 1190, splash: 74, upgradeCost: 178 },
      3: { hp: 280, damage: 76, range: 156, cooldown: 1120, splash: 84, upgradeCost: 236 },
      4: { hp: 350, damage: 100, range: 170, cooldown: 1030, splash: 96, upgradeCost: null }
    },
    barracks: {
      1: { hp: 195, range: 136, spawnTime: 3500, upgradeCost: 88 },
      2: { hp: 250, range: 148, spawnTime: 3100, upgradeCost: 132 },
      3: { hp: 320, range: 162, spawnTime: 2700, upgradeCost: 182 },
      4: { hp: 400, range: 178, spawnTime: 2300, upgradeCost: null }
    },
    mine: {
      1: { hp: 130, income: 14, incomeTime: 3800, upgradeCost: 104 },
      2: { hp: 168, income: 20, incomeTime: 3500, upgradeCost: 148 },
      3: { hp: 215, income: 27, incomeTime: 3180, upgradeCost: 198 },
      4: { hp: 275, income: 36, incomeTime: 2860, upgradeCost: null }
    }
  };

  C.facilityUpgradeHints = {
    palisade: {
      2: '耐久と足止め範囲が上がる',
      3: 'さらに硬くなり、前線が崩れにくくなる',
      4: '最終防衛線として大群を止めやすくなる'
    },
    archer: {
      2: '攻撃力・射程・連射が上がる',
      3: '城前から広い道を撃てる主力火力になる',
      4: '単体処理の主力。走り兵にも対応しやすい'
    },
    cannon: {
      2: '範囲火力と爆風が上がる',
      3: '合流地点の群れ処理が安定する',
      4: '最終進軍の密集敵に強い決戦火力になる'
    },
    barracks: {
      2: '兵士の出撃が早くなり、反応範囲も広がる',
      3: '側道の足止めを任せやすくなる',
      4: '左右同時進軍でも前線維持しやすくなる'
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

  const ASSET_VERSION = 'v3.5.3';

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
    allyArcher: 'assets/images/allies/ally_archer.png',
    allySpearman: 'assets/images/allies/ally_spearman.png',
    allyEngineer: 'assets/images/allies/ally_engineer.png',
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
    allyArcherAttack1: 'assets/images/allies/attack/ally_archer_attack_1.png',
    allyArcherAttack2: 'assets/images/allies/attack/ally_archer_attack_2.png',
    allyArcherAttack3: 'assets/images/allies/attack/ally_archer_attack_3.png',
    allyArcherAttack4: 'assets/images/allies/attack/ally_archer_attack_4.png',
    allyEngineerAttack1: 'assets/images/allies/attack/ally_engineer_attack_1.png',
    allyEngineerAttack2: 'assets/images/allies/attack/ally_engineer_attack_2.png',
    allyEngineerAttack3: 'assets/images/allies/attack/ally_engineer_attack_3.png',
    allyEngineerAttack4: 'assets/images/allies/attack/ally_engineer_attack_4.png',
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
    buildingPalisade: 'assets/images/buildings/building_palisade.png',
    buildingPalisadeLv1: 'assets/images/buildings/levels/building_palisade_lv1.png',
    buildingPalisadeLv2: 'assets/images/buildings/levels/building_palisade_lv2.png',
    buildingPalisadeLv3: 'assets/images/buildings/levels/building_palisade_lv3.png',
    buildingPalisadeLv4: 'assets/images/buildings/levels/building_palisade_lv4.png',
    buildingStoneWall: 'assets/images/buildings/building_stone_wall.png',
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
    buildingRepairHut: 'assets/images/buildings/building_repair_hut.png',
    buildingSignalBeacon: 'assets/images/buildings/building_signal_beacon.png',
    buildingWarBanner: 'assets/images/buildings/building_war_banner.png',
    buildingOutpost: 'assets/images/buildings/building_outpost.png',
    buildingMarket: 'assets/images/buildings/building_market.png',
    buildingVillage: 'assets/images/buildings/building_village.png',
    buildingRoyalKeep: 'assets/images/buildings/building_royal_keep.png',
    buildingSpikeTrap: 'assets/images/buildings/building_spike_trap.png',
    tileGrass: 'assets/images/terrain/tile_grass.png',
    tileDirt: 'assets/images/terrain/tile_dirt.png',
    tileRoad: 'assets/images/terrain/tile_road.png',
    tileRiver: 'assets/images/terrain/tile_river.png',
    tileBridge: 'assets/images/terrain/tile_bridge.png',
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

    buildingPalisadeThorns: 'assets/images/buildings/upgrades/building_palisade_thorns.png',
    buildingPalisadeReinforced: 'assets/images/buildings/upgrades/building_palisade_reinforced.png',
    buildingStoneWallBastion: 'assets/images/buildings/upgrades/building_stone_wall_bastion.png',
    buildingStoneWallGate: 'assets/images/buildings/upgrades/building_stone_wall_gate.png',
    buildingArcherTowerLongbow: 'assets/images/buildings/upgrades/building_archer_tower_longbow.png',
    buildingArcherTowerRapid: 'assets/images/buildings/upgrades/building_archer_tower_rapid.png',
    buildingCannonHeavy: 'assets/images/buildings/upgrades/building_cannon_heavy.png',
    buildingCannonScatter: 'assets/images/buildings/upgrades/building_cannon_scatter.png',
    buildingBarracksShield: 'assets/images/buildings/upgrades/building_barracks_shield.png',
    buildingBarracksSpear: 'assets/images/buildings/upgrades/building_barracks_spear.png',
    buildingGoldMineTax: 'assets/images/buildings/upgrades/building_gold_mine_tax.png',
    buildingGoldMineVault: 'assets/images/buildings/upgrades/building_gold_mine_vault.png',
    buildingRepairHutFieldwork: 'assets/images/buildings/upgrades/building_repair_hut_fieldwork.png',
    buildingRepairHutWorkshop: 'assets/images/buildings/upgrades/building_repair_hut_workshop.png',
    buildingSpikeTrapBarbed: 'assets/images/buildings/upgrades/building_spike_trap_barbed.png',
    buildingSpikeTrapFrost: 'assets/images/buildings/upgrades/building_spike_trap_frost.png',
    buildingWarBannerMorale: 'assets/images/buildings/upgrades/building_war_banner_morale.png',
    buildingWarBannerCommand: 'assets/images/buildings/upgrades/building_war_banner_command.png',
    buildingSignalBeaconScout: 'assets/images/buildings/upgrades/building_signal_beacon_scout.png',
    buildingSignalBeaconRally: 'assets/images/buildings/upgrades/building_signal_beacon_rally.png',
    buildingVillageLv2: 'assets/images/buildings/upgrades/building_village_lv2.png',
    buildingMarketLv2: 'assets/images/buildings/upgrades/building_market_lv2.png',
    buildingOutpostLv2: 'assets/images/buildings/upgrades/building_outpost_lv2.png',
    buildingTrainingYard: 'assets/images/buildings/upgrades/building_training_yard.png',
    buildingRoyalKeepLv2: 'assets/images/buildings/upgrades/building_royal_keep_lv2.png',
    tileGrassMeadow: 'assets/images/terrain/stage/tile_grass_meadow.png',
    tileRoadMeadow: 'assets/images/terrain/stage/tile_road_meadow.png',
    tileDirtMeadow: 'assets/images/terrain/stage/tile_dirt_meadow.png',
    tileGrassRiver: 'assets/images/terrain/stage/tile_grass_river.png',
    tileRoadRiver: 'assets/images/terrain/stage/tile_road_river.png',
    tileDirtRiver: 'assets/images/terrain/stage/tile_dirt_river.png',
    tileGrassPass: 'assets/images/terrain/stage/tile_grass_pass.png',
    tileRoadPass: 'assets/images/terrain/stage/tile_road_pass.png',
    tileDirtPass: 'assets/images/terrain/stage/tile_dirt_pass.png',
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

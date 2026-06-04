(function () {
  'use strict';

  const C = {
    w: 480,
    h: 800,
    castle: { x: 136, y: 194, hp: 390, r: 38 },
    kingStart: { x: 244, y: 666 },
    startCoins: 140,
    coinPickupRange: 42,
    kingSpeed: 202,
    payRate: 98,
    buildHoldTime: 620,
    maxCoinsOnGround: 95,
    saveKey: 'game-tower-defense-v286-save',
    audioKey: 'game-tower-defense-v286-audio',
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
        name: '軍旗', cost: 116, upgradeCost: 90, hp: 120, aura: true, range: 132,
        color: '#8d3f42', accent: '#ffd6a2', desc: '近くの兵士を強化する。',
        options: [
          { key: 'morale', name: '士気の旗', desc: '兵士の攻撃力を上げる。' },
          { key: 'command', name: '指揮の旗', desc: '兵士の反応範囲を広げる。' }
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
        name: '王の砦', cost: 172, upgradeCost: 138, hp: 260, development: true,
        castleHpBonus: 80, popBonus: 2, kingHpBonus: 8,
        color: '#5d6378', accent: '#dce5ff', desc: '城と王を強化する。'
      }
    },
    waves: [
      { title: '偵察部隊', note: '最初の道に軽い敵が来る。', groups: [{ type: 'grunt', count: 12, gap: 360, route: 'main' }, { type: 'runner', count: 5, gap: 480, route: 'side' }] },
      { title: '二方向からの侵攻', note: '2本の道から敵が来る。', groups: [{ type: 'grunt', count: 18, gap: 250, route: 'main' }, { type: 'runner', count: 12, gap: 330, route: 'side' }] },
      { title: '盾兵の圧力', note: '防御の硬い敵がタワー攻撃に耐える。', groups: [{ type: 'shield', count: 10, gap: 520, route: 'main' }, { type: 'grunt', count: 21, gap: 210, route: 'side' }] },
      { title: '破壊兵', note: '露出した施設が狙われる。', groups: [{ type: 'saboteur', count: 10, gap: 420, route: 'side' }, { type: 'brute', count: 7, gap: 720, route: 'main' }, { type: 'runner', count: 12, gap: 260, route: 'side' }] },
      { title: '爆弾襲撃', note: '爆弾兵が防衛線で爆発する。', groups: [{ type: 'runner', count: 12, gap: 210, route: 'side' }, { type: 'bomber', count: 8, gap: 560, route: 'main' }, { type: 'grunt', count: 24, gap: 160, route: 'main' }] },
      { title: '呪術兵の護衛', note: '呪術兵が周囲の敵を回復する。早めに倒す。', groups: [{ type: 'shield', count: 10, gap: 360, route: 'main' }, { type: 'shaman', count: 5, gap: 760, route: 'side' }, { type: 'brute', count: 8, gap: 560, route: 'side' }] },
      { title: '破城部隊', note: '破城槌が壁や柵を素早く壊す。', groups: [{ type: 'siege', count: 5, gap: 980, route: 'main' }, { type: 'bomber', count: 6, gap: 620, route: 'side' }, { type: 'shield', count: 12, gap: 340, route: 'main' }, { type: 'runner', count: 18, gap: 220, route: 'side' }] },
      { title: '将軍襲来', note: 'ボスの周囲で敵が加速する。', boss: true, groups: [{ type: 'runner', count: 18, gap: 210, route: 'side' }, { type: 'shield', count: 12, gap: 340, route: 'main' }, { type: 'saboteur', count: 8, gap: 360, route: 'side' }, { type: 'brute', count: 8, gap: 560, route: 'main' }, { type: 'warlord', count: 1, gap: 900, route: 'main' }] },
      { title: '大将軍の包囲', note: '最終ボスと破城部隊が両方の道から攻める。', boss: true, groups: [{ type: 'siege', count: 4, gap: 900, route: 'main' }, { type: 'shaman', count: 4, gap: 850, route: 'side' }, { type: 'bomber', count: 8, gap: 500, route: 'main' }, { type: 'runner', count: 22, gap: 190, route: 'side' }, { type: 'overlord', count: 1, gap: 1200, route: 'side' }, { type: 'shield', count: 16, gap: 300, route: 'main' }] }
    ],
    stages: {
      meadow: { key: 'meadow', order: 0, name: '国境の草原', desc: '基本を覚える標準ステージ。', waveCount: 5, castleHp: 390, startCoinsBonus: 0, enemyHp: 0.92, enemyDamage: 0.92, enemySpeed: 0.98, crownBase: 3, next: 'river' },
      river: { key: 'river', order: 1, name: '双川の道', desc: '長めの防衛。脇道からの圧力が強い。', waveCount: 7, castleHp: 370, startCoinsBonus: 20, enemyHp: 1.06, enemyDamage: 1.04, enemySpeed: 1.03, crownBase: 5, next: 'pass' },
      pass: { key: 'pass', order: 2, name: '包囲の峠', desc: 'ボス戦まで含む長期防衛ステージ。', waveCount: 9, castleHp: 360, startCoinsBonus: 38, enemyHp: 1.18, enemyDamage: 1.14, enemySpeed: 1.06, crownBase: 8, next: null }
    },
    difficulties: {
      normal: { key: 'normal', name: 'ふつう', enemyHp: 1, enemyDamage: 1, enemySpeed: 1, startCoins: 1, crownMult: 1, scoreMult: 1 },
      hard: { key: 'hard', name: 'むずかしい', enemyHp: 1.18, enemyDamage: 1.15, enemySpeed: 1.05, startCoins: 0.92, crownMult: 1.55, scoreMult: 1.25 },
      nightmare: { key: 'nightmare', name: '悪夢', enemyHp: 1.42, enemyDamage: 1.32, enemySpeed: 1.10, startCoins: 0.84, crownMult: 2.35, scoreMult: 1.55 }
    },
    metaUpgrades: {
      startingCoins: { name: '王国金庫', desc: 'レベルごとに初期コイン +25。', max: 5, baseCost: 2 },
      kingTraining: { name: '王の鍛錬', desc: 'レベルごとに王の最大HP +12。', max: 5, baseCost: 2 },
      castleMasonry: { name: '城壁補強', desc: 'レベルごとに城の最大HP +50。', max: 5, baseCost: 3 },
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
      title: '基礎防衛',
      intro: '草原は基本ステージ。まず城に近い道を弓塔・柵で固め、余裕が出たら金鉱や村を発見する。',
      opening: '弓塔・柵・金鉱の3択で迷うのが最初の判断。敵が多い道に火力、金が足りない時は経済。',
      winTip: '次は、城周辺を固めすぎず外側の開拓も試す。',
      loseTip: '城近くの足止めが薄い可能性が高い。柵や壁で敵を止めて、弓塔で削る。'
    },
    river: {
      title: '分岐対応',
      intro: '川辺は左右の道が分かれる。王をどちらへ走らせるか、拠点を守るか城を守るかを早めに決める。',
      opening: '左右どちらかを過剰防衛しすぎない。橋周辺の修理・壁が中盤で効く。',
      winTip: '敵の多い側だけでなく、略奪隊が来る側にも最低限の防衛線を置く。',
      loseTip: '二方向対応が遅れている。片側は施設で自動防衛、もう片側は王で補助する。'
    },
    pass: {
      title: '長期防衛',
      intro: '峠は長期戦。壁・大砲・修理小屋の組み合わせで防衛線を維持する。',
      opening: '序盤に経済へ寄せすぎると硬い敵に押し切られる。防衛線を作ってから開拓する。',
      winTip: '終盤は大砲と修理小屋の位置が勝敗を分ける。',
      loseTip: '硬い敵と破城槌への対策不足。壁・大砲・修理小屋を同じ前線に集める。'
    }
  };

  C.balance = {
    waveRest: 4300,
    firstWaveRest: 1100,
    raidSuppression: 0.88,
    recommendationRadius: 118
  };


  C.stageThemes = {
    meadow: {
      name: '草原', rule: '標準地形。建設床が素直で、基本戦略を試しやすい。',
      bgTop: '#55aa63', bgMid: '#348a52', bgBottom: '#256443',
      blob: 'rgba(27, 76, 55, 0.55)', tree: '#1f6348', treeTop: '#2b7956',
      roadOuter: '#e1c693', roadInner: '#c79e68', water: 'rgba(34,64,100,0.28)',
      object: 'tree'
    },
    river: {
      name: '川辺', rule: '川で左右が分断される。東西どちらへ王を走らせるかが重要。',
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
    meadow: { main: C.path, side: C.sidePath },
    river: {
      main: [
        { x: 34, y: 764 }, { x: 64, y: 700 }, { x: 92, y: 632 }, { x: 145, y: 570 },
        { x: 212, y: 526 }, { x: 273, y: 466 }, { x: 284, y: 389 }, { x: 236, y: 314 },
        { x: 185, y: 250 }, { x: 144, y: 203 }
      ],
      side: [
        { x: 448, y: 764 }, { x: 414, y: 692 }, { x: 383, y: 619 }, { x: 328, y: 560 },
        { x: 297, y: 492 }, { x: 322, y: 414 }, { x: 302, y: 343 }, { x: 232, y: 282 },
        { x: 174, y: 232 }, { x: 144, y: 203 }
      ]
    },
    pass: {
      main: [
        { x: 54, y: 760 }, { x: 96, y: 702 }, { x: 120, y: 635 }, { x: 170, y: 582 },
        { x: 225, y: 520 }, { x: 250, y: 445 }, { x: 224, y: 374 }, { x: 178, y: 304 },
        { x: 150, y: 238 }, { x: 144, y: 203 }
      ],
      side: [
        { x: 426, y: 764 }, { x: 405, y: 700 }, { x: 358, y: 654 }, { x: 317, y: 594 },
        { x: 311, y: 515 }, { x: 357, y: 452 }, { x: 335, y: 374 }, { x: 265, y: 319 },
        { x: 190, y: 254 }, { x: 144, y: 203 }
      ]
    }
  };

  C.routeLabels = {
    meadow: { main: '正面の道', side: '東の道' },
    river: { main: '西の川道', side: '東の川道' },
    pass: { main: '南の峠道', side: '東の山道' }
  };

  C.stagePadLayouts = {
    meadow: C.pads,
    river: C.pads.map((p, i) => ({
      ...p,
      x: Math.max(42, Math.min(438, p.x + (i % 2 === 0 ? -18 : 18))),
      y: Math.max(146, Math.min(720, p.y + (i % 3 === 0 ? 10 : -8)))
    })).concat([
      { id: 'r29', type: 'repair', x: 246, y: 478, territory: 2 },
      { id: 'r30', type: 'wall', x: 350, y: 356, territory: 2 },
      { id: 'r31', type: 'mine', x: 430, y: 705, territory: 3 }
    ]),
    pass: C.pads.map((p, i) => ({
      ...p,
      x: Math.max(42, Math.min(438, p.x + (i % 4 === 0 ? 22 : i % 4 === 1 ? -16 : 0))),
      y: Math.max(146, Math.min(720, p.y + (i % 5 === 0 ? -20 : i % 5 === 1 ? 14 : 0)))
    })).concat([
      { id: 'm29', type: 'cannon', x: 260, y: 408, territory: 2 },
      { id: 'm30', type: 'wall', x: 205, y: 337, territory: 2 },
      { id: 'm31', type: 'repair', x: 123, y: 522, territory: 3 },
      { id: 'm32', type: 'banner', x: 332, y: 540, territory: 3 }
    ])
  };


  C.discoveryRevealRadius = 76;
  C.discoveryPoints = {
    meadow: [
      { id: 'meadow_cache', name: '古い物資庫', kind: 'cache', x: 392, y: 164, rewardCoins: 45, note: '前線用の資材を発見。コインを獲得。' },
      { id: 'meadow_mine', name: '隠れ金鉱', kind: 'resource', x: 426, y: 704, rewardCoins: 25, note: '周辺の金鉱建設床が使える。' },
      { id: 'meadow_hamlet', name: '小さな集落', kind: 'village', x: 62, y: 714, rewardPop: 3, note: '人口上限が増え、村の建設床が使える。' },
      { id: 'meadow_watch', name: '古い見張り台', kind: 'outpost', x: 430, y: 330, rewardCoins: 20, note: '外縁の前哨建設床が使える。' }
    ],
    river: [
      { id: 'river_cache', name: '川辺の物資庫', kind: 'cache', x: 72, y: 676, rewardCoins: 40, note: '川沿いの隠し資材を発見。' },
      { id: 'river_bridgepost', name: '橋の前哨跡', kind: 'outpost', x: 246, y: 478, rewardCoins: 20, note: '橋周辺の修理・防衛床が使える。' },
      { id: 'river_market', name: '川商人の市', kind: 'market', x: 430, y: 704, rewardCoins: 30, economyBonus: 0.04, note: '経済効率が少し上がる。' },
      { id: 'river_shrine', name: '水辺の祠', kind: 'shrine', x: 370, y: 220, rewardPop: 2, note: '人口上限が少し増える。' }
    ],
    pass: [
      { id: 'pass_cache', name: '山道の兵站庫', kind: 'cache', x: 96, y: 702, rewardCoins: 50, note: '峠の物資を発見。' },
      { id: 'pass_bastion', name: '崩れた砦', kind: 'outpost', x: 260, y: 408, rewardCoins: 25, note: '峠中央の大砲床が使える。' },
      { id: 'pass_repaircamp', name: '整備小屋跡', kind: 'repair', x: 124, y: 522, rewardPop: 2, note: '修理拠点の建設床が使える。' },
      { id: 'pass_signal', name: '狼煙の高台', kind: 'beacon', x: 332, y: 540, rewardCoins: 25, note: '軍旗・狼煙台の建設床が使える。' }
    ]
  };

  C.discoveryPads = {
    meadow: [
      { id: 'dm1', type: 'mine', x: 432, y: 704, territory: 1, requiresDiscovery: 'meadow_mine' },
      { id: 'dm2', type: 'market', x: 388, y: 742, territory: 1, requiresDiscovery: 'meadow_mine' },
      { id: 'dm3', type: 'village', x: 62, y: 720, territory: 1, requiresDiscovery: 'meadow_hamlet' },
      { id: 'dm4', type: 'outpost', x: 432, y: 332, territory: 1, requiresDiscovery: 'meadow_watch' }
    ],
    river: [
      { id: 'dr1', type: 'repair', x: 246, y: 478, territory: 1, requiresDiscovery: 'river_bridgepost' },
      { id: 'dr2', type: 'wall', x: 350, y: 356, territory: 1, requiresDiscovery: 'river_bridgepost' },
      { id: 'dr3', type: 'market', x: 430, y: 705, territory: 1, requiresDiscovery: 'river_market' },
      { id: 'dr4', type: 'beacon', x: 370, y: 220, territory: 1, requiresDiscovery: 'river_shrine' }
    ],
    pass: [
      { id: 'dp1', type: 'cannon', x: 260, y: 408, territory: 1, requiresDiscovery: 'pass_bastion' },
      { id: 'dp2', type: 'wall', x: 205, y: 337, territory: 1, requiresDiscovery: 'pass_bastion' },
      { id: 'dp3', type: 'repair', x: 123, y: 522, territory: 1, requiresDiscovery: 'pass_repaircamp' },
      { id: 'dp4', type: 'banner', x: 332, y: 540, territory: 1, requiresDiscovery: 'pass_signal' }
    ]
  };

  for (const key of Object.keys(C.stagePadLayouts)) {
    C.stagePadLayouts[key] = C.stagePadLayouts[key].concat(C.discoveryPads[key] || []);
  }




  C.facilityUi = {
    palisade: { category: 'defense', icon: '柵', short: '安い足止め', timing: '序盤の道止め。弓塔の前に置くと強い。' },
    wall: { category: 'defense', icon: '壁', short: '高耐久の防衛線', timing: '敵が漏れる道や終盤の前線維持に使う。' },
    archer: { category: 'attack', icon: '弓', short: '安定遠距離火力', timing: '最初の火力。道を長く撃てる場所が強い。' },
    cannon: { category: 'attack', icon: '砲', short: '範囲火力', timing: '群れが増える中盤から価値が上がる。' },
    barracks: { category: 'support', icon: '兵', short: '兵士で足止め', timing: '壁だけで止まらない時に道の脇へ置く。' },
    mine: { category: 'economy', icon: '金', short: '定期収入', timing: '早いほど得。ただし防衛が薄いと損をする。' },
    repair: { category: 'support', icon: '修', short: '周辺施設を修理', timing: '壁・砲台が集中する防衛線の後ろへ。' },
    trap: { category: 'defense', icon: '罠', short: '一撃と鈍足', timing: '敵が密集して通る細い道に置く。' },
    banner: { category: 'support', icon: '旗', short: '兵士強化', timing: '兵舎を複数使う時に価値が高い。' },
    beacon: { category: 'support', icon: '火', short: '索敵支援', timing: '広いマップで反応範囲を広げたい時。' },
    village: { category: 'economy', icon: '村', short: '人口上限と小収入', timing: '兵舎を使う前にあると兵力が伸びる。' },
    market: { category: 'economy', icon: '市', short: '収入効率を強化', timing: 'コイン回収が安定してから建てる。' },
    outpost: { category: 'support', icon: '前', short: '領土拡大', timing: '外側の建設床を使いたい時に優先。' },
    training: { category: 'support', icon: '訓', short: '兵士全体を強化', timing: '兵舎中心のビルドで中盤以降に強い。' },
    keep: { category: 'defense', icon: '砦', short: '城と王を強化', timing: '城HPが削られる展開の保険。' }
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

  // v2.8.5 balance pass: keep several viable plans alive instead of making one best opening obvious.
  Object.assign(C.facilityTypes.palisade, { cost: 42, hp: 350 });
  Object.assign(C.facilityTypes.wall, { cost: 92, hp: 560 });
  Object.assign(C.facilityTypes.archer, { cost: 82, cooldown: 570, damage: 17 });
  Object.assign(C.facilityTypes.cannon, { cost: 158, cooldown: 1280, damage: 42, splash: 62 });
  Object.assign(C.facilityTypes.mine, { cost: 128, incomeTime: 4100, income: 12 });
  Object.assign(C.facilityTypes.repair, { cost: 88, range: 132, repairRate: 13 });
  Object.assign(C.facilityTypes.trap, { cost: 56, cooldown: 980, damage: 44 });
  Object.assign(C.facilityTypes.barracks, { cost: 106, spawnTime: 3800 });
  Object.assign(C.facilityTypes.village, { cost: 82, popBonus: 4, income: 7 });
  Object.assign(C.facilityTypes.market, { cost: 116, incomeTime: 5200, income: 8, economyBonus: 0.10 });
  Object.assign(C.facilityTypes.outpost, { cost: 122, hp: 260 });
  Object.assign(C.facilityTypes.keep, { cost: 164, castleHpBonus: 70 });

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
    scalePointArrayForWorld(stage.main);
    scalePointArrayForWorld(stage.side);
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


  window.KBD_CONFIG = C;
})();

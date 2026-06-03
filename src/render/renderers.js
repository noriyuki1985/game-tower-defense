(function () {
  'use strict';

  const C = window.KBD_CONFIG;
  const { clamp, distXY, rand, rounded } = window.KBD_UTILS;

  class RendererMethods {
    imageReady(key) {
      const img = this.images && this.images[key];
      return img && img.complete && img.naturalWidth > 0;
    }

    drawAsset(ctx, key, x, y, w, h, yOffset = 0) {
      const img = this.images && this.images[key];
      if (!img || !img.complete || img.naturalWidth <= 0) return false;
      ctx.drawImage(img, x - w / 2, y - h / 2 + yOffset, w, h);
      return true;
    }

    drawAssetAnimated(ctx, key, x, y, w, h, opts = {}) {
      const img = this.images && this.images[key];
      if (!img || !img.complete || img.naturalWidth <= 0) return false;
      const alpha = opts.alpha == null ? 1 : opts.alpha;
      const sx = opts.scaleX == null ? 1 : opts.scaleX;
      const sy = opts.scaleY == null ? 1 : opts.scaleY;
      const rot = opts.rotation || 0;
      const yOffset = opts.yOffset || 0;
      ctx.save();
      ctx.globalAlpha *= alpha;
      ctx.translate(x, y + yOffset);
      ctx.rotate(rot);
      ctx.scale(sx, sy);
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
      ctx.restore();
      return true;
    }

    facilityAssetKey(f) {
      const type = typeof f === 'string' ? f : f.type;
      const branch = typeof f === 'string' ? null : f.branch;
      const level = typeof f === 'string' ? 1 : f.level;
      const branchAssets = {
        palisade: { thorns: 'buildingPalisadeThorns', reinforced: 'buildingPalisadeReinforced' },
        wall: { bastion: 'buildingStoneWallBastion', gate: 'buildingStoneWallGate' },
        archer: { longbow: 'buildingArcherTowerLongbow', rapid: 'buildingArcherTowerRapid' },
        cannon: { heavy: 'buildingCannonHeavy', scatter: 'buildingCannonScatter' },
        barracks: { shield: 'buildingBarracksShield', spear: 'buildingBarracksSpear' },
        mine: { tax: 'buildingGoldMineTax', vault: 'buildingGoldMineVault' },
        repair: { fieldwork: 'buildingRepairHutFieldwork', workshop: 'buildingRepairHutWorkshop' },
        trap: { barbed: 'buildingSpikeTrapBarbed', frost: 'buildingSpikeTrapFrost' },
        banner: { morale: 'buildingWarBannerMorale', command: 'buildingWarBannerCommand' },
        beacon: { scout: 'buildingSignalBeaconScout', rally: 'buildingSignalBeaconRally' }
      };
      if (branch && branchAssets[type] && branchAssets[type][branch]) return branchAssets[type][branch];
      if (level >= 2) {
        const levelAssets = {
          village: 'buildingVillageLv2',
          market: 'buildingMarketLv2',
          outpost: 'buildingOutpostLv2',
          training: 'buildingTrainingYard',
          keep: 'buildingRoyalKeepLv2'
        };
        if (levelAssets[type]) return levelAssets[type];
      }
      return {
        palisade: 'buildingPalisade',
        wall: 'buildingStoneWall',
        archer: 'buildingArcherTower',
        cannon: 'buildingCannon',
        barracks: 'buildingBarracks',
        mine: 'buildingGoldMine',
        repair: 'buildingRepairHut',
        trap: 'buildingSpikeTrap',
        banner: 'buildingWarBanner',
        beacon: 'buildingSignalBeacon',
        village: 'buildingVillage',
        market: 'buildingMarket',
        outpost: 'buildingOutpost',
        training: 'buildingBarracks',
        keep: 'buildingRoyalKeep'
      }[type];
    }

    facilityAssetSize(type) {
      return {
        palisade: [76, 62],
        wall: [82, 58],
        archer: [82, 100],
        cannon: [84, 88],
        barracks: [90, 78],
        mine: [88, 74],
        repair: [88, 74],
        trap: [76, 48],
        banner: [58, 88],
        beacon: [70, 90],
        village: [88, 72],
        market: [92, 72],
        outpost: [84, 86],
        training: [86, 74],
        keep: [108, 100]
      }[type] || [74, 74];
    }

    enemyAssetKey(type) {
      return {
        grunt: 'enemyGrunt',
        runner: 'enemyRunner',
        brute: 'enemyBrute',
        shield: 'enemyShield',
        saboteur: 'enemySaboteur',
        bomber: 'enemyBomber',
        shaman: 'enemyShaman',
        siege: 'enemySiegeRam',
        warlord: 'enemyWarlord',
        overlord: 'enemyOverlord'
      }[type] || 'enemyGrunt';
    }

    enemyWalkBaseKey(type) {
      return {
        grunt: 'enemyGrunt',
        runner: 'enemyRunner',
        brute: 'enemyBrute',
        shield: 'enemyShield',
        saboteur: 'enemySaboteur',
        bomber: 'enemyBomber',
        shaman: 'enemyShaman',
        siege: 'enemySiege',
        warlord: 'enemyWarlord',
        overlord: 'enemyOverlord'
      }[type] || 'enemyGrunt';
    }

    enemyWalkFrameKey(enemy) {
      const base = this.enemyWalkBaseKey(enemy.type);
      const stride = enemy.def.siege || enemy.def.boss ? 22 : enemy.type === 'runner' ? 12 : 15;
      const frame = enemy.isWalking === false ? 1 : (Math.floor(((enemy.walkDistance || 0) / stride) + (enemy.animSeed || 0)) % 4) + 1;
      const key = `${base}Walk${frame}`;
      return this.imageReady(key) ? key : this.enemyAssetKey(enemy.type);
    }

    enemyFacingScale(enemy) {
      if (Math.abs(enemy.lastDx || 0) < 0.05) return 1;
      return enemy.lastDx < 0 ? -1 : 1;
    }

    soldierAssetKey(type) {
      return {
        militia: 'allyMilitia',
        shield: 'allyShield',
        spear: 'allySpear',
        archer: 'allyArcher',
        engineer: 'allyEngineer'
      }[type] || 'allyMilitia';
    }

    soldierAttackBaseKey(type) {
      return {
        militia: 'allyMilitia',
        shield: 'allyShield',
        spear: 'allySpear',
        archer: 'allyArcher',
        engineer: 'allyEngineer'
      }[type] || 'allyMilitia';
    }

    soldierFrameAssetKey(s) {
      const normalKey = this.soldierAssetKey(s.type);
      const remaining = Math.max(0, s.attack || 0);
      if (remaining <= 0) return normalKey;
      const max = s.attackMax || 360;
      const progress = clamp(1 - remaining / max, 0, 0.999);
      const frame = Math.floor(progress * 4) + 1;
      const key = `${this.soldierAttackBaseKey(s.type)}Attack${frame}`;
      return this.imageReady(key) ? key : normalKey;
    }

    soldierAttackFrameIndex(s) {
      if (!(s.attack > 0)) return 0;
      const max = s.attackMax || 360;
      return Math.floor(clamp(1 - s.attack / max, 0, 0.999) * 4) + 1;
    }

    render() {
      const ctx = this.ctx;
      ctx.save();
      ctx.clearRect(0, 0, C.w, C.h);
      if (this.shake > 0) ctx.translate(rand(-3, 3), rand(-3, 3));
      this.updateCamera();
      ctx.save();
      ctx.translate(-(this.camera ? this.camera.x : 0), -(this.camera ? this.camera.y : 0));
      this.drawWorld(ctx);
      this.drawCastle(ctx);
      this.drawPads(ctx);
      this.drawFacilities(ctx);
      this.drawSoldiers(ctx);
      this.drawKing(ctx);
      this.drawEnemies(ctx);
      this.drawProjectiles(ctx);
      this.drawCoins(ctx);
      this.drawEffects(ctx);
      ctx.restore();
      this.drawOffscreenMarkers(ctx);
      this.drawHudOnCanvas(ctx);
      this.drawResultFx(ctx);
      ctx.restore();
    }

    drawWorld(ctx) {
      const theme = this.stageTheme();
      const key = this.stageKey();
      const ww = this.worldWidth();
      const wh = this.worldHeight();
      const g = ctx.createLinearGradient(0, 0, 0, wh);
      g.addColorStop(0, theme.bgTop);
      g.addColorStop(0.55, theme.bgMid);
      g.addColorStop(1, theme.bgBottom);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, ww, wh);
      const grassAsset = key === 'river' ? 'tileGrassRiver' : key === 'pass' ? 'tileGrassPass' : 'tileGrassMeadow';
      if (this.imageReady(grassAsset) || this.imageReady('tileGrass')) {
        ctx.save();
        ctx.globalAlpha = key === 'pass' ? 0.16 : 0.20;
        for (let y = -20; y < wh; y += 92) {
          for (let x = -28; x < ww; x += 92) {
            this.drawAsset(ctx, this.imageReady(grassAsset) ? grassAsset : 'tileGrass', x + 46, y + 46, 98, 98);
          }
        }
        ctx.restore();
      }

      if (key === 'river') {
        ctx.fillStyle = theme.water;
        ctx.beginPath();
        ctx.moveTo(214, 120);
        ctx.bezierCurveTo(266, 250, 214, 338, 253, 455);
        ctx.bezierCurveTo(296, 585, 252, 668, 304, 810);
        ctx.lineTo(368, 810);
        ctx.bezierCurveTo(315, 665, 365, 580, 319, 446);
        ctx.bezierCurveTo(282, 334, 337, 242, 281, 120);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(213,239,255,0.28)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(250, 125);
        ctx.bezierCurveTo(296, 254, 245, 351, 286, 454);
        ctx.bezierCurveTo(324, 552, 281, 666, 330, 795);
        ctx.stroke();
      }

      ctx.fillStyle = theme.blob;
      this.blob(ctx, 28, 116, 180, 80);
      this.blob(ctx, 380, 190, 160, 95);
      this.blob(ctx, 392, 720, 140, 80);
      if (key === 'pass') {
        ctx.fillStyle = 'rgba(39, 36, 31, 0.50)';
        this.blob(ctx, 58, 265, 64, 92);
        this.blob(ctx, 421, 350, 76, 116);
        this.blob(ctx, 78, 724, 96, 62);
      }

      const decorationCount = Math.max(32, Math.round((ww * wh) / (C.w * C.h) * 28));
      for (let i = 0; i < decorationCount; i += 1) {
        const x = (i * 83 + 37) % ww;
        const y = 145 + ((i * 137) % Math.max(240, wh - 210));
        if (this.distanceToPath(x, y) <= 42) continue;
        if (theme.object === 'rock') this.drawRock(ctx, x, y, 0.65 + (i % 3) * 0.15);
        else if (theme.object === 'reed') this.drawReed(ctx, x, y, 0.72 + (i % 3) * 0.12);
        else this.drawTree(ctx, x, y, 0.72 + (i % 3) * 0.12);
      }

      const main = this.routePath('main');
      const side = this.routePath('side');
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = theme.roadOuter;
      ctx.lineWidth = key === 'pass' ? 48 : 56;
      this.drawPathLine(ctx, main);
      this.drawPathLine(ctx, side);
      ctx.strokeStyle = theme.roadInner;
      ctx.lineWidth = key === 'pass' ? 32 : 40;
      this.drawPathLine(ctx, main);
      this.drawPathLine(ctx, side);
      ctx.strokeStyle = 'rgba(90,59,34,0.25)';
      ctx.lineWidth = 2;
      this.drawPathLine(ctx, main);
      this.drawPathLine(ctx, side);

      if (key === 'river') {
        ctx.fillStyle = 'rgba(110, 76, 44, 0.82)';
        rounded(ctx, 246, 478, 88, 24, 5);
        ctx.fill();
        rounded(ctx, 286, 344, 92, 22, 5);
        ctx.fill();
      }

      const territoryRadius = ([0, 205, 280, 365][this.kingdom ? this.kingdom.territory : 1] || 205) * (C.worldScaleX || 1);
      ctx.fillStyle = 'rgba(255, 236, 158, 0.045)';
      ctx.beginPath();
      ctx.arc(C.castle.x, C.castle.y + 44, territoryRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 236, 158, 0.22)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(C.castle.x, C.castle.y + 44, territoryRadius, 0, Math.PI * 2);
      ctx.stroke();

      if (key !== 'river') {
        ctx.fillStyle = theme.water;
        this.blob(ctx, 430, 290, 80, 130);
      }
      ctx.fillStyle = key === 'pass' ? '#3c3b36' : '#506775';
      ctx.fillRect(0, wh - 40, ww, 40);
      ctx.fillStyle = key === 'pass' ? '#2b2b28' : '#31424d';
      ctx.fillRect(0, wh - 20, ww, 20);

      ctx.fillStyle = 'rgba(10, 18, 16, 0.35)';
      rounded(ctx, 14, 136, 138, 29, 8);
      ctx.fill();
      ctx.fillStyle = '#fff0bb';
      ctx.font = '800 12px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(`${theme.name} / ${theme.rule}`, 24, 155);
    }

    drawPathLine(ctx, pts) {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i += 1) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.stroke();
    }

    blob(ctx, x, y, w, h) {
      ctx.beginPath();
      ctx.ellipse(x, y, w, h, 0.12, 0, Math.PI * 2);
      ctx.fill();
    }

    drawTree(ctx, x, y, s) {
      ctx.fillStyle = '#3c2b1e';
      ctx.fillRect(x - 2 * s, y + 8 * s, 4 * s, 14 * s);
      ctx.fillStyle = '#1e5f45';
      ctx.beginPath();
      ctx.moveTo(x, y - 18 * s);
      ctx.lineTo(x - 14 * s, y + 10 * s);
      ctx.lineTo(x + 14 * s, y + 10 * s);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#287152';
      ctx.beginPath();
      ctx.moveTo(x, y - 28 * s);
      ctx.lineTo(x - 10 * s, y - 2 * s);
      ctx.lineTo(x + 10 * s, y - 2 * s);
      ctx.closePath();
      ctx.fill();
    }

    drawRock(ctx, x, y, s) {
      ctx.fillStyle = '#474236';
      ctx.beginPath();
      ctx.ellipse(x, y + 8 * s, 16 * s, 10 * s, -0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#6d6554';
      ctx.beginPath();
      ctx.ellipse(x - 3 * s, y + 2 * s, 11 * s, 8 * s, 0.32, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.10)';
      ctx.beginPath();
      ctx.ellipse(x - 6 * s, y - 1 * s, 4 * s, 2 * s, -0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    drawReed(ctx, x, y, s) {
      ctx.strokeStyle = '#265a3d';
      ctx.lineWidth = Math.max(1, 2 * s);
      for (let i = -2; i <= 2; i += 1) {
        ctx.beginPath();
        ctx.moveTo(x + i * 4 * s, y + 14 * s);
        ctx.quadraticCurveTo(x + i * 3 * s, y - 4 * s, x + i * 7 * s, y - 18 * s);
        ctx.stroke();
      }
      ctx.fillStyle = '#c6924c';
      ctx.fillRect(x - 11 * s, y - 20 * s, 5 * s, 14 * s);
      ctx.fillRect(x + 9 * s, y - 16 * s, 5 * s, 13 * s);
    }

    distanceToPath(x, y) {
      let best = Infinity;
      for (const path of [this.routePath('main'), this.routePath('side')]) {
        for (let i = 1; i < path.length; i += 1) {
          const a = path[i - 1];
          const b = path[i];
          const t = clamp(((x - a.x) * (b.x - a.x) + (y - a.y) * (b.y - a.y)) / ((b.x - a.x) ** 2 + (b.y - a.y) ** 2), 0, 1);
          const px = a.x + (b.x - a.x) * t;
          const py = a.y + (b.y - a.y) * t;
          best = Math.min(best, distXY(x, y, px, py));
        }
      }
      return best;
    }

    drawCastle(ctx) {
      const c = this.castle;
      ctx.save();
      if (c.hit > 0) ctx.translate(rand(-2, 2), rand(-2, 2));
      if (this.drawAsset(ctx, 'buildingRoyalKeep', c.x, c.y - 3, 126, 112)) {
        this.drawBar(ctx, c.x - 56, c.y + 56, 112, 9, c.hp / c.maxHp, '#ff6b5e');
        ctx.restore();
        return;
      }
      ctx.fillStyle = 'rgba(255,244,207,0.44)';
      ctx.beginPath();
      ctx.ellipse(c.x, c.y + 26, 77, 34, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#7a593f';
      ctx.fillRect(c.x - 42, c.y - 28, 84, 64);
      ctx.fillStyle = '#5c3d2d';
      ctx.beginPath();
      ctx.moveTo(c.x - 50, c.y - 26);
      ctx.lineTo(c.x, c.y - 72);
      ctx.lineTo(c.x + 50, c.y - 26);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#d7bd7c';
      ctx.fillRect(c.x - 12, c.y + 4, 24, 32);
      ctx.fillStyle = '#f0d26e';
      ctx.beginPath();
      ctx.moveTo(c.x + 10, c.y - 82);
      ctx.lineTo(c.x + 35, c.y - 72);
      ctx.lineTo(c.x + 10, c.y - 62);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#2f211a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(c.x + 10, c.y - 82);
      ctx.lineTo(c.x + 10, c.y - 50);
      ctx.stroke();
      this.drawBar(ctx, c.x - 56, c.y + 52, 112, 9, c.hp / c.maxHp, '#ff6b5e');
      ctx.restore();
    }

    drawPads(ctx) {
      for (const pad of this.pads) {
        const def = C.facilityTypes[pad.type];
        const existing = pad.facilityId ? this.facilities.find((f) => f.id === pad.facilityId) : null;
        if (existing) continue;
        const locked = !this.isPadUnlocked(pad);
        const progress = locked ? 0 : pad.invested / def.cost;
        const pulse = Math.sin(pad.pulse * 0.004) * 0.08 + 1 + (progress > 0 ? Math.sin(this.time * 0.018) * 0.025 : 0);
        ctx.save();
        ctx.translate(pad.x, pad.y);
        ctx.scale(pulse, pulse);
        const padAsset = locked ? 'tileBuildLocked' : progress > 0 ? 'tileBuildActive' : 'tileBuildEmpty';
        if (this.imageReady(padAsset)) {
          ctx.globalAlpha = locked ? 0.78 : 0.92;
          this.drawAsset(ctx, padAsset, 0, 2, 78, 58);
          ctx.globalAlpha = 1;
        } else {
          ctx.fillStyle = locked ? 'rgba(15, 18, 17, 0.62)' : 'rgba(15, 23, 18, 0.48)';
          rounded(ctx, -36, -24, 72, 48, 10);
          ctx.fill();
        }
        ctx.strokeStyle = locked ? 'rgba(220,220,220,0.28)' : def.accent;
        ctx.lineWidth = 2;
        ctx.setLineDash(locked ? [3, 5] : [6, 4]);
        rounded(ctx, -34, -22, 68, 44, 9);
        ctx.stroke();
        ctx.setLineDash([]);
        const nearKing = distXY(this.king.x, this.king.y, pad.x, pad.y) < 42;
        if (nearKing) {
          ctx.strokeStyle = 'rgba(255, 246, 170, 0.95)';
          ctx.lineWidth = 4;
          ctx.setLineDash([]);
          rounded(ctx, -39, -27, 78, 54, 12);
          ctx.stroke();
        }
        if (!locked) {
          ctx.fillStyle = 'rgba(245, 211, 107, 0.24)';
          rounded(ctx, -32, 15, 64 * progress, 6, 3);
          ctx.fill();
        }
        ctx.fillStyle = locked ? '#c3c7bd' : '#fff0bb';
        ctx.font = '700 10px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(locked ? '未解放' : def.name, 0, -5);
        ctx.fillStyle = locked ? '#d8d8d8' : '#ffd35b';
        ctx.font = '800 12px system-ui';
        ctx.fillText(locked ? `領土 ${pad.territory}` : `${Math.ceil(def.cost - pad.invested)}`, 0, 14);
        ctx.restore();
      }
    }

    drawFacilities(ctx) {
      for (const f of this.facilities) {
        ctx.save();
        if (f.hit > 0) ctx.translate(rand(-1.5, 1.5), rand(-1.5, 1.5));
        if (distXY(this.king.x, this.king.y, f.x, f.y) < 38) {
          ctx.strokeStyle = 'rgba(255,236,158,0.34)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.range || 54, 0, Math.PI * 2);
          ctx.stroke();
        }
        if (f.buildFlash > 0) {
          const t = f.buildFlash / 760;
          ctx.strokeStyle = `rgba(255, 239, 160, ${0.25 + t * 0.45})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(f.x, f.y, 34 + (1 - t) * 36, 0, Math.PI * 2);
          ctx.stroke();
        }
        if (f.aura && f.range) {
          const pulse = 0.15 + Math.sin(this.time * 0.004 + f.x) * 0.05;
          ctx.strokeStyle = `rgba(255, 236, 158, ${pulse})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.range, 0, Math.PI * 2);
          ctx.stroke();
        }
        const assetKey = this.facilityAssetKey(f);
        const assetSize = this.facilityAssetSize(f.type);
        const fireT = clamp((f.fire || 0) / 260, 0, 1);
        const workT = clamp((f.work || 0) / 420, 0, 1);
        const spawnT = clamp((f.spawnFlash || 0) / 520, 0, 1);
        const buildT = clamp((f.buildFlash || 0) / 680, 0, 1);
        const baseScale = 1 + (f.level - 1) * 0.06;
        const popScale = 1 + buildT * 0.12 + fireT * 0.06 + spawnT * 0.07;
        const recoil = fireT ? -Math.sin(fireT * Math.PI) * (f.type === 'cannon' ? 7 : 4) : 0;
        const floatY = (f.economy || f.aura) ? Math.sin(this.time * 0.003 + f.x) * 1.3 : 0;
        const usedAsset = assetKey && this.drawAssetAnimated(ctx, assetKey, f.x + Math.cos(f.fireAngle || -Math.PI / 2) * recoil, f.y + floatY, assetSize[0] * baseScale * popScale, assetSize[1] * baseScale * popScale, { yOffset: f.type === 'trap' ? 6 : -4 });
        if (!usedAsset) {
          if (f.type === 'palisade') this.drawPalisade(ctx, f);
          else if (f.type === 'wall') this.drawWall(ctx, f);
          else if (f.type === 'archer') this.drawTower(ctx, f, true);
          else if (f.type === 'cannon') this.drawTower(ctx, f, false);
          else if (f.type === 'barracks') this.drawHouse(ctx, f);
          else if (f.type === 'mine') this.drawMine(ctx, f);
          else if (f.type === 'repair') this.drawRepair(ctx, f);
          else if (f.type === 'trap') this.drawTrap(ctx, f);
          else if (f.type === 'banner') this.drawBanner(ctx, f);
          else if (f.type === 'beacon') this.drawBeacon(ctx, f);
          else if (f.type === 'village') this.drawVillage(ctx, f);
          else if (f.type === 'market') this.drawMarket(ctx, f);
          else if (f.type === 'outpost') this.drawOutpost(ctx, f);
          else if (f.type === 'training') this.drawTraining(ctx, f);
          else if (f.type === 'keep') this.drawKeep(ctx, f);
        }
        if (fireT > 0) {
          ctx.strokeStyle = f.type === 'cannon' ? 'rgba(255,178,92,0.55)' : 'rgba(255,236,158,0.42)';
          ctx.lineWidth = f.type === 'cannon' ? 5 : 3;
          ctx.beginPath();
          ctx.arc(f.x, f.y - 12, 22 + (1 - fireT) * 18, 0, Math.PI * 2);
          ctx.stroke();
        }
        if (workT > 0) {
          ctx.globalAlpha = 0.4 + workT * 0.28;
          ctx.strokeStyle = f.repair ? '#9ee1bb' : '#ffd35b';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(f.x, f.y - 8, 24 + (1 - workT) * 16, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
        this.drawFacilityAttackOverlay(ctx, f, fireT, workT, spawnT);
        this.drawBar(ctx, f.x - 24, f.y + 30, 48, 5, f.hp / f.maxHp, '#86e3a0');
        ctx.fillStyle = '#fff4d0';
        ctx.font = '800 10px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(`Lv.${f.level}`, f.x, f.y + 44);
        const pad = this.pads.find((p) => p.facilityId === f.id);
        if (pad && f.level < 3 && pad.upgradeInvested > 0) {
          const need = this.getUpgradeNeed(f);
          this.drawBar(ctx, f.x - 25, f.y + 50, 50, 5, pad.upgradeInvested / need, '#ffd35b');
        }
        ctx.restore();
      }
    }



    drawFacilityAttackOverlay(ctx, f, fireT, workT, spawnT) {
      const angle = f.fireAngle || -Math.PI / 2;
      const muzzleDist = f.type === 'cannon' ? 26 : f.type === 'archer' ? 24 : 18;
      const mx = f.x + Math.cos(angle) * muzzleDist;
      const my = f.y - 12 + Math.sin(angle) * muzzleDist;
      if (f.type === 'archer' && fireT > 0) {
        ctx.save();
        ctx.strokeStyle = `rgba(255, 240, 185, ${0.28 + fireT * 0.55})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(f.x, f.y - 8);
        ctx.lineTo(mx, my);
        ctx.stroke();
        ctx.fillStyle = `rgba(255, 226, 140, ${0.30 + fireT * 0.45})`;
        ctx.beginPath();
        ctx.arc(mx, my, 6 + (1 - fireT) * 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      if (f.type === 'cannon' && fireT > 0) {
        ctx.save();
        ctx.fillStyle = `rgba(255, 182, 92, ${0.25 + fireT * 0.35})`;
        for (let i = 0; i < 4; i += 1) {
          const spread = (i - 1.5) * 0.16;
          const px = mx + Math.cos(angle + spread) * (12 + (1 - fireT) * 16);
          const py = my + Math.sin(angle + spread) * (12 + (1 - fireT) * 16);
          ctx.beginPath();
          ctx.arc(px, py, 4 + i, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = `rgba(88, 88, 88, ${0.16 + fireT * 0.20})`;
        for (let i = 0; i < 3; i += 1) {
          const px = f.x - Math.cos(angle) * (6 + i * 5);
          const py = f.y - 8 - Math.sin(angle) * (6 + i * 4);
          ctx.beginPath();
          ctx.arc(px, py, 6 + i * 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      if (f.type === 'trap' && fireT > 0) {
        ctx.save();
        ctx.strokeStyle = f.branch === 'frost' ? 'rgba(189, 238, 255, 0.80)' : 'rgba(255, 168, 96, 0.78)';
        ctx.lineWidth = 3;
        for (let i = 0; i < 6; i += 1) {
          const a = (Math.PI * 2 / 6) * i + this.time * 0.004;
          ctx.beginPath();
          ctx.moveTo(f.x + Math.cos(a) * 8, f.y + Math.sin(a) * 2);
          ctx.lineTo(f.x + Math.cos(a) * (18 + (1 - fireT) * 10), f.y + Math.sin(a) * (18 + (1 - fireT) * 10));
          ctx.stroke();
        }
        ctx.restore();
      }
      if (f.type === 'barracks' && spawnT > 0) {
        ctx.save();
        ctx.strokeStyle = `rgba(214, 191, 130, ${0.20 + spawnT * 0.45})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(f.x, f.y + 6, 18 + (1 - spawnT) * 16, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255, 240, 188, 0.75)';
        for (let i = 0; i < 3; i += 1) {
          ctx.beginPath();
          ctx.arc(f.x - 10 + i * 10, f.y - 10 - i * 2, 2 + i * 0.7, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      if (f.type === 'mine' && workT > 0) {
        ctx.save();
        const rise = (1 - workT) * 16;
        ctx.globalAlpha = 0.35 + workT * 0.55;
        ctx.fillStyle = '#ffd35b';
        ctx.beginPath();
        ctx.arc(f.x + 12, f.y - 16 - rise, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(f.x - 6, f.y - 10 - rise * 0.7, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.restore();
      }
      if (f.type === 'repair' && workT > 0) {
        const target = this.facilities.filter((o) => o.id !== f.id && o.hp < o.maxHp && distXY(o.x, o.y, f.x, f.y) <= (f.range || 0)).sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp))[0];
        if (target) {
          ctx.save();
          ctx.strokeStyle = `rgba(158, 225, 187, ${0.28 + workT * 0.52})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(f.x, f.y - 10);
          ctx.lineTo(target.x, target.y - 6);
          ctx.stroke();
          ctx.fillStyle = 'rgba(210, 255, 228, 0.70)';
          ctx.beginPath();
          ctx.arc(target.x, target.y - 6, 6 + workT * 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
      if (f.type === 'banner') {
        ctx.save();
        const wave = Math.sin(this.time * 0.008 + f.x * 0.01) * 8;
        ctx.strokeStyle = 'rgba(255, 214, 162, 0.36)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(f.x + 2, f.y - 28);
        ctx.quadraticCurveTo(f.x + 18 + wave * 0.2, f.y - 38, f.x + 28, f.y - 22 + wave * 0.1);
        ctx.stroke();
        ctx.restore();
      }
      if (f.type === 'beacon') {
        ctx.save();
        ctx.strokeStyle = `rgba(215, 190, 255, ${0.15 + 0.10 * Math.sin(this.time * 0.006)})`;
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i += 1) {
          ctx.beginPath();
          ctx.arc(f.x, f.y - 34, 20 + i * 12 + Math.sin(this.time * 0.004 + i) * 4, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    drawVillage(ctx, f) {
      ctx.fillStyle = '#6f5338';
      ctx.fillRect(f.x - 22, f.y - 11, 44, 32);
      ctx.fillStyle = f.accent;
      ctx.beginPath();
      ctx.moveTo(f.x - 27, f.y - 10);
      ctx.lineTo(f.x, f.y - 35);
      ctx.lineTo(f.x + 27, f.y - 10);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#2b2118';
      ctx.fillRect(f.x - 5, f.y + 5, 10, 16);
      ctx.fillStyle = '#d6f2a3';
      ctx.font = '900 13px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('人口', f.x, f.y - 40);
    }

    drawMarket(ctx, f) {
      ctx.fillStyle = '#49365f';
      rounded(ctx, f.x - 27, f.y - 15, 54, 36, 6);
      ctx.fill();
      ctx.fillStyle = f.accent;
      ctx.fillRect(f.x - 30, f.y - 26, 60, 12);
      ctx.fillStyle = '#ffd35b';
      ctx.beginPath();
      ctx.arc(f.x, f.y + 2, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#5b3d16';
      ctx.font = '900 10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('$', f.x, f.y + 6);
    }

    drawOutpost(ctx, f) {
      ctx.strokeStyle = f.color;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(f.x, f.y + 25);
      ctx.lineTo(f.x, f.y - 32);
      ctx.stroke();
      ctx.fillStyle = f.accent;
      ctx.beginPath();
      ctx.moveTo(f.x + 3, f.y - 33);
      ctx.lineTo(f.x + 34, f.y - 24);
      ctx.lineTo(f.x + 3, f.y - 10);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(169,227,180,0.28)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.range || 120, 0, Math.PI * 2);
      ctx.stroke();
    }

    drawTraining(ctx, f) {
      ctx.fillStyle = '#59372d';
      rounded(ctx, f.x - 30, f.y - 18, 60, 38, 7);
      ctx.fill();
      ctx.strokeStyle = f.accent;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(f.x - 20, f.y + 14);
      ctx.lineTo(f.x + 20, f.y - 20);
      ctx.moveTo(f.x + 20, f.y + 14);
      ctx.lineTo(f.x - 20, f.y - 20);
      ctx.stroke();
    }

    drawKeep(ctx, f) {
      ctx.fillStyle = '#475064';
      ctx.fillRect(f.x - 25, f.y - 22, 50, 46);
      ctx.fillStyle = f.accent;
      ctx.fillRect(f.x - 31, f.y - 34, 62, 14);
      ctx.fillStyle = '#2a3140';
      ctx.fillRect(f.x - 7, f.y + 2, 14, 22);
      ctx.fillStyle = '#ffd35b';
      ctx.beginPath();
      ctx.moveTo(f.x - 12, f.y - 40);
      ctx.lineTo(f.x - 4, f.y - 51);
      ctx.lineTo(f.x + 2, f.y - 41);
      ctx.lineTo(f.x + 10, f.y - 51);
      ctx.lineTo(f.x + 13, f.y - 40);
      ctx.closePath();
      ctx.fill();
    }

    drawPalisade(ctx, f) {
      ctx.strokeStyle = '#5a3a22';
      ctx.lineWidth = 7 + f.level * 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(f.x - 30, f.y + 10);
      ctx.lineTo(f.x + 30, f.y - 10);
      ctx.stroke();
      ctx.strokeStyle = f.accent;
      ctx.lineWidth = 3;
      for (let i = -24; i <= 24; i += 12) {
        ctx.beginPath();
        ctx.moveTo(f.x + i - 7, f.y + 15);
        ctx.lineTo(f.x + i + 7, f.y - 15);
        ctx.stroke();
      }
    }

    drawWall(ctx, f) {
      ctx.fillStyle = f.color;
      rounded(ctx, f.x - 34, f.y - 15, 68, 30, 6);
      ctx.fill();
      ctx.fillStyle = f.accent;
      for (let i = -27; i <= 27; i += 18) {
        ctx.fillRect(f.x + i, f.y - 14, 3, 28);
      }
      if (f.branch === 'gate') {
        ctx.fillStyle = '#3d2a1d';
        rounded(ctx, f.x - 12, f.y - 12, 24, 24, 4);
        ctx.fill();
      }
    }

    drawTower(ctx, f, archer) {
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.beginPath();
      ctx.ellipse(f.x, f.y + 22, 26, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = f.color;
      ctx.fillRect(f.x - 17, f.y - 16, 34, 40);
      ctx.fillStyle = f.accent;
      ctx.fillRect(f.x - 21, f.y - 27, 42, 14);
      if (archer) {
        ctx.strokeStyle = '#5a351e';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(f.x - 18, f.y - 34);
        ctx.lineTo(f.x + 18, f.y - 10);
        ctx.stroke();
      } else {
        ctx.fillStyle = '#2d3035';
        ctx.fillRect(f.x - 6, f.y - 35, 32, 10);
      }
    }

    drawHouse(ctx, f) {
      ctx.fillStyle = '#6d533d';
      ctx.fillRect(f.x - 24, f.y - 16, 48, 38);
      ctx.fillStyle = f.accent;
      ctx.beginPath();
      ctx.moveTo(f.x - 30, f.y - 15);
      ctx.lineTo(f.x, f.y - 42);
      ctx.lineTo(f.x + 30, f.y - 15);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#2a1e17';
      ctx.fillRect(f.x - 7, f.y + 3, 14, 19);
    }

    drawMine(ctx, f) {
      ctx.fillStyle = '#4d3b27';
      ctx.beginPath();
      ctx.ellipse(f.x, f.y + 14, 28, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = f.accent;
      ctx.beginPath();
      ctx.arc(f.x + 10, f.y + 2, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#d0b35b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(f.x - 5, f.y + 3, 18, Math.PI * 0.12, Math.PI * 1.14);
      ctx.stroke();
    }

    drawRepair(ctx, f) {
      ctx.fillStyle = f.color;
      ctx.fillRect(f.x - 23, f.y - 14, 46, 36);
      ctx.fillStyle = f.accent;
      ctx.fillRect(f.x - 5, f.y - 28, 10, 42);
      ctx.fillRect(f.x - 20, f.y - 13, 40, 10);
    }

    drawTrap(ctx, f) {
      ctx.fillStyle = 'rgba(0,0,0,0.24)';
      ctx.beginPath();
      ctx.ellipse(f.x, f.y + 6, 28, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = f.branch === 'frost' ? '#9edcf5' : f.accent;
      for (let i = -18; i <= 18; i += 9) {
        ctx.beginPath();
        ctx.moveTo(f.x + i, f.y - 12);
        ctx.lineTo(f.x + i - 5, f.y + 12);
        ctx.lineTo(f.x + i + 5, f.y + 12);
        ctx.closePath();
        ctx.fill();
      }
    }

    drawBanner(ctx, f) {
      ctx.strokeStyle = '#38291f';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(f.x, f.y + 24);
      ctx.lineTo(f.x, f.y - 35);
      ctx.stroke();
      ctx.fillStyle = f.color;
      ctx.beginPath();
      ctx.moveTo(f.x + 2, f.y - 34);
      ctx.lineTo(f.x + 33, f.y - 24);
      ctx.lineTo(f.x + 2, f.y - 11);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = f.accent;
      ctx.beginPath();
      ctx.arc(f.x + 14, f.y - 23, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,214,162,0.22)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.range, 0, Math.PI * 2);
      ctx.stroke();
    }

    drawBeacon(ctx, f) {
      ctx.strokeStyle = f.color;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(f.x, f.y + 25);
      ctx.lineTo(f.x, f.y - 28);
      ctx.stroke();
      ctx.fillStyle = f.accent;
      ctx.beginPath();
      ctx.arc(f.x, f.y - 34, 12 + Math.sin(this.time * 0.006) * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(215,190,255,0.25)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(f.x, f.y - 34, 30 + Math.sin(this.time * 0.003) * 10, 0, Math.PI * 2);
      ctx.stroke();
    }

    drawSoldiers(ctx) {
      for (const s of this.soldiers) {
        const bob = Math.sin((s.animTime || this.time) * 0.018 + (s.animSeed || 0)) * (s.moving ? 2.2 : 0.8);
        const attackT = clamp((s.attack || 0) / (s.attackMax || 360), 0, 1);
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.beginPath();
        ctx.ellipse(s.x, s.y + 8, 10 + attackT * 2, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        const soldierAsset = this.soldierFrameAssetKey(s);
        const attackFrame = this.soldierAttackFrameIndex(s);
        const scaleY = 1 + Math.sin((s.animTime || 0) * 0.024) * (s.moving ? 0.04 : 0.015);
        const windup = attackFrame === 1 ? -2 : attackFrame === 2 ? 4 : attackFrame === 3 ? 8 : 2;
        const impactScale = attackFrame === 3 ? 1.12 : attackFrame > 0 ? 1.04 : 1;
        const scaleX = (s.face || 1) * (1 + attackT * 0.04) * impactScale;
        const drawX = s.x + windup * (s.face || 1);
        const baseSize = s.type === 'spear' ? 44 : 40;
        const drawn = this.drawAssetAnimated(ctx, soldierAsset, drawX, s.y - 5 + bob, baseSize, baseSize, { scaleX, scaleY });
        if (attackT > 0) {
          const flash = attackFrame === 3 ? 0.72 : 0.34;
          ctx.strokeStyle = `rgba(255,236,158,${flash})`;
          ctx.lineWidth = attackFrame === 3 ? 3 : 2;
          ctx.beginPath();
          ctx.moveTo(s.x + (s.face || 1) * 6, s.y - 6);
          ctx.lineTo(s.x + (s.face || 1) * (s.type === 'spear' ? 34 : 24), s.y - (s.type === 'spear' ? 18 : 14));
          ctx.stroke();
          if (attackFrame === 3) {
            ctx.fillStyle = 'rgba(255,245,180,0.35)';
            ctx.beginPath();
            ctx.arc(s.x + (s.face || 1) * (s.type === 'spear' ? 31 : 22), s.y - 15, 8, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        if (!drawn) {
          ctx.fillStyle = s.type === 'shield' ? '#2f57a8' : s.type === 'spear' ? '#5577d8' : '#3f65c8';
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#f0cc8b';
          ctx.beginPath();
          ctx.arc(s.x, s.y - 8, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#d6bf82';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(s.x + 4, s.y - 2);
          ctx.lineTo(s.x + (s.type === 'spear' ? 18 : 14), s.y - (s.type === 'spear' ? 18 : 12));
          ctx.stroke();
        }
      }
    }


    kingRunAssetKey() {
      const k = this.king;
      const frame = (Math.floor((k.runDistance || 0) / 13) % 4) + 1;
      const key = `kingRunFrame${frame}`;
      if (this.imageReady(key)) return key;
      return frame % 2 === 0 ? 'kingRun2' : 'kingRun1';
    }

    kingIdleAssetKey() {
      const frame = Math.floor((this.king.animTime || this.time) / 520) % 2 + 1;
      const key = `kingIdle${frame}`;
      return this.imageReady(key) ? key : 'kingIdle';
    }

    drawKing(ctx) {
      const k = this.king;
      if (this.pointerTarget) {
        ctx.strokeStyle = 'rgba(255,236,158,0.52)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.king.targetX, this.king.targetY, 12 + Math.sin(this.time * 0.01) * 3, 0, Math.PI * 2);
        ctx.stroke();
      }
      const movingKing = !!k.moving || distXY(k.x, k.y, k.targetX, k.targetY) > 4 || this.keys.size > 0;
      const idleBob = Math.sin((k.animTime || this.time) * 0.006) * 1.7;
      const runBob = Math.sin((k.runDistance || 0) * 0.42) * 2.7;
      const lateral = movingKing ? Math.sin((k.runDistance || 0) * 0.24) * 1.4 : 0;
      const bob = k.stunned > 0 ? 0 : movingKing ? runBob : idleBob;
      const attackT = clamp((k.attackFlash || 0) / 180, 0, 1);
      const speedRatio = k.speedRatio || 0;
      const shadowW = 18 + (movingKing ? 4 + speedRatio * 3 : 0);
      const shadowH = 7 + (movingKing ? 1 : 0);
      ctx.fillStyle = 'rgba(0,0,0,0.24)';
      ctx.beginPath();
      ctx.ellipse(k.x, k.y + 15, shadowW, shadowH, 0, 0, Math.PI * 2);
      ctx.fill();

      let kingAsset = k.stunned > 0 ? (this.imageReady('kingDown') ? 'kingDown' : 'kingIdle') : movingKing ? this.kingRunAssetKey() : this.kingIdleAssetKey();
      if (k.invuln > 0 && this.imageReady('kingHurt') && Math.floor(this.time / 100) % 2 === 0) kingAsset = 'kingHurt';
      const visible = k.invuln <= 0 || Math.floor(this.time / 72) % 2 === 0;
      const lean = movingKing ? Math.sin((k.runDistance || 0) * 0.26) * 0.035 + (k.face || 1) * 0.025 * speedRatio : Math.sin((k.animTime || this.time) * 0.004) * 0.012;
      let drawn = false;
      if (visible) {
        drawn = this.drawAssetAnimated(
          ctx,
          kingAsset,
          k.x + lateral + attackT * (k.face || 1) * 5,
          k.y - 11 + bob,
          58 * (1 + attackT * 0.05),
          60 * (1 - attackT * 0.015),
          { scaleX: k.face || 1, rotation: k.stunned > 0 ? -0.95 + Math.sin(this.time * 0.012) * 0.05 : lean }
        );
      }
      if (movingKing && visible) {
        ctx.strokeStyle = 'rgba(255,231,140,0.34)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const backX = k.x - Math.cos(k.moveAngle || 0) * 18;
        const backY = k.y - Math.sin(k.moveAngle || 0) * 10 + 11;
        ctx.moveTo(backX, backY);
        ctx.lineTo(backX - (k.face || 1) * 8, backY + 4);
        ctx.stroke();
      }
      if (k.invuln > 0) {
        ctx.fillStyle = 'rgba(255,110,95,0.24)';
        ctx.beginPath();
        ctx.arc(k.x, k.y, 24, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!drawn && visible) {
        ctx.fillStyle = k.stunned > 0 ? '#6f7a91' : '#1c5ec9';
        ctx.beginPath();
        ctx.arc(k.x, k.y, k.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f2cf8b';
        ctx.beginPath();
        ctx.arc(k.x, k.y - 15, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f5d64c';
        ctx.beginPath();
        ctx.moveTo(k.x - 11, k.y - 26);
        ctx.lineTo(k.x - 4, k.y - 37);
        ctx.lineTo(k.x + 2, k.y - 27);
        ctx.lineTo(k.x + 10, k.y - 37);
        ctx.lineTo(k.x + 13, k.y - 25);
        ctx.closePath();
        ctx.fill();
      }
    }

    drawEnemies(ctx) {
      for (const e of this.enemies) {
        const bob = Math.sin(this.time * (e.def.siege ? 0.004 : 0.010) + (e.animSeed || 0)) * (e.def.siege ? 1.1 : e.def.boss ? 1.4 : 2.2);
        const spawnT = clamp((e.spawnLife || 0) / 360, 0, 1);
        const hitT = clamp((e.hit || 0) / 140, 0, 1);
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(e.x, e.y + e.r * 0.75, e.r * (1.05 + spawnT * 0.2), e.r * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
        const enemyAsset = this.enemyWalkFrameKey(e);
        const enemyScale = e.def.boss ? e.r * 3.9 : e.def.siege ? e.r * 4.4 : e.r * 4.0;
        const walkPhase = Math.sin(((e.walkDistance || 0) * 0.34) + (e.animSeed || 0));
        const sx = this.enemyFacingScale(e) * (1 + walkPhase * (e.def.siege ? 0.010 : 0.018));
        const sy = 1 - walkPhase * (e.def.siege ? 0.008 : 0.018);
        const rot = e.isWalking === false ? 0 : walkPhase * (e.def.siege ? 0.010 : 0.018);
        const enemyDrawn = this.drawAssetAnimated(ctx, enemyAsset, e.x, e.y - e.r * 0.15 + bob, enemyScale * (1 - spawnT * 0.28), enemyScale * (1 - spawnT * 0.28), { scaleX: sx, scaleY: sy, rotation: rot, alpha: 1 - spawnT * 0.15 });
        if (hitT > 0 && enemyDrawn) {
          ctx.fillStyle = `rgba(255,110,95,${0.18 + hitT * 0.25})`;
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.r * (1.5 + hitT * 0.45), 0, Math.PI * 2);
          ctx.fill();
        }
        if (!enemyDrawn) {
          ctx.fillStyle = e.hit > 0 ? '#ff8880' : e.def.color;
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#2b1110';
          ctx.beginPath();
          ctx.arc(e.x - e.r * 0.28, e.y - 2, Math.max(1.5, e.r * 0.13), 0, Math.PI * 2);
          ctx.arc(e.x + e.r * 0.28, e.y - 2, Math.max(1.5, e.r * 0.13), 0, Math.PI * 2);
          ctx.fill();
          if (e.def.armor) {
            ctx.strokeStyle = '#d6d6d6';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(e.x, e.y, e.r + 3, -0.45, Math.PI + 0.45);
            ctx.stroke();
          }
          if (e.def.explode) {
            ctx.fillStyle = '#ffcd62';
            ctx.beginPath();
            ctx.arc(e.x + e.r * 0.25, e.y + e.r * 0.1, Math.max(3, e.r * 0.28), 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#2b1110';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(e.x + e.r * 0.25, e.y - e.r * 0.2);
            ctx.lineTo(e.x + e.r * 0.45, e.y - e.r * 0.65);
            ctx.stroke();
          }
        }
        if (e.def.healAura) {
          const auraPulse = 1 + Math.sin(this.time * 0.006 + e.animSeed) * 0.08;
          ctx.strokeStyle = 'rgba(181,140,255,0.34)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.def.healAura * auraPulse, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = '#efe0ff';
          ctx.font = '900 12px system-ui';
          ctx.textAlign = 'center';
          ctx.fillText('+', e.x, e.y + 5);
        }
        if (e.def.siege) {
          ctx.strokeStyle = '#4a241b';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(e.x - e.r, e.y + e.r * 0.45);
          ctx.lineTo(e.x + e.r, e.y - e.r * 0.45);
          ctx.stroke();
        }
        if (e.def.boss) {
          ctx.strokeStyle = `rgba(255,211,91,${0.34 + Math.sin(this.time * 0.006) * 0.12})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(e.x, e.y, (e.def.aura || e.r + 18) + Math.sin(this.time * 0.005) * 5, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = '#ffd35b';
          ctx.beginPath();
          ctx.moveTo(e.x - 10, e.y - e.r - 5);
          ctx.lineTo(e.x - 4, e.y - e.r - 15);
          ctx.lineTo(e.x + 2, e.y - e.r - 6);
          ctx.lineTo(e.x + 10, e.y - e.r - 15);
          ctx.lineTo(e.x + 13, e.y - e.r - 5);
          ctx.closePath();
          ctx.fill();
        }
        if (e.slow > 0) {
          ctx.strokeStyle = '#bdeeff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.r + 6 + Math.sin(this.time * 0.012) * 2, 0, Math.PI * 2);
          ctx.stroke();
        }
        this.drawBar(ctx, e.x - e.r, e.y - e.r - 9, e.r * 2, 4, e.hp / e.maxHp, '#73e184');
      }
    }


    drawProjectiles(ctx) {
      for (const p of this.projectiles) {
        if (p.trail && p.trail.length) {
          for (let i = 0; i < p.trail.length; i += 1) {
            const t = p.trail[i];
            ctx.globalAlpha = Math.max(0, t.life / 180) * (p.from === 'cannon' ? 0.30 : 0.22);
            if (p.from === 'archer') {
              ctx.strokeStyle = 'rgba(255, 245, 190, 0.45)';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(t.x, t.y);
              ctx.lineTo(t.x - Math.cos(p.angle || 0) * 7, t.y - Math.sin(p.angle || 0) * 7);
              ctx.stroke();
            } else {
              ctx.fillStyle = p.from === 'cannon' ? 'rgba(92, 92, 92, 0.8)' : p.color;
              ctx.beginPath();
              ctx.arc(t.x, t.y, p.splash ? 5 : 3, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          ctx.globalAlpha = 1;
        }
        if (p.from === 'archer') {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle || 0);
          ctx.strokeStyle = '#f0dca4';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-10, 0);
          ctx.lineTo(8, 0);
          ctx.stroke();
          ctx.fillStyle = '#d6bf82';
          ctx.beginPath();
          ctx.moveTo(8, 0);
          ctx.lineTo(2, -3);
          ctx.lineTo(2, 3);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        } else if (p.from === 'cannon') {
          ctx.fillStyle = '#474d58';
          ctx.beginPath();
          ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = 'rgba(255,226,164,0.55)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.splash ? 6 : 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = p.splash ? 'rgba(255,226,164,0.55)' : 'rgba(255,246,190,0.45)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.splash ? 10 : 7, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }


    drawCoins(ctx) {
      for (const c of this.coins) {
        const bob = Math.sin(this.time * 0.008 + (c.animSeed || c.x)) * 3;
        const pulse = 1 + Math.sin(this.time * 0.010 + (c.animSeed || c.y)) * 0.08;
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.beginPath();
        ctx.ellipse(c.x, c.y + 5, 8, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        const drawn = this.drawAssetAnimated(ctx, 'uiCoin', c.x, c.y + bob, 24 * pulse, 24 * pulse);
        if (!drawn) {
          ctx.fillStyle = '#ffd35b';
          ctx.beginPath();
          ctx.arc(c.x, c.y + bob, c.r * pulse, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#a66d13';
          ctx.font = '800 8px system-ui';
          ctx.textAlign = 'center';
          ctx.fillText('金', c.x, c.y + bob + 3);
        }
      }
    }


    effectFrameKey(type, life, max) {
      const frame = life / max > 0.66 ? 1 : life / max > 0.33 ? 2 : 3;
      const prefix = {
        hit: 'fxHit', explosion: 'fxExplosion', build: 'fxBuild', heal: 'fxHeal',
        coinPickup: 'fxCoinPickup', upgrade: 'fxUpgrade', warning: 'fxWarning'
      }[type] || 'fxHit';
      return `${prefix}${frame}`;
    }

    drawEffects(ctx) {
      for (const d of this.deathSprites || []) {
        const alpha = clamp(d.life / d.max, 0, 1);
        const scale = 0.75 + alpha * 0.35;
        this.drawAssetAnimated(ctx, d.assetKey, d.x, d.y + (1 - alpha) * 18, d.size * scale, d.size * scale, { alpha: alpha * 0.85, rotation: (1 - alpha) * d.spin, scaleY: 0.86 + alpha * 0.14 });
      }
      for (const s of this.spriteEffects || []) {
        const alpha = clamp(s.life / s.max, 0, 1);
        const frameKey = this.effectFrameKey(s.type, s.life, s.max);
        if (this.imageReady(frameKey)) {
          const wobble = Math.sin((1 - alpha) * Math.PI + (s.seed || 0)) * 0.05;
          ctx.globalAlpha = Math.min(0.95, 0.25 + alpha);
          const growth = 0.75 + (1 - alpha) * 0.55;
          this.drawAssetAnimated(ctx, frameKey, s.x, s.y, s.size * growth, s.size * growth, { rotation: wobble });
          ctx.globalAlpha = 1;
        }
      }
      for (const b of this.bursts) {
        ctx.globalAlpha = Math.max(0, b.life / b.max);
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      for (const f of this.floaters) {
        ctx.globalAlpha = Math.max(0, f.life / f.max);
        ctx.fillStyle = f.color;
        ctx.font = '800 14px system-ui';
        ctx.textAlign = 'center';
        ctx.strokeStyle = 'rgba(0,0,0,0.55)';
        ctx.lineWidth = 4;
        ctx.strokeText(f.text, f.x, f.y);
        ctx.fillText(f.text, f.x, f.y);
        ctx.globalAlpha = 1;
      }
    }



    drawResultFx(ctx) {
      if (!this.resultFx || this.resultFx.life <= 0) return;
      this.resultFx.life -= 16;
      const t = this.resultFx.life / this.resultFx.max;
      ctx.save();
      ctx.globalAlpha = clamp(t, 0, 1) * 0.82;
      ctx.fillStyle = this.resultFx.type === 'win' ? 'rgba(255, 211, 91, 0.16)' : 'rgba(255, 73, 61, 0.15)';
      ctx.fillRect(0, 0, C.w, C.h);
      ctx.textAlign = 'center';
      ctx.font = '900 42px system-ui';
      ctx.lineWidth = 7;
      ctx.strokeStyle = 'rgba(0,0,0,0.55)';
      ctx.fillStyle = this.resultFx.type === 'win' ? '#fff1a5' : '#ffd2cb';
      const label = this.resultFx.type === 'win' ? '勝利' : '敗北';
      ctx.strokeText(label, C.w / 2, 318);
      ctx.fillText(label, C.w / 2, 318);
      ctx.restore();
    }


    drawOffscreenMarkers(ctx) {
      const items = [];
      if (this.castle) items.push({ x: this.castle.x, y: this.castle.y, label: '城', color: '#86e3a0', priority: 1 });
      const visibleEnemies = (this.enemies || []).filter((e) => e.hp > 0).slice(0, 24);
      for (const e of visibleEnemies) {
        const screen = this.worldToScreen(e.x, e.y);
        const offscreen = screen.x < -20 || screen.x > C.w + 20 || screen.y < -20 || screen.y > C.h + 20;
        if (offscreen || e.def.boss) items.push({ x: e.x, y: e.y, label: e.def.boss ? 'ボス' : '敵', color: e.def.boss ? '#ffd35b' : '#ff6b5e', priority: e.def.boss ? 0 : 3 });
      }
      const activePads = (this.pads || []).filter((p) => !p.facilityId && this.isPadUnlocked(p)).slice(0, 16);
      for (const p of activePads) {
        const d = distXY(this.king.x, this.king.y, p.x, p.y);
        if (d > 300) items.push({ x: p.x, y: p.y, label: C.facilityTypes[p.type] ? C.facilityTypes[p.type].name : '床', color: '#ffd35b', priority: 4 });
      }
      items.sort((a, b) => a.priority - b.priority);
      let drawn = 0;
      for (const item of items) {
        if (drawn >= 8) break;
        if (this.drawWorldEdgeMarker(ctx, item)) drawn += 1;
      }
    }

    drawWorldEdgeMarker(ctx, item) {
      const screen = this.worldToScreen(item.x, item.y);
      if (screen.x >= 18 && screen.x <= C.w - 18 && screen.y >= 90 && screen.y <= C.h - 26) return false;
      const cx = C.w / 2;
      const cy = C.h / 2;
      const dx = screen.x - cx;
      const dy = screen.y - cy;
      const angle = Math.atan2(dy, dx);
      const edgeX = clamp(cx + Math.cos(angle) * (C.w / 2 - 28), 28, C.w - 28);
      const edgeY = clamp(cy + Math.sin(angle) * (C.h / 2 - 92), 88, C.h - 34);
      ctx.save();
      ctx.translate(edgeX, edgeY);
      ctx.rotate(angle);
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.moveTo(13, 0);
      ctx.lineTo(-8, -8);
      ctx.lineTo(-5, 0);
      ctx.lineTo(-8, 8);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.fillStyle = 'rgba(18, 24, 20, 0.72)';
      rounded(ctx, edgeX - 18, edgeY + 11, 36, 18, 9);
      ctx.fill();
      ctx.fillStyle = '#fff0bb';
      ctx.font = '800 10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(item.label, edgeX, edgeY + 24);
      ctx.restore();
      return true;
    }

    drawHudOnCanvas(ctx) {
      ctx.fillStyle = 'rgba(18, 24, 20, 0.64)';
      rounded(ctx, 14, 14, 452, 52, 16);
      ctx.fill();
      ctx.fillStyle = '#fff0bb';
      ctx.font = '800 14px system-ui';
      ctx.textAlign = 'left';
      this.drawAsset(ctx, 'uiCoin', 30, 39, 22, 22);
      ctx.fillText(`${Math.floor(this.king.coins)}`, 44, 43);
      this.drawAsset(ctx, 'uiHeart', 113, 39, 22, 22);
      ctx.fillText(`${Math.ceil(this.king.hp)}`, 127, 43);
      this.drawAsset(ctx, 'uiPopulation', 205, 39, 24, 24);
      ctx.fillText(`${this.soldiers.length}/${this.kingdom.popCap}`, 221, 43);
      this.drawAsset(ctx, 'uiTerritory', 302, 39, 24, 24);
      ctx.fillText(`${this.kingdom.territory}`, 318, 43);
      ctx.fillText(`${this.speed}x${this.paused ? ' 停止' : ''}`, 374, 43);
      ctx.fillStyle = '#d6f2a3';
      ctx.font = '800 11px system-ui';
      ctx.fillText(`収入 ${Math.round(this.kingdom.economyBonus * 100)}%`, 26, 58);
      ctx.fillText(`波 ${this.wave.index < 0 ? 0 : this.wave.index + 1}/${this.waves.length}`, 119, 58);
      ctx.fillText(`次 ${this.nextWaveSummary().slice(0, 24)}`, 207, 58);
      ctx.fillStyle = 'rgba(255,244,214,0.9)';
      ctx.font = '800 11px system-ui';
      ctx.fillText(`${this.currentStage.name} / ${this.currentDifficulty.name}`, 26, 73);
      ctx.fillStyle = '#ff6b5e';
      rounded(ctx, 28, 64, 160, 8, 5);
      ctx.fill();
      ctx.fillStyle = '#86e3a0';
      rounded(ctx, 28, 64, 160 * Math.max(0, this.castle.hp / this.castle.maxHp), 8, 5);
      ctx.fill();
      if (this.routeAlert.life > 0) {
        ctx.globalAlpha = Math.min(1, this.routeAlert.life / 300);
        ctx.fillStyle = this.routeAlert.route === 'side' ? 'rgba(110, 39, 32, 0.78)' : 'rgba(93, 62, 24, 0.78)';
        rounded(ctx, 72, 82, 336, 42, 14);
        ctx.fill();
        ctx.fillStyle = '#ffe7a8';
        ctx.font = '900 19px system-ui';
        ctx.textAlign = 'center';
        this.drawAsset(ctx, 'uiWarning', 93, 103, 30, 30);
        ctx.fillText(this.routeAlert.text, C.w / 2 + 8, 109);
        ctx.globalAlpha = 1;
      }
      if (this.wave.banner > 0 && this.wave.index >= 0) {
        ctx.globalAlpha = Math.min(1, this.wave.banner / 300);
        ctx.fillStyle = 'rgba(20, 22, 18, 0.72)';
        rounded(ctx, 76, 102, 328, 58, 18);
        ctx.fill();
        ctx.fillStyle = '#ffd35b';
        ctx.font = '900 25px system-ui';
        ctx.textAlign = 'center';
        this.drawAsset(ctx, 'uiWave', 95, 132, 34, 34);
        ctx.fillText(`ウェーブ ${this.wave.index + 1}: ${this.waves[this.wave.index].title}`, C.w / 2 + 8, 139);
        ctx.globalAlpha = 1;
      }
    }

    drawBar(ctx, x, y, w, h, ratio, color) {
      ctx.fillStyle = 'rgba(0,0,0,0.38)';
      rounded(ctx, x, y, w, h, h / 2);
      ctx.fill();
      ctx.fillStyle = color;
      rounded(ctx, x, y, Math.max(0, w * clamp(ratio, 0, 1)), h, h / 2);
      ctx.fill();
    }
  }

  const descriptors = Object.getOwnPropertyDescriptors(RendererMethods.prototype);
  delete descriptors.constructor;
  window.KBD_RENDERER_DESCRIPTORS = descriptors;
})();

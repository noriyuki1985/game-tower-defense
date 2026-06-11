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
      const level = Math.max(1, Math.min(4, typeof f === 'string' ? 1 : (f.level || 1)));
      const coreLevelAssets = {
        palisade: `buildingPalisadeLv${level}`,
        archer: `buildingArcherTowerLv${level}`,
        cannon: `buildingCannonLv${level}`,
        barracks: `buildingBarracksLv${level}`,
        mine: `buildingGoldMineLv${level}`
      };
      if (coreLevelAssets[type] && this.imageReady(coreLevelAssets[type])) return coreLevelAssets[type];
      return {
        palisade: 'buildingPalisade',
        archer: 'buildingArcherTower',
        cannon: 'buildingCannon',
        barracks: 'buildingBarracks',
        mine: 'buildingGoldMine'
      }[type];
    }

    facilityLevelColor(level) {
      return (C.levelColors && C.levelColors[level]) || '#fff3a3';
    }

    facilityMaxLevel(type) {
      const def = C.facilityTypes[type];
      return (def && def.maxLevel) || 3;
    }

    facilityAssetSize(type) {
      return {
        palisade: [76, 62],
        archer: [82, 100],
        cannon: [84, 88],
        barracks: [90, 78],
        mine: [88, 74]
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
        siege: 'enemySiegeRam',
        warlord: 'enemyWarlord',
        overlord: 'enemyOverlord'
      }[type] || 'enemyGrunt';
    }

    enemyWalkFrameKey(enemy) {
      // v3.0.0: 歩行フレームだけ古い画像が残ると、通常時と被弾時で敵の見た目が切り替わる。
      // 敵画像は基準画像に統一し、歩行感は描画時の揺れ・伸縮で表現する。
      return this.enemyAssetKey(enemy.type);
    }

    enemyFacingScale(enemy) {
      if (Math.abs(enemy.lastDx || 0) < 0.05) return 1;
      return enemy.lastDx < 0 ? -1 : 1;
    }

    soldierAssetKey(type) {
      return {
        militia: 'allyMilitia',
        shield: 'allyShield',
        spear: 'allySpear'
      }[type] || 'allyMilitia';
    }

    soldierAttackBaseKey(type) {
      return {
        militia: 'allyMilitia',
        shield: 'allyShield',
        spear: 'allySpear'
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
      this.drawDiscoveries(ctx);
      this.drawFacilities(ctx);
      this.drawSoldiers(ctx);
      this.drawKing(ctx);
      this.drawEnemies(ctx);
      this.drawProjectiles(ctx);
      this.drawCoins(ctx);
      this.drawEffects(ctx);
      ctx.restore();
      this.drawOffscreenMarkers(ctx);
      this.drawMiniMap(ctx);
      this.drawHudOnCanvas(ctx);
      this.drawBackgroundDebugHud(ctx);
      this.drawDiscoveryToast(ctx);
      this.drawBuildInfoPanel(ctx);
      if (this.drawTutorialGuide) this.drawTutorialGuide(ctx);
      this.drawStrategicHint(ctx);
      this.drawNoticeBar(ctx);
      this.drawUpgradeBanner(ctx);
      this.drawResultFx(ctx);
      ctx.restore();
    }

    stageBackground() {
      const key = this.stageKey ? this.stageKey() : 'meadow';
      const backgrounds = C.stageBackgrounds || {};
      const own = backgrounds[key] || backgrounds.meadow || null;
      if (!own || !own.inherits) return own;
      const parent = backgrounds[own.inherits] || backgrounds.meadow || {};
      return {
        ...parent,
        ...own,
        layers: { ...(parent.layers || {}), ...(own.layers || {}) }
      };
    }

    backgroundLayer(name) {
      const background = this.stageBackground ? this.stageBackground() : null;
      return (background && background.layers && background.layers[name]) || {};
    }

    backgroundDebugEnabled() {
      return !!(this.backgroundDebug && this.backgroundDebug.enabled);
    }

    backgroundDebugLabelsEnabled() {
      return !!(this.backgroundDebug && this.backgroundDebug.enabled && this.backgroundDebug.labels !== false);
    }

    backgroundDebugSpec(name) {
      const cfg = C.backgroundDebug || {};
      const layers = cfg.layers || {};
      return layers[name] || { label: name, color: 'rgba(255, 246, 170, 0.32)' };
    }

    drawBackgroundLayerLabel(ctx, text, x, y) {
      if (!this.backgroundDebugLabelsEnabled()) return;
      ctx.save();
      ctx.font = '900 11px system-ui';
      ctx.textAlign = 'left';
      const w = Math.min(190, Math.max(70, ctx.measureText(text).width + 14));
      rounded(ctx, x, y - 15, w, 19, 6);
      ctx.fillStyle = 'rgba(8, 13, 18, 0.72)';
      ctx.fill();
      ctx.fillStyle = '#fff6c5';
      ctx.fillText(text, x + 7, y - 2);
      ctx.restore();
    }

    drawBackgroundLayerDebug(ctx, name, opts = {}) {
      if (!this.backgroundDebugEnabled()) return;
      const spec = this.backgroundDebugSpec(name);
      const ww = opts.ww || this.worldWidth();
      const wh = opts.wh || this.worldHeight();
      ctx.save();
      if (name === 'base') {
        ctx.globalAlpha = 0.22;
        ctx.fillStyle = spec.color;
        ctx.fillRect(0, 0, ww, wh);
        ctx.globalAlpha = 0.20;
        ctx.strokeStyle = spec.color;
        ctx.lineWidth = 1;
        for (let x = 0; x <= ww; x += 80) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, wh);
          ctx.stroke();
        }
        for (let y = 0; y <= wh; y += 80) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(ww, y);
          ctx.stroke();
        }
        this.drawBackgroundLayerLabel(ctx, spec.label, 18, 182);
      } else if (name === 'path') {
        ctx.globalAlpha = 0.62;
        ctx.strokeStyle = spec.color;
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        for (const path of opts.routePaths || []) this.drawPathLine(ctx, path);
        this.drawBackgroundLayerLabel(ctx, spec.label, 18, 205);
      } else if (name === 'decorationBack') {
        ctx.globalAlpha = 0.20;
        ctx.fillStyle = spec.color;
        rounded(ctx, 16, 154, 180, 82, 18);
        ctx.fill();
        rounded(ctx, ww - 200, 128, 176, 100, 18);
        ctx.fill();
        this.drawBackgroundLayerLabel(ctx, spec.label, 18, 228);
      } else if (name === 'decorationFront') {
        ctx.globalAlpha = 0.24;
        ctx.fillStyle = spec.color;
        rounded(ctx, 12, wh - 88, ww - 24, 54, 14);
        ctx.fill();
        this.drawBackgroundLayerLabel(ctx, spec.label, 18, wh - 96);
      } else if (name === 'atmosphere') {
        ctx.globalAlpha = 0.22;
        ctx.strokeStyle = spec.color;
        ctx.lineWidth = 12;
        for (let i = -wh; i < ww; i += 96) {
          ctx.beginPath();
          ctx.moveTo(i, wh);
          ctx.lineTo(i + wh, 0);
          ctx.stroke();
        }
        this.drawBackgroundLayerLabel(ctx, spec.label, ww - 208, 176);
      } else if (name === 'labels') {
        ctx.globalAlpha = 0.52;
        ctx.strokeStyle = spec.color;
        ctx.lineWidth = 2;
        rounded(ctx, 14, 136, 210, 31, 8);
        ctx.stroke();
        this.drawBackgroundLayerLabel(ctx, spec.label, 230, 158);
      }
      ctx.restore();
    }

    drawBackgroundBuildPadDebug(ctx) {
      if (!this.backgroundDebugEnabled()) return;
      const spec = this.backgroundDebugSpec('buildPad');
      ctx.save();
      ctx.globalAlpha = 0.72;
      ctx.strokeStyle = spec.color;
      ctx.fillStyle = 'rgba(127, 183, 255, 0.10)';
      ctx.lineWidth = 2;
      ctx.setLineDash([7, 5]);
      for (const pad of this.pads || []) {
        if (this.isPadVisible && !this.isPadVisible(pad)) continue;
        rounded(ctx, pad.x - 40, pad.y - 29, 80, 58, 10);
        ctx.fill();
        ctx.stroke();
      }
      ctx.setLineDash([]);
      this.drawBackgroundLayerLabel(ctx, spec.label, 18, 252);
      ctx.restore();
    }

    drawBackgroundDebugHud(ctx) {
      if (!this.backgroundDebugEnabled()) return;
      const order = C.backgroundLayerOrder || [];
      const cfg = C.backgroundDebug || {};
      const layers = cfg.layers || {};
      ctx.save();
      const x = 254;
      const y = 112;
      const w = 208;
      const h = 32 + order.length * 17;
      rounded(ctx, x, y, w, h, 12);
      ctx.fillStyle = 'rgba(6, 10, 14, 0.76)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 246, 170, 0.34)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#fff6c5';
      ctx.font = '900 12px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('BG LAYERS / B:切替 N:ラベル', x + 10, y + 18);
      ctx.font = '800 10px system-ui';
      for (let i = 0; i < order.length; i += 1) {
        const key = order[i];
        const spec = layers[key] || { label: key, color: 'rgba(255,255,255,0.35)' };
        const yy = y + 37 + i * 17;
        ctx.fillStyle = spec.color;
        rounded(ctx, x + 10, yy - 9, 12, 9, 3);
        ctx.fill();
        ctx.fillStyle = '#dfe8dd';
        ctx.fillText(`${i + 1}. ${spec.label || key}`, x + 28, yy);
      }
      ctx.restore();
    }


    backgroundPartDebugEnabled() {
      return !!(this.backgroundPartDebug && this.backgroundPartDebug.enabled);
    }

    backgroundPartDebugLabelsEnabled() {
      return !!(this.backgroundPartDebug && this.backgroundPartDebug.enabled && this.backgroundPartDebug.labels !== false);
    }

    backgroundPartDebugSpec(layerName) {
      const cfg = C.backgroundPartDebug || {};
      const layers = cfg.layers || {};
      return layers[layerName] || { label: layerName, color: cfg.boundsColor || 'rgba(79, 213, 255, 0.78)' };
    }

    backgroundPartItemsForLayer(background, layerName) {
      const layout = this.backgroundPartLayout(background);
      return (layout && layout[layerName]) || [];
    }

    backgroundPartDimension(def, item, prop, fallback) {
      if (item && item[prop] != null) return item[prop];
      if (def && def[prop] != null) return def[prop];
      return fallback;
    }

    backgroundPartBounds(def, item, layerName, ww, wh) {
      const kind = (def && def.kind) || (item && item.kind) || 'unknown';
      if (kind === 'routeRibbon') return null;
      if (kind === 'overlay') {
        if ((item && item.part) === 'vignetteSoft') return { x: ww / 2, y: wh / 2, w: ww, h: wh, shape: 'screen' };
        return {
          x: ww / 2,
          y: wh / 2,
          w: this.backgroundPartDimension(def, item, 'width', ww * 1.08),
          h: this.backgroundPartDimension(def, item, 'height', wh * 1.08),
          shape: 'rect'
        };
      }
      const x = item && item.x != null ? item.x : ww / 2;
      const y = item && item.y != null ? item.y : wh / 2;
      if (kind === 'shadow') {
        const rx = this.backgroundPartDimension(def, item, 'radiusX', 60);
        const ry = this.backgroundPartDimension(def, item, 'radiusY', 20);
        return { x, y, w: Math.max(84, rx * 2.4), h: Math.max(30, ry * 3.0), shape: 'ellipse' };
      }
      if (kind === 'patch') {
        return {
          x,
          y,
          w: this.backgroundPartDimension(def, item, 'w', 120),
          h: this.backgroundPartDimension(def, item, 'h', 72),
          shape: 'ellipse'
        };
      }
      const scale = (item && item.scale != null ? item.scale : 1) * (def && def.scale != null ? def.scale : 1);
      if (kind === 'tree') return { x, y, w: (this.backgroundPartDimension(def, item, 'width', 82)) * scale, h: (this.backgroundPartDimension(def, item, 'height', 96)) * scale, shape: 'rect' };
      if (kind === 'rock') return { x, y, w: (this.backgroundPartDimension(def, item, 'width', 64)) * scale, h: (this.backgroundPartDimension(def, item, 'height', 54)) * scale, shape: 'rect' };
      if (kind === 'fence') {
        const w = this.backgroundPartDimension(def, item, 'width', 96);
        return { x, y, w, h: Math.max(this.backgroundPartDimension(def, item, 'height', 18), w * 0.34), shape: 'rect' };
      }
      if (kind === 'crate') {
        const w = this.backgroundPartDimension(def, item, 'width', 26);
        return { x, y, w, h: this.backgroundPartDimension(def, item, 'height', w), shape: 'rect' };
      }
      if (kind === 'reed') return { x, y, w: 44 * scale, h: 56 * scale, shape: 'rect' };
      return { x, y, w: this.backgroundPartDimension(def, item, 'w', 42), h: this.backgroundPartDimension(def, item, 'h', 42), shape: 'rect' };
    }

    backgroundPartWarnings(background) {
      const layout = this.backgroundPartLayout(background);
      const catalog = C.backgroundPartCatalog || {};
      const warnings = [];
      if (!layout) return ['backgroundPartLayouts が見つかりません'];
      for (const [layerName, items] of Object.entries(layout)) {
        for (let i = 0; i < (items || []).length; i += 1) {
          const item = items[i] || {};
          const id = item.id || `${layerName}-${i + 1}`;
          const def = catalog[item.part];
          if (!item.part) warnings.push(`${id}: part 未指定`);
          if (!def) {
            warnings.push(`${id}: catalog 未定義 ${item.part || ''}`.trim());
            continue;
          }
          const kind = def.kind || item.kind;
          if (kind !== 'routeRibbon' && kind !== 'overlay') {
            if (item.x == null || item.y == null) warnings.push(`${id}: x/y 未指定`);
          }
          if (item.alpha != null && (item.alpha < 0 || item.alpha > 1.25)) warnings.push(`${id}: alpha 範囲外 ${item.alpha}`);
          const bounds = this.backgroundPartBounds(def, item, layerName, this.worldWidth(), this.worldHeight());
          if (bounds && (bounds.w <= 0 || bounds.h <= 0)) warnings.push(`${id}: サイズ不正`);
          if (bounds && (bounds.x < -80 || bounds.x > this.worldWidth() + 80 || bounds.y < -80 || bounds.y > this.worldHeight() + 80)) warnings.push(`${id}: 画面外の可能性`);
          const assetKeys = [def.assetKey, def.assetStraightKey, def.assetCurveKey].filter(Boolean);
          for (const key of assetKeys) {
            if (this.images && !this.images[key]) warnings.push(`${id}: asset 未登録 ${key}`);
          }
          if (kind === 'routeRibbon' && !item.route) warnings.push(`${id}: route 未指定`);
        }
      }
      return warnings;
    }

    drawBackgroundPartDebugLayer(ctx, layerName, background, opts = {}) {
      if (!this.backgroundPartDebugEnabled()) return;
      const items = this.backgroundPartItemsForLayer(background, layerName);
      if (!items || !items.length) return;
      const catalog = C.backgroundPartCatalog || {};
      const cfg = C.backgroundPartDebug || {};
      const spec = this.backgroundPartDebugSpec(layerName);
      const ww = opts.ww || this.worldWidth();
      const wh = opts.wh || this.worldHeight();
      ctx.save();
      ctx.globalAlpha = cfg.overlayAlpha == null ? 0.82 : cfg.overlayAlpha;
      for (let i = 0; i < items.length; i += 1) {
        const item = items[i] || {};
        const def = catalog[item.part];
        const color = spec.color || cfg.boundsColor || 'rgba(79, 213, 255, 0.78)';
        if (!def) {
          this.drawBackgroundPartWarningLabel(ctx, `${item.id || i}: ${item.part || 'unknown'}`, 22, 282 + i * 18);
          continue;
        }
        const kind = def.kind || item.kind;
        if (kind === 'routeRibbon') {
          const route = item.route || 'main';
          const path = this.routePath ? this.routePath(route) : [];
          if (path && path.length >= 2) {
            ctx.save();
            ctx.strokeStyle = cfg.routeColor || color;
            ctx.lineWidth = Math.max(3, Math.min(8, (item.outerWidth || def.outerWidth || 46) * 0.12));
            ctx.setLineDash([8, 8]);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            this.drawPathLine(ctx, path);
            ctx.setLineDash([]);
            ctx.restore();
            const mid = path[Math.floor(path.length / 2)];
            this.drawBackgroundPartAnchor(ctx, mid.x, mid.y, cfg.routeColor || color);
            this.drawBackgroundPartInfoLabel(ctx, item, def, layerName, mid.x + 8, mid.y - 8);
          }
          continue;
        }
        const bounds = this.backgroundPartBounds(def, item, layerName, ww, wh);
        if (!bounds) continue;
        this.drawBackgroundPartBounds(ctx, bounds, color, item.rotation || 0);
        this.drawBackgroundPartAnchor(ctx, bounds.x, bounds.y, color);
        this.drawBackgroundPartInfoLabel(ctx, item, def, layerName, bounds.x + bounds.w / 2 + 5, bounds.y - bounds.h / 2 + 2);
      }
      ctx.restore();
    }

    drawBackgroundPartBounds(ctx, bounds, color, rotation = 0) {
      ctx.save();
      ctx.translate(bounds.x, bounds.y);
      ctx.rotate(rotation || 0);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.8;
      ctx.setLineDash([6, 4]);
      if (bounds.shape === 'ellipse') {
        ctx.beginPath();
        ctx.ellipse(0, 0, bounds.w / 2, bounds.h / 2, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        rounded(ctx, -bounds.w / 2, -bounds.h / 2, bounds.w, bounds.h, 5);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.restore();
    }

    drawBackgroundPartAnchor(ctx, x, y, color) {
      const cfg = C.backgroundPartDebug || {};
      const r = cfg.anchorRadius || 4;
      ctx.save();
      ctx.fillStyle = color || cfg.boundsColor || 'rgba(79, 213, 255, 0.78)';
      ctx.strokeStyle = 'rgba(6, 10, 14, 0.72)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    drawBackgroundPartInfoLabel(ctx, item, def, layerName, x, y) {
      if (!this.backgroundPartDebugLabelsEnabled()) return;
      const cfg = C.backgroundPartDebug || {};
      const text = [
        `${item.id || item.debugLabel || item.part}`,
        `${layerName}/${item.part}`,
        item.route ? `route:${item.route}` : `x:${Math.round(item.x || 0)} y:${Math.round(item.y || 0)}`,
        item.w || item.h ? `w:${Math.round(item.w || 0)} h:${Math.round(item.h || 0)}` : (item.scale != null ? `scale:${item.scale}` : ''),
        item.alpha != null ? `a:${item.alpha}` : ''
      ].filter(Boolean).join('  ');
      ctx.save();
      ctx.globalAlpha = cfg.labelAlpha == null ? 0.92 : cfg.labelAlpha;
      ctx.font = '800 10px system-ui';
      const w = Math.min(280, Math.max(96, ctx.measureText(text).width + 12));
      const xx = clamp(x, 8, this.worldWidth() - w - 8);
      const yy = clamp(y, 136, this.worldHeight() - 22);
      rounded(ctx, xx, yy - 13, w, 18, 5);
      ctx.fillStyle = 'rgba(5, 10, 14, 0.78)';
      ctx.fill();
      ctx.fillStyle = '#dff7ff';
      ctx.textAlign = 'left';
      ctx.fillText(text, xx + 6, yy);
      ctx.restore();
    }

    drawBackgroundPartWarningLabel(ctx, text, x, y) {
      ctx.save();
      ctx.font = '900 10px system-ui';
      rounded(ctx, x, y - 13, Math.min(250, ctx.measureText(text).width + 14), 18, 5);
      ctx.fillStyle = 'rgba(50, 8, 8, 0.80)';
      ctx.fill();
      ctx.fillStyle = '#ffd6d6';
      ctx.fillText(text, x + 7, y);
      ctx.restore();
    }

    drawBackgroundPartDebugHud(ctx, background) {
      if (!this.backgroundPartDebugEnabled()) return;
      const cfg = C.backgroundPartDebug || {};
      if (cfg.showHud === false) return;
      const layout = this.backgroundPartLayout(background) || {};
      const layers = ['base', 'path', 'decorationBack', 'decorationFront', 'atmosphere'];
      const warnings = this.backgroundPartWarnings(background);
      ctx.save();
      const x = 12;
      const y = 286;
      const w = 236;
      const h = 46 + layers.length * 16 + Math.min(warnings.length, 4) * 15;
      rounded(ctx, x, y, w, h, 12);
      ctx.fillStyle = 'rgba(6, 10, 14, 0.76)';
      ctx.fill();
      ctx.strokeStyle = warnings.length ? (cfg.warningColor || 'rgba(255,88,88,0.92)') : 'rgba(79, 213, 255, 0.40)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#dff7ff';
      ctx.font = '900 12px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('BG PARTS / P:切替 N:ラベル', x + 10, y + 18);
      ctx.font = '800 10px system-ui';
      for (let i = 0; i < layers.length; i += 1) {
        const key = layers[i];
        const spec = this.backgroundPartDebugSpec(key);
        const count = ((layout && layout[key]) || []).length;
        const yy = y + 38 + i * 16;
        ctx.fillStyle = spec.color || '#dff7ff';
        rounded(ctx, x + 10, yy - 9, 12, 8, 3);
        ctx.fill();
        ctx.fillStyle = '#e7f2ee';
        ctx.fillText(`${spec.label || key}: ${count}`, x + 28, yy);
      }
      if (warnings.length) {
        ctx.fillStyle = cfg.warningColor || '#ff8c8c';
        ctx.font = '900 10px system-ui';
        ctx.fillText(`warnings: ${warnings.length}`, x + 10, y + 122);
        ctx.font = '800 9px system-ui';
        for (let i = 0; i < Math.min(warnings.length, 4); i += 1) {
          ctx.fillText(warnings[i].slice(0, 36), x + 10, y + 137 + i * 15);
        }
      }
      ctx.restore();
    }

    drawWorld(ctx) {
      const theme = this.stageTheme();
      const key = this.stageKey();
      const background = this.stageBackground();
      const ww = this.worldWidth();
      const wh = this.worldHeight();
      const sxw = C.worldScaleX || 1;
      const syw = C.worldScaleY || 1;
      const wx = (value) => value * sxw;
      const wy = (value) => value * syw;
      this.drawWorldBase(ctx, theme, background, ww, wh);
      this.drawBackgroundLayerDebug(ctx, 'base', { ww, wh });
      this.drawBackgroundPartDebugLayer(ctx, 'base', background, { ww, wh });
      this.drawWorldBackDecorations(ctx, theme, background, ww, wh, wx, wy);
      this.drawBackgroundLayerDebug(ctx, 'decorationBack', { ww, wh });
      this.drawBackgroundPartDebugLayer(ctx, 'decorationBack', background, { ww, wh });
      const routePaths = this.worldRoutePaths(key);
      this.drawWorldRoutes(ctx, theme, background, routePaths);
      this.drawBackgroundLayerDebug(ctx, 'path', { ww, wh, routePaths });
      this.drawBackgroundPartDebugLayer(ctx, 'path', background, { ww, wh, routePaths });
      this.drawBackgroundBuildPadDebug(ctx);
      this.drawUpcomingRoutePreview(ctx);
      this.drawRaidTrails(ctx, theme);
      this.drawMapDesignGuides(ctx, theme);
      this.drawWorldTerritory(ctx);
      this.drawWorldFrontDecorations(ctx, theme, background, ww, wh, wx, wy);
      this.drawBackgroundLayerDebug(ctx, 'decorationFront', { ww, wh });
      this.drawBackgroundPartDebugLayer(ctx, 'decorationFront', background, { ww, wh });
      this.drawWorldAtmosphere(ctx, background, ww, wh);
      this.drawBackgroundLayerDebug(ctx, 'atmosphere', { ww, wh });
      this.drawBackgroundPartDebugLayer(ctx, 'atmosphere', background, { ww, wh });
      this.drawWorldLabel(ctx, theme, background, wx, wy);
      this.drawBackgroundLayerDebug(ctx, 'labels', { ww, wh });
      this.drawBackgroundPartDebugHud(ctx, background);
    }

    worldRoutePaths(key) {
      const stagePaths = (C.stagePaths && C.stagePaths[key]) || {};
      const routeKeys = Object.keys(stagePaths).length ? Object.keys(stagePaths) : ['main', 'side'];
      return routeKeys.map((route) => this.routePath(route)).filter((path) => path && path.length >= 2);
    }

    drawBackgroundAssetLayer(ctx, layer, ww, wh) {
      if (!layer || !layer.assetKey || !this.imageReady(layer.assetKey)) return false;
      const img = this.images && this.images[layer.assetKey];
      if (!img) return false;
      ctx.save();
      ctx.globalAlpha *= layer.alpha == null ? 1 : layer.alpha;
      ctx.drawImage(img, 0, 0, ww, wh);
      ctx.restore();
      return true;
    }


backgroundPartLayout(background) {
  const layoutKey = (background && background.partsLayoutKey) || (this.stageKey ? this.stageKey() : 'meadow');
  return (C.backgroundPartLayouts && C.backgroundPartLayouts[layoutKey]) || null;
}

shouldDrawPartLayer(background, layerName) {
  const layer = background && background.layers ? background.layers[layerName] : null;
  return !!(layer && layer.useParts);
}

drawBackgroundPartLayer(ctx, layerName, background, ww, wh) {
  if (!this.shouldDrawPartLayer(background, layerName)) return false;
  const layout = this.backgroundPartLayout(background);
  const items = layout && layout[layerName];
  if (!items || !items.length) return false;
  const catalog = C.backgroundPartCatalog || {};
  for (const item of items) {
    const def = catalog[item.part];
    if (!def) continue;
    this.drawBackgroundPart(ctx, layerName, def, item, ww, wh);
  }
  return true;
}

drawBackgroundPart(ctx, layerName, def, item, ww, wh) {
  const kind = def.kind || item.kind;
  ctx.save();
  ctx.globalAlpha *= item.alpha == null ? (def.alpha == null ? 1 : def.alpha) : item.alpha;
  if (kind === 'patch') {
    const x = item.x || ww * 0.5;
    const y = item.y || wh * 0.5;
    const w = item.w || def.w || 120;
    const h = item.h || def.h || 72;
    const rotation = item.rotation || 0;
    if (!(def.assetKey && this.imageReady(def.assetKey) && this.drawAssetAnimated(ctx, def.assetKey, x, y, w, h, { rotation }))) {
      ctx.fillStyle = item.color || def.color || 'rgba(255,255,255,0.08)';
      ctx.beginPath();
      ctx.ellipse(x, y, w / 2, h / 2, rotation, 0, Math.PI * 2);
      ctx.fill();
      const textureKey = item.textureAsset || def.textureAsset;
      if (textureKey && this.imageReady(textureKey)) {
        ctx.save();
        ctx.globalAlpha *= item.textureAlpha == null ? (def.textureAlpha == null ? 0.12 : def.textureAlpha) : item.textureAlpha;
        const cols = Math.max(1, Math.round(w / 42));
        const rows = Math.max(1, Math.round(h / 42));
        for (let row = 0; row < rows; row += 1) {
          for (let col = 0; col < cols; col += 1) {
            const px = x - w / 2 + (col + 0.5) * (w / cols);
            const py = y - h / 2 + (row + 0.5) * (h / rows);
            this.drawAsset(ctx, textureKey, px, py, Math.max(28, w / cols + 8), Math.max(28, h / rows + 8));
          }
        }
        ctx.restore();
      }
    }
  } else if (kind === 'routeRibbon') {
    const routeName = item.route || def.route || 'main';
    const path = this.routePath ? this.routePath(routeName) : [];
    if (path && path.length >= 2) {
      const stamped = this.drawRouteRibbonAsset(ctx, path, def, item);
      if (!stamped) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = item.outerColor || def.outerColor || '#d6c094';
        ctx.lineWidth = item.outerWidth || def.outerWidth || 48;
        this.drawPathLine(ctx, path);
        ctx.strokeStyle = item.innerColor || def.innerColor || '#bb9060';
        ctx.lineWidth = item.innerWidth || def.innerWidth || 32;
        this.drawPathLine(ctx, path);
        ctx.strokeStyle = item.detailColor || def.detailColor || 'rgba(96, 66, 42, 0.18)';
        ctx.lineWidth = item.detailWidth || def.detailWidth || 2;
        this.drawPathLine(ctx, path);
      }
    }
  } else if (kind === 'tree') {
    const scale = (item.scale || 1) * (def.scale || 1);
    const x = item.x || ww * 0.5;
    const y = item.y || wh * 0.5;
    if (!(def.assetKey && this.imageReady(def.assetKey) && this.drawAssetAnimated(ctx, def.assetKey, x, y, (item.width || def.width || 82) * scale, (item.height || def.height || 96) * scale, { rotation: item.rotation || 0 }))) {
      this.drawTree(ctx, x, y, scale);
    }
  } else if (kind === 'rock') {
    const scale = (item.scale || 1) * (def.scale || 1);
    const x = item.x || ww * 0.5;
    const y = item.y || wh * 0.5;
    if (!(def.assetKey && this.imageReady(def.assetKey) && this.drawAssetAnimated(ctx, def.assetKey, x, y, (item.width || def.width || 64) * scale, (item.height || def.height || 54) * scale, { rotation: item.rotation || 0 }))) {
      this.drawRock(ctx, x, y, scale);
    }
  } else if (kind === 'reed') {
    this.drawReed(ctx, item.x, item.y, (item.scale || 1) * (def.scale || 1));
  } else if (kind === 'fence') {
    const width = item.width || def.width || 96;
    const height = item.height || def.height || 18;
    const x = item.x || ww * 0.5;
    const y = item.y || wh * 0.5;
    if (!(def.assetKey && this.imageReady(def.assetKey) && this.drawAssetAnimated(ctx, def.assetKey, x, y, width, Math.max(height, width * 0.34), { rotation: item.rotation || 0 }))) {
      const railColor = item.railColor || def.railColor || '#9f7c57';
      const postColor = item.postColor || def.postColor || '#76593e';
      ctx.fillStyle = railColor;
      rounded(ctx, x - width / 2, y - height * 0.25, width, 6, 3);
      ctx.fill();
      rounded(ctx, x - width / 2, y + height * 0.10, width, 6, 3);
      ctx.fill();
      const posts = Math.max(3, Math.round(width / 26));
      ctx.fillStyle = postColor;
      for (let i = 0; i < posts; i += 1) {
        const px = x - width / 2 + (i / (posts - 1)) * width;
        rounded(ctx, px - 3, y - height / 2, 6, height + 4, 2);
        ctx.fill();
      }
    }
  } else if (kind === 'crate') {
    const width = item.width || def.width || 26;
    const height = item.height || def.height || width;
    const x = item.x || ww * 0.5;
    const y = item.y || wh * 0.5;
    if (!(def.assetKey && this.imageReady(def.assetKey) && this.drawAssetAnimated(ctx, def.assetKey, x, y, width, height, { rotation: item.rotation || 0 }))) {
      ctx.fillStyle = item.fill || def.fill || '#a97a4b';
      rounded(ctx, x - width / 2, y - height / 2, width, height, 4);
      ctx.fill();
      ctx.strokeStyle = item.edge || def.edge || '#6f4f33';
      ctx.lineWidth = 2;
      rounded(ctx, x - width / 2, y - height / 2, width, height, 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x - width / 2 + 4, y - height / 2 + 4);
      ctx.lineTo(x + width / 2 - 4, y + height / 2 - 4);
      ctx.moveTo(x + width / 2 - 4, y - height / 2 + 4);
      ctx.lineTo(x - width / 2 + 4, y + height / 2 - 4);
      ctx.stroke();
    }
  } else if (kind === 'shadow') {
    const x = item.x || ww * 0.5;
    const y = item.y || wh * 0.5;
    const rx = item.radiusX || def.radiusX || 64;
    const ry = item.radiusY || def.radiusY || 22;
    if (!(def.assetKey && this.imageReady(def.assetKey) && this.drawAssetAnimated(ctx, def.assetKey, x, y, Math.max(84, rx * 2.4), Math.max(30, ry * 3.0), { rotation: item.rotation || 0 }))) {
      ctx.fillStyle = item.color || def.color || 'rgba(16,24,18,0.10)';
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (kind === 'overlay') {
    const style = item.style || def.style || 'mist';
    if (style !== 'vignette' && def.assetKey && this.imageReady(def.assetKey)) {
      this.drawAssetAnimated(ctx, def.assetKey, ww * 0.5, wh * 0.5, item.width || def.width || ww * 1.08, item.height || def.height || wh * 1.08, { rotation: item.rotation || 0 });
    } else if (style === 'vignette') {
      const g = ctx.createRadialGradient(ww * 0.5, wh * 0.48, wh * 0.16, ww * 0.5, wh * 0.48, wh * 0.78);
      g.addColorStop(0, item.colorTop || def.colorTop || 'rgba(0,0,0,0)');
      g.addColorStop(1, item.colorBottom || def.colorBottom || 'rgba(0,0,0,0.16)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, ww, wh);
    } else {
      const g = ctx.createLinearGradient(0, 0, 0, wh);
      g.addColorStop(0, item.colorTop || def.colorTop || 'rgba(255,255,255,0.04)');
      g.addColorStop(1, item.colorBottom || def.colorBottom || 'rgba(205,224,214,0.12)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, ww, wh);
    }
  }
  ctx.restore();
}

    drawRouteRibbonAsset(ctx, path, def, item) {
      const straightKey = item.assetStraightKey || def.assetStraightKey;
      if (!straightKey || !this.imageReady(straightKey)) return false;
      const curveKey = item.assetCurveKey || def.assetCurveKey;
      const routeWidth = item.outerWidth || def.outerWidth || 48;
      const straightW = routeWidth * 1.32;
      for (let i = 1; i < path.length; i += 1) {
        const a = path[i - 1];
        const b = path[i];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const len = Math.hypot(dx, dy);
        if (len <= 1) continue;
        const mx = (a.x + b.x) * 0.5;
        const my = (a.y + b.y) * 0.5;
        const rot = Math.atan2(dy, dx) - Math.PI / 2;
        this.drawAssetAnimated(ctx, straightKey, mx, my, straightW, len + routeWidth * 0.85, { rotation: rot });
      }
      if (curveKey && this.imageReady(curveKey) && path.length >= 3) {
        const curveSize = routeWidth * 2.2;
        for (let i = 1; i < path.length - 1; i += 1) {
          const prev = path[i - 1];
          const cur = path[i];
          const next = path[i + 1];
          const a1 = Math.atan2(cur.y - prev.y, cur.x - prev.x);
          const a2 = Math.atan2(next.y - cur.y, next.x - cur.x);
          let delta = a2 - a1;
          while (delta > Math.PI) delta -= Math.PI * 2;
          while (delta < -Math.PI) delta += Math.PI * 2;
          if (Math.abs(delta) < 0.18) continue;
          this.drawAssetAnimated(ctx, curveKey, cur.x, cur.y, curveSize, curveSize, { rotation: a1 - Math.PI / 2 });
        }
      }
      return true;
    }

    drawWorldBase(ctx, theme, background, ww, wh) {
      const layer = background && background.layers ? background.layers.base : {};
      const g = ctx.createLinearGradient(0, 0, 0, wh);
      g.addColorStop(0, theme.bgTop);
      g.addColorStop(0.55, theme.bgMid);
      g.addColorStop(1, theme.bgBottom);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, ww, wh);
      const assetDrawn = this.drawBackgroundAssetLayer(ctx, layer, ww, wh);
      const partsDrawn = this.drawBackgroundPartLayer(ctx, 'base', background, ww, wh);
      if ((assetDrawn || partsDrawn) && layer.hideTexture) return;
      const textureAsset = layer.textureAsset || 'tileGrassMeadow';
      const fallbackAsset = layer.textureFallback || 'tileGrass';
      const drawKey = this.imageReady(textureAsset) ? textureAsset : fallbackAsset;
      if (this.imageReady(drawKey)) {
        ctx.save();
        ctx.globalAlpha = layer.textureAlpha == null ? 0.20 : layer.textureAlpha;
        for (let y = -20; y < wh; y += 92) {
          for (let x = -28; x < ww; x += 92) {
            this.drawAsset(ctx, drawKey, x + 46, y + 46, 98, 98);
          }
        }
        ctx.restore();
      }
    }

    drawWorldBackDecorations(ctx, theme, background, ww, wh, wx, wy) {
      const layer = background && background.layers ? background.layers.decorationBack : {};
      const assetDrawn = this.drawBackgroundAssetLayer(ctx, layer, ww, wh);
      const partsDrawn = this.drawBackgroundPartLayer(ctx, 'decorationBack', background, ww, wh);
      if ((assetDrawn || partsDrawn) && layer.hideProcedural) return;
      ctx.fillStyle = theme.blob;
      this.blob(ctx, wx(28), wy(116), wx(180), wy(80));
      this.blob(ctx, wx(380), wy(190), wx(160), wy(95));
      this.blob(ctx, wx(392), wy(720), wx(140), wy(80));
      const densityBase = layer.densityBase || 28;
      const decorationCount = Math.max(layer.minCount || 32, Math.round((ww * wh) / (C.w * C.h) * densityBase));
      const avoidPathDistance = layer.avoidPathDistance == null ? 56 : layer.avoidPathDistance;
      for (let i = 0; i < decorationCount; i += 1) {
        const x = (i * 83 + 37) % ww;
        const y = 145 + ((i * 137) % Math.max(240, wh - 210));
        if (this.distanceToPath(x, y) <= avoidPathDistance) continue;
        if (layer.avoidPadDistance != null && (this.pads || []).some((pad) => Math.hypot((pad.x || 0) - x, (pad.y || 0) - y) < layer.avoidPadDistance)) continue;
        if (layer.avoidCastleDistance != null && Math.hypot((C.castle.x || 0) - x, (C.castle.y || 0) - y) < layer.avoidCastleDistance) continue;
        if (theme.object === 'rock') this.drawRock(ctx, x, y, 0.65 + (i % 3) * 0.15);
        else if (theme.object === 'reed') this.drawReed(ctx, x, y, 0.72 + (i % 3) * 0.12);
        else this.drawTree(ctx, x, y, 0.72 + (i % 3) * 0.12);
      }
    }
    drawWorldRoutes(ctx, theme, background, routePaths) {
      const layer = background && background.layers ? background.layers.path : {};
      const assetDrawn = this.drawBackgroundAssetLayer(ctx, layer, this.worldWidth(), this.worldHeight());
      const partsDrawn = this.drawBackgroundPartLayer(ctx, 'path', background, this.worldWidth(), this.worldHeight());
      if ((assetDrawn || partsDrawn) && layer.hideRuntimeLines) {
        if (layer.visibilityGuide !== false) this.drawWorldRouteVisibilityGuide(ctx, layer, routePaths);
        return;
      }
      if (partsDrawn) {
        if (layer.visibilityGuide !== false) this.drawWorldRouteVisibilityGuide(ctx, layer, routePaths);
        return;
      }
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = layer.outerColor || theme.roadOuter;
      ctx.lineWidth = layer.outerWidth || 56;
      for (const path of routePaths) this.drawPathLine(ctx, path);
      ctx.strokeStyle = layer.innerColor || theme.roadInner;
      ctx.lineWidth = layer.innerWidth || 40;
      for (const path of routePaths) this.drawPathLine(ctx, path);
      ctx.strokeStyle = layer.detailColor || 'rgba(90,59,34,0.25)';
      ctx.lineWidth = layer.detailWidth || 2;
      for (const path of routePaths) this.drawPathLine(ctx, path);
      ctx.restore();
    }

    drawWorldRouteVisibilityGuide(ctx, layer, routePaths) {
      if (!routePaths || !routePaths.length) return;
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = layer.guideOuterColor || 'rgba(46, 35, 24, 0.18)';
      ctx.lineWidth = layer.guideOuterWidth || 62;
      for (const path of routePaths) this.drawPathLine(ctx, path);
      ctx.strokeStyle = layer.guideInnerColor || 'rgba(255, 231, 169, 0.12)';
      ctx.lineWidth = layer.guideInnerWidth || 40;
      for (const path of routePaths) this.drawPathLine(ctx, path);
      ctx.strokeStyle = layer.guideCenterColor || 'rgba(31, 77, 52, 0.24)';
      ctx.lineWidth = layer.guideCenterWidth || 3;
      for (const path of routePaths) this.drawPathLine(ctx, path);
      ctx.restore();
    }

    drawWorldTerritory(ctx) {
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
    }

    drawWorldFrontDecorations(ctx, theme, background, ww, wh, wx, wy) {
      const layer = background && background.layers ? background.layers.decorationFront : {};
      const assetDrawn = this.drawBackgroundAssetLayer(ctx, layer, ww, wh);
      const partsDrawn = this.drawBackgroundPartLayer(ctx, 'decorationFront', background, ww, wh);
      if ((assetDrawn || partsDrawn) && layer.hideProcedural) return;
      ctx.save();
      ctx.globalAlpha *= layer.alpha == null ? 1 : layer.alpha;
      if (layer.waterBlob !== false) {
        ctx.fillStyle = theme.water;
        this.blob(ctx, wx(430), wy(290), wx(80), wy(130));
      }
      const edgeHeight = layer.edgeHeight == null ? 40 : layer.edgeHeight;
      if (edgeHeight > 0) {
        ctx.fillStyle = '#506775';
        ctx.fillRect(0, wh - edgeHeight, ww, edgeHeight);
        ctx.fillStyle = '#31424d';
        ctx.fillRect(0, wh - Math.round(edgeHeight / 2), ww, Math.round(edgeHeight / 2));
      }
      ctx.restore();
    }

    drawWorldAtmosphere(ctx, background, ww, wh) {
      const layer = background && background.layers ? background.layers.atmosphere : {};
      this.drawBackgroundAssetLayer(ctx, layer, ww, wh);
      this.drawBackgroundPartLayer(ctx, 'atmosphere', background, ww, wh);
    }

    drawWorldLabel(ctx, theme, background, wx, wy) {
      const layer = background && background.layers ? background.layers.labels : {};
      if (layer.visible === false) return;
      ctx.save();
      ctx.globalAlpha *= layer.alpha == null ? 1 : layer.alpha;
      ctx.fillStyle = 'rgba(10, 18, 16, 0.35)';
      rounded(ctx, wx(14), wy(136), 210, 31, 8);
      ctx.fill();
      ctx.fillStyle = '#fff0bb';
      ctx.font = '800 12px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(`${theme.name} / ${theme.rule}`, wx(24), wy(155));
      ctx.restore();
    }


    drawMapDesignGuides(ctx, theme) {
      const key = this.stage ? this.stage.key : 'meadow';
      const chokepoints = (C.routeChokepoints && C.routeChokepoints[key]) || [];
      const trails = (C.mapGuideTrails && C.mapGuideTrails[key]) || [];
      const categoryColors = C.categoryColors || {};
      ctx.save();
      for (const trail of trails) {
        const pts = trail.points || [];
        if (pts.length < 2) continue;
        const color = categoryColors[trail.kind] || 'rgba(255, 236, 158, 0.55)';
        ctx.globalAlpha = 0.36;
        ctx.strokeStyle = color;
        ctx.lineWidth = 7;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.setLineDash([12, 14]);
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i += 1) ctx.lineTo(pts[i].x, pts[i].y);
        ctx.stroke();
        ctx.setLineDash([]);
        const last = pts[pts.length - 1];
        ctx.globalAlpha = 0.72;
        ctx.fillStyle = color;
        ctx.font = '900 15px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText((trail.label || '').slice(0, 8), last.x, last.y - 18);
      }
      for (const cp of chokepoints) {
        const color = categoryColors.defense || '#ff6b5e';
        const pulse = 0.5 + 0.5 * Math.sin((this.time || 0) * 0.004 + cp.x * 0.01);
        ctx.globalAlpha = 0.12 + pulse * 0.08;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(cp.x, cp.y, cp.r || 64, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 0.42;
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 8]);
        ctx.beginPath();
        ctx.arc(cp.x, cp.y, cp.r || 64, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 0.78;
        ctx.fillStyle = 'rgba(18, 20, 16, 0.72)';
        rounded(ctx, cp.x - 36, cp.y - 15, 72, 24, 8);
        ctx.fill();
        ctx.fillStyle = '#fff0bb';
        ctx.font = '900 13px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText((cp.label || '').slice(0, 5), cp.x, cp.y + 2);
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    }


    drawUpcomingRoutePreview(ctx) {
      if (!this.wave || this.wave.active || this.wave.index < -1) return;
      const next = this.waves && this.waves[this.wave.index + 1];
      if (!next || !next.groups) return;
      const rest = this.wave.rest == null ? 9999 : this.wave.rest;
      if (rest > 5200) return;
      const t = 0.45 + 0.35 * Math.sin((this.time || 0) * 0.010);
      const routes = new Set(next.groups.map((g) => g.route || 'main'));
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (const route of routes) {
        const path = this.routePath(route);
        if (!path || path.length < 2) continue;
        ctx.strokeStyle = route === 'side' ? `rgba(205, 116, 255, ${0.20 + t * 0.22})` : `rgba(255, 215, 91, ${0.18 + t * 0.20})`;
        ctx.lineWidth = route === 'side' ? 18 : 16;
        this.drawPathLine(ctx, path);
        ctx.strokeStyle = route === 'side' ? `rgba(248, 214, 255, ${0.18 + t * 0.22})` : `rgba(255, 244, 190, ${0.14 + t * 0.20})`;
        ctx.lineWidth = 4;
        this.drawPathLine(ctx, path);
      }
      ctx.restore();
    }

    drawPathLine(ctx, pts) {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i += 1) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.stroke();
    }
    drawRaidTrails(ctx, theme) {
      const sites = (this.discoveries || []).filter((d) => d.discovered && this.isRaidableDiscovery && this.isRaidableDiscovery(d));
      if (!sites.length || !this.raidTrailPathForSite) return;
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (const site of sites) {
        const path = this.raidTrailPathForSite(site, site.x > this.castle.x ? 'side' : 'main');
        if (!path || path.length < 2) continue;
        const danger = (site.siteUnderRaid || 0) > 0;
        ctx.strokeStyle = danger ? 'rgba(163, 79, 48, 0.82)' : 'rgba(171, 126, 76, 0.38)';
        ctx.lineWidth = danger ? 25 : 18;
        this.drawPathLine(ctx, path);
        ctx.strokeStyle = danger ? 'rgba(224, 151, 92, 0.90)' : (theme ? theme.roadInner : 'rgba(189, 143, 92, 0.55)');
        ctx.lineWidth = danger ? 13 : 9;
        this.drawPathLine(ctx, path);
        ctx.strokeStyle = 'rgba(74, 46, 27, 0.28)';
        ctx.lineWidth = 1.5;
        this.drawPathLine(ctx, path);
      }
      ctx.restore();
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
      const stagePaths = (C.stagePaths && C.stagePaths[this.stageKey && this.stageKey()]) || C.stagePaths.meadow || {};
      const routes = Object.keys(stagePaths).length ? Object.keys(stagePaths) : ['main', 'side'];
      for (const route of routes) {
        const path = this.routePath(route);
        if (!path || path.length < 2) continue;
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
      if (this.drawAsset(ctx, 'castleKeep', c.x, c.y - 3, 126, 112)) {
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

    drawDiscoveries(ctx) {
      if (!this.discoveries || !this.discoveries.length) return;
      const compact = this.isMobileView && this.isMobileView();
      for (const d of this.discoveries) {
        const near = distXY(this.king.x, this.king.y, d.x, d.y) < (C.discoveryRevealRadius || 76) + 40;
        const screen = this.worldToScreen ? this.worldToScreen(d.x, d.y) : { x: d.x, y: d.y };
        const onScreen = screen.x > -80 && screen.x < C.w + 80 && screen.y > -80 && screen.y < C.h + 80;
        if (!onScreen && !near) continue;
        const pulse = 1 + Math.sin((d.pulse || this.time) * 0.006) * 0.08;
        const flash = Math.max(0, (d.flash || 0) / 1200);
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.scale(pulse + flash * 0.16, pulse + flash * 0.16);
        ctx.fillStyle = d.discovered ? 'rgba(255, 243, 163, 0.20)' : 'rgba(6, 10, 12, 0.40)';
        ctx.beginPath();
        ctx.arc(0, 0, d.discovered ? 34 : 28, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = d.discovered ? 'rgba(255, 243, 163, 0.78)' : 'rgba(255, 240, 188, 0.58)';
        ctx.lineWidth = d.discovered ? 3 : 2;
        ctx.setLineDash(d.discovered ? [] : [5, 5]);
        ctx.beginPath();
        ctx.arc(0, 0, d.discovered ? 28 : 24, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        const raidable = this.isRaidableDiscovery && this.isRaidableDiscovery(d);
        const damaged = raidable && (d.siteHp || 0) < (d.siteMaxHp || 1) * 0.55;
        const underRaid = raidable && (d.siteUnderRaid || 0) > 0;
        ctx.fillStyle = underRaid ? '#ffb08a' : damaged ? '#ffd35b' : d.discovered ? '#fff3a3' : '#fff0bb';
        ctx.font = d.discovered ? '900 18px system-ui' : '900 22px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const symbol = d.discovered ? (this.discoverySiteLabel ? this.discoverySiteLabel(d) : '発見') : '?';
        ctx.fillText(symbol.length > 2 ? symbol.slice(0, 2) : symbol, 0, 0);
        if (d.discovered || near) {
          const label = d.discovered ? d.name : '未発見地点';
          ctx.textBaseline = 'alphabetic';
          ctx.font = compact ? '900 14px system-ui' : '900 12px system-ui';
          ctx.lineWidth = 4;
          ctx.strokeStyle = 'rgba(0,0,0,0.60)';
          ctx.strokeText(label, 0, -34);
          ctx.fillText(label, 0, -34);
        }
        if (raidable) {
          const ratio = clamp((d.siteHp || 0) / Math.max(1, d.siteMaxHp || 1), 0, 1);
          ctx.fillStyle = 'rgba(0,0,0,0.48)';
          rounded(ctx, -24, 31, 48, 5, 3);
          ctx.fill();
          ctx.fillStyle = underRaid ? '#ff8b5e' : damaged ? '#ffd35b' : '#86e3a0';
          rounded(ctx, -24, 31, 48 * ratio, 5, 3);
          ctx.fill();
          if (underRaid) {
            ctx.strokeStyle = 'rgba(255,107,94,0.72)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, 40 + Math.sin(this.time * 0.02) * 4, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
        ctx.restore();
      }
    }

    drawPads(ctx) {
      const compact = this.isMobileView && this.isMobileView();
      for (const pad of this.pads) {
        if (this.isPadVisible && !this.isPadVisible(pad)) continue;
        const def = C.facilityTypes[pad.type];
        const existing = pad.facilityId ? this.facilities.find((f) => f.id === pad.facilityId) : null;
        if (existing) continue;
        const locked = !this.isPadUnlocked(pad);
        const progress = locked ? 0 : pad.invested / def.cost;
        const nearKing = distXY(this.king.x, this.king.y, pad.x, pad.y) < 42;
        const revealFlash = Math.max(0, (pad.revealFlash || 0) / 1200);
        const pulse = Math.sin(pad.pulse * 0.004) * 0.08 + 1 + (progress > 0 ? Math.sin(this.time * 0.018) * 0.025 : 0) + revealFlash * 0.10;
        ctx.save();
        ctx.translate(pad.x, pad.y);
        ctx.scale(pulse, pulse);
        const category = this.facilityCategory ? this.facilityCategory(pad.type) : 'defense';
        const categoryColor = this.facilityCategoryColor ? this.facilityCategoryColor(pad.type) : def.accent;
        const padVisibility = C.padVisibility || {};
        if (padVisibility.backgroundHalo !== false) {
          ctx.save();
          ctx.globalAlpha = locked ? 0.28 : nearKing ? Math.min(0.62, 0.46 + (padVisibility.nearHaloBoost || 0)) : 0.36;
          ctx.fillStyle = padVisibility.shadowColor || 'rgba(4, 10, 8, 0.42)';
          ctx.beginPath();
          ctx.ellipse(0, 6, nearKing ? 46 : 40, nearKing ? 30 : 25, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
          ctx.fillStyle = locked ? (padVisibility.lockedHaloColor || 'rgba(170, 178, 168, 0.12)') : (padVisibility.haloColor || 'rgba(255, 241, 184, 0.16)');
          ctx.beginPath();
          ctx.ellipse(0, 0, nearKing ? 43 : 37, nearKing ? 28 : 23, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = locked ? 'rgba(220, 220, 220, 0.24)' : categoryColor;
          ctx.globalAlpha = padVisibility.borderAlpha == null ? 0.42 : padVisibility.borderAlpha;
          ctx.lineWidth = nearKing ? 3 : 2;
          ctx.beginPath();
          ctx.ellipse(0, 0, nearKing ? 43 : 37, nearKing ? 28 : 23, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
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
        ctx.fillStyle = locked ? 'rgba(80, 86, 82, 0.58)' : categoryColor;
        ctx.globalAlpha = locked ? 0.38 : 0.22;
        ctx.beginPath();
        ctx.arc(0, -2, nearKing ? 27 : 23, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = locked ? 'rgba(220,220,220,0.28)' : categoryColor;
        ctx.lineWidth = nearKing ? 3 : 2;
        ctx.beginPath();
        ctx.arc(0, -2, nearKing ? 27 : 23, 0, Math.PI * 2);
        ctx.stroke();
        const iconText = this.facilityIcon ? this.facilityIcon(pad.type) : (def.name || '?').slice(0, 1);
        const showNameLabel = iconText !== def.name && !(def.name || '').startsWith(iconText);
        ctx.fillStyle = locked ? '#c3c7bd' : '#fff4c8';
        ctx.font = nearKing ? '900 18px system-ui' : '900 15px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(iconText, 0, 3);
        if (!locked && this.padStrategicScore) {
          const rec = this.padStrategicScore(pad);
          if (rec && rec.grade) {
            ctx.fillStyle = rec.score >= 72 ? '#9ee1bb' : rec.score >= 55 ? '#ffd35b' : 'rgba(255,240,188,0.78)';
            ctx.font = nearKing ? '900 15px system-ui' : '900 12px system-ui';
            ctx.fillText(rec.grade, nearKing ? 29 : 24, nearKing ? -20 : -17);
          }
        }

        ctx.strokeStyle = locked ? 'rgba(220,220,220,0.28)' : nearKing ? 'rgba(255,246,170,0.95)' : categoryColor;
        ctx.lineWidth = nearKing ? 4 : 2;
        ctx.setLineDash(locked ? [3, 5] : nearKing ? [] : [6, 4]);
        rounded(ctx, nearKing ? -40 : -34, nearKing ? -28 : -22, nearKing ? 80 : 68, nearKing ? 56 : 44, 10);
        ctx.stroke();
        ctx.setLineDash([]);

        if (!locked) {
          ctx.fillStyle = 'rgba(245, 211, 107, 0.24)';
          rounded(ctx, -32, 15, 64 * progress, 6, 3);
          ctx.fill();
          const holdNeed = C.buildHoldTime || 620;
          const holdProgress = Math.max(0, Math.min(1, (pad.holdTime || 0) / holdNeed));
          if (nearKing && holdProgress > 0 && holdProgress < 1) {
            ctx.fillStyle = 'rgba(255, 246, 170, 0.32)';
            rounded(ctx, -32, 23, 64 * holdProgress, 6, 3);
            ctx.fill();
            ctx.strokeStyle = `rgba(255, 246, 170, ${0.30 + holdProgress * 0.45})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, -2, 30 + holdProgress * 14, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * holdProgress);
            ctx.stroke();
            for (let i = 0; i < 4; i += 1) {
              const a = this.time * 0.006 + i * Math.PI * 0.5;
              ctx.fillStyle = `rgba(255, 240, 188, ${0.20 + holdProgress * 0.30})`;
              ctx.beginPath();
              ctx.arc(Math.cos(a) * (30 + holdProgress * 10), -2 + Math.sin(a) * (22 + holdProgress * 7), 2.2, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.fillStyle = '#fff0bb';
            ctx.font = compact ? '900 12px system-ui' : '800 9px system-ui';
            ctx.textAlign = 'center';
            ctx.fillText(compact ? '待機で建設' : '待機', 0, compact ? 38 : 34);
          }
        }

        ctx.textAlign = 'center';
        if (compact) {
          if (nearKing) {
            ctx.fillStyle = '#fff0bb';
            ctx.font = '900 15px system-ui';
            ctx.strokeStyle = 'rgba(0,0,0,0.60)';
            ctx.lineWidth = 4;
            if (locked || showNameLabel) {
              const label = locked ? `${def.name} 未解放` : def.name;
              ctx.strokeText(label, 0, -33);
              ctx.fillText(label, 0, -33);
            }
            ctx.font = '900 11px system-ui';
            const role = this.facilityShortText ? this.facilityShortText(pad.type).slice(0, 12) : '';
            ctx.strokeText(role, 0, -48);
            ctx.fillText(role, 0, -48);
          }
        } else {
          if (locked || showNameLabel) {
            ctx.fillStyle = locked ? '#c3c7bd' : '#fff0bb';
            ctx.font = '700 10px system-ui';
            ctx.fillText(locked ? '未解放' : def.name, 0, nearKing ? -34 : -30);
          }
        }
        ctx.restore();
      }
    }

    drawFacilities(ctx) {
      for (const f of this.facilities) {
        ctx.save();
        if (f.hit > 0) ctx.translate(rand(-1.5, 1.5), rand(-1.5, 1.5));
        const plate = C.facilityGroundPlate || {};
        if (plate.enabled !== false) {
          const levelColor = this.facilityLevelColor(f.level || 1);
          const rx = (plate.radiusX || 33) + (f.level - 1) * 2;
          const ry = (plate.radiusY || 13) + (f.level - 1);
          const py = f.y + (plate.yOffset || 18);
          ctx.save();
          ctx.globalAlpha = plate.shadowAlpha == null ? 0.26 : plate.shadowAlpha;
          ctx.fillStyle = 'rgb(10, 18, 16)';
          ctx.beginPath();
          ctx.ellipse(f.x, py, rx, ry, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = plate.haloAlpha == null ? 0.11 : plate.haloAlpha;
          ctx.fillStyle = levelColor;
          ctx.beginPath();
          ctx.ellipse(f.x, py - 1, Math.max(18, rx - 8), Math.max(7, ry - 4), 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = plate.borderAlpha == null ? 0.18 : plate.borderAlpha;
          ctx.strokeStyle = levelColor;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(f.x, py, rx, ry, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
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
          ctx.fillStyle = `rgba(255, 239, 160, ${0.08 + t * 0.18})`;
          ctx.beginPath();
          ctx.ellipse(f.x, f.y + 20, 42 + (1 - t) * 18, 12 + (1 - t) * 5, 0, 0, Math.PI * 2);
          ctx.fill();
          for (let i = 0; i < 6; i += 1) {
            const a = this.time * 0.008 + i * 1.047;
            ctx.fillStyle = `rgba(255, 230, 148, ${0.16 + t * 0.24})`;
            ctx.beginPath();
            ctx.arc(f.x + Math.cos(a) * (30 + (1 - t) * 24), f.y - 5 + Math.sin(a) * (20 + (1 - t) * 12), 2.4, 0, Math.PI * 2);
            ctx.fill();
          }
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
        const levelColor = this.facilityLevelColor(f.level || 1);
        const levelFlashT = clamp((f.levelFlash || 0) / 900, 0, 1);
        const upgradeTransitionT = clamp((f.upgradeTransition || 0) / (f.upgradeTransitionMax || 980), 0, 1);
        const maxPulseT = clamp((f.maxLevelPulse || 0) / 1480, 0, 1);
        if (levelFlashT > 0) {
          ctx.save();
          ctx.globalAlpha = 0.20 + levelFlashT * 0.42;
          ctx.strokeStyle = levelColor;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(f.x, f.y - 4, 38 + (1 - levelFlashT) * 30, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 0.10 + levelFlashT * 0.18;
          ctx.fillStyle = levelColor;
          ctx.beginPath();
          ctx.arc(f.x, f.y - 4, 30 + (1 - levelFlashT) * 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        const blinkVisible = levelFlashT <= 0 || Math.floor(this.time / 90) % 2 === 0;
        const drawOpts = { yOffset: -4 };
        const drawX = f.x + Math.cos(f.fireAngle || -Math.PI / 2) * recoil;
        const drawY = f.y + floatY;
        const drawW = assetSize[0] * baseScale * popScale;
        const drawH = assetSize[1] * baseScale * popScale;
        let usedAsset = false;
        if (assetKey && upgradeTransitionT > 0) {
          const transitionIn = 1 - upgradeTransitionT;
          const prevLevel = f.upgradeFromLevel || Math.max(1, (f.level || 1) - 1);
          const previousKey = this.facilityAssetKey({ ...f, level: prevLevel });
          if (previousKey && this.imageReady(previousKey)) {
            ctx.save();
            ctx.globalAlpha = 0.10 + upgradeTransitionT * 0.52;
            this.drawAssetAnimated(ctx, previousKey, drawX, drawY, drawW * (1 + upgradeTransitionT * 0.10), drawH * (1 + upgradeTransitionT * 0.10), drawOpts);
            ctx.restore();
          }
          ctx.save();
          ctx.globalAlpha = 0.62 + transitionIn * 0.38;
          usedAsset = !!(blinkVisible && this.drawAssetAnimated(ctx, assetKey, drawX, drawY - transitionIn * 3, drawW * (1.08 + Math.sin(transitionIn * Math.PI) * 0.12), drawH * (1.08 + Math.sin(transitionIn * Math.PI) * 0.12), drawOpts));
          ctx.restore();
          ctx.save();
          ctx.globalAlpha = 0.16 + transitionIn * 0.26;
          ctx.strokeStyle = levelColor;
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.arc(f.x, f.y - 8, 34 + transitionIn * 18, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        } else {
          usedAsset = blinkVisible && assetKey && this.drawAssetAnimated(ctx, assetKey, drawX, drawY, drawW, drawH, drawOpts);
        }
        if (!usedAsset) {
          if (f.type === 'palisade') this.drawPalisade(ctx, f);
          else if (f.type === 'archer') this.drawTower(ctx, f, true);
          else if (f.type === 'cannon') this.drawTower(ctx, f, false);
          else if (f.type === 'barracks') this.drawHouse(ctx, f);
          else if (f.type === 'mine') this.drawMine(ctx, f);
        }
        if (upgradeTransitionT > 0) {
          const upgradeText = f.level >= this.facilityMaxLevel(f.type) ? 'MAX LEVEL!' : 'LEVEL UP!';
          ctx.save();
          ctx.globalAlpha = 0.22 + upgradeTransitionT * 0.72;
          ctx.fillStyle = 'rgba(255,255,255,0.18)';
          ctx.beginPath();
          ctx.ellipse(f.x, f.y + 18, 44 + (1 - upgradeTransitionT) * 12, 12 + (1 - upgradeTransitionT) * 3, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.font = '900 14px system-ui';
          ctx.textAlign = 'center';
          ctx.lineWidth = 4;
          ctx.strokeStyle = 'rgba(0,0,0,0.55)';
          ctx.fillStyle = '#fff3a3';
          ctx.strokeText(upgradeText, f.x, f.y - drawH * 0.50 - 18);
          ctx.fillText(upgradeText, f.x, f.y - drawH * 0.50 - 18);
          ctx.font = '900 12px system-ui';
          ctx.strokeStyle = 'rgba(0,0,0,0.5)';
          ctx.fillStyle = levelColor;
          ctx.strokeText(`Lv.${f.level}`, f.x, f.y - drawH * 0.50 - 2);
          ctx.fillText(`Lv.${f.level}`, f.x, f.y - drawH * 0.50 - 2);
          ctx.restore();
        }
        if (maxPulseT > 0) {
          ctx.save();
          ctx.globalAlpha = 0.22 + maxPulseT * 0.32;
          ctx.strokeStyle = '#ffe58f';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(f.x, f.y - 6, 46 + (1 - maxPulseT) * 22, 0, Math.PI * 2);
          ctx.stroke();
          for (let i = 0; i < 8; i += 1) {
            const a = this.time * 0.012 + i * (Math.PI / 4);
            const px = f.x + Math.cos(a) * (34 + (1 - maxPulseT) * 16);
            const py = f.y - 12 + Math.sin(a) * (22 + (1 - maxPulseT) * 10);
            ctx.fillStyle = i % 2 === 0 ? '#ffe58f' : '#fff3c2';
            ctx.beginPath();
            ctx.arc(px, py, 2.6 + maxPulseT * 1.4, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
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
          ctx.strokeStyle = '#ffd35b';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(f.x, f.y - 8, 24 + (1 - workT) * 16, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
        this.drawFacilityAttackOverlay(ctx, f, fireT, workT, spawnT);
        this.drawBar(ctx, f.x - 24, f.y + 30, 48, 5, f.hp / f.maxHp, '#86e3a0');
        ctx.fillStyle = levelColor;
        ctx.font = '900 10px system-ui';
        ctx.textAlign = 'center';
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(0,0,0,0.55)';
        ctx.strokeText(`Lv.${f.level}`, f.x, f.y + 44);
        ctx.fillText(`Lv.${f.level}`, f.x, f.y + 44);
        const pad = this.pads.find((p) => p.facilityId === f.id);
        if (pad && f.level < this.facilityMaxLevel(f.type) && pad.upgradeInvested > 0) {
          const need = this.getUpgradeNeed(f);
          this.drawBar(ctx, f.x - 25, f.y + 50, 50, 5, pad.upgradeInvested / need, this.facilityLevelColor((f.level || 1) + 1));
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
        const drawT = 1 - fireT;
        ctx.strokeStyle = `rgba(255, 240, 185, ${0.28 + fireT * 0.55})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(f.x, f.y - 8);
        ctx.lineTo(mx, my);
        ctx.stroke();
        ctx.strokeStyle = `rgba(255, 246, 202, ${0.45 + fireT * 0.40})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(f.x, f.y - 21, 14 + drawT * 3, angle - 0.85, angle + 0.85);
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
        ctx.strokeStyle = `rgba(255, 229, 168, ${0.35 + fireT * 0.32})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(f.x, f.y - 8);
        ctx.lineTo(mx + Math.cos(angle) * 18, my + Math.sin(angle) * 18);
        ctx.stroke();
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
        ctx.strokeStyle = 'rgba(255, 236, 158, 0.60)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(f.x - 16, f.y - 18);
        ctx.lineTo(f.x + 4 + Math.sin(this.time * 0.02) * 8, f.y - 30);
        ctx.stroke();
        ctx.restore();
      }
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
        if (e.raidTargetId) {
          ctx.fillStyle = 'rgba(88, 43, 110, 0.78)';
          rounded(ctx, e.x - 19, e.y - e.r - 27, 38, 14, 7);
          ctx.fill();
          ctx.fillStyle = '#fff0ff';
          ctx.font = '800 9px system-ui';
          ctx.textAlign = 'center';
          ctx.fillText('略奪', e.x, e.y - e.r - 17);
          ctx.strokeStyle = `rgba(215, 190, 255, ${0.24 + Math.sin(this.time * 0.014 + e.animSeed) * 0.10})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.r + 10 + Math.sin(this.time * 0.01 + e.animSeed) * 3, 0, Math.PI * 2);
          ctx.stroke();
        }
        if (e.def.explode) {
          const blink = 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(this.time * 0.030 + e.animSeed));
          ctx.fillStyle = `rgba(255, 219, 107, ${blink})`;
          ctx.beginPath();
          ctx.arc(e.x + e.r * 0.62, e.y - e.r * 0.62, 4 + blink * 3, 0, Math.PI * 2);
          ctx.fill();
        }
        if (e.def.armor) {
          ctx.strokeStyle = `rgba(220, 229, 255, ${0.18 + hitT * 0.42})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.r + 7, Math.PI * 1.08, Math.PI * 1.92);
          ctx.stroke();
        }
        if (e.slow > 0) {
          for (let i = 0; i < 4; i += 1) {
            const a = this.time * 0.006 + e.animSeed + i * Math.PI * 0.5;
            ctx.fillStyle = 'rgba(189,238,255,0.35)';
            ctx.beginPath();
            ctx.arc(e.x + Math.cos(a) * (e.r + 7), e.y + Math.sin(a) * (e.r + 4), 2.4, 0, Math.PI * 2);
            ctx.fill();
          }
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
      for (const p of this.motionParticles || []) {
        const t = clamp(1 - p.life / p.max, 0, 1);
        const alpha = clamp(p.life / p.max, 0, 1);
        if (p.kind === 'stream') {
          const tt = clamp((t * p.max - (p.delay || 0)) / Math.max(1, p.max - (p.delay || 0)), 0, 1);
          const cx = (p.fromX + p.toX) / 2;
          const cy = (p.fromY + p.toY) / 2 + (p.arc || -18) + Math.sin((p.seed || 0) + tt * Math.PI) * 8;
          const x = (1 - tt) * (1 - tt) * p.fromX + 2 * (1 - tt) * tt * cx + tt * tt * p.toX;
          const y = (1 - tt) * (1 - tt) * p.fromY + 2 * (1 - tt) * tt * cy + tt * tt * p.toY;
          ctx.globalAlpha = alpha * 0.85;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x - (p.toX - p.fromX) * 0.035, y - (p.toY - p.fromY) * 0.035);
          ctx.stroke();
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(x, y, p.r || 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        } else if (p.kind === 'spark') {
          ctx.globalAlpha = alpha * 0.9;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, (p.r || 2) * (0.6 + alpha * 0.6), 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
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
      for (const r of this.impactRings || []) {
        const t = clamp(r.life / r.max, 0, 1);
        ctx.globalAlpha = t * 0.65;
        ctx.strokeStyle = r.color;
        ctx.lineWidth = Math.max(1, r.width * t);
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius * (0.35 + (1 - t) * 0.75), 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
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
      for (const d of (this.discoveries || [])) {
        const far = distXY(this.king.x, this.king.y, d.x, d.y) > 210;
        if (!d.discovered && far) items.push({ x: d.x, y: d.y, label: '?', color: '#fff0bb', priority: 2 });
        else if (d.discovered && this.isRaidableDiscovery && this.isRaidableDiscovery(d) && far) {
          const underRaid = (d.siteUnderRaid || 0) > 0;
          const damaged = (d.siteHp || 0) < (d.siteMaxHp || 1) * 0.55;
          if (underRaid || damaged) items.push({ x: d.x, y: d.y, label: underRaid ? '襲撃' : this.discoverySiteLabel(d), color: underRaid ? '#ff6b5e' : '#ffd35b', priority: underRaid ? 0 : 2 });
        }
      }
      const visibleEnemies = (this.enemies || []).filter((e) => e.hp > 0).slice(0, 24);
      for (const e of visibleEnemies) {
        const screen = this.worldToScreen(e.x, e.y);
        const offscreen = screen.x < -20 || screen.x > C.w + 20 || screen.y < -20 || screen.y > C.h + 20;
        if (offscreen || e.def.boss || e.raidTargetId) items.push({ x: e.x, y: e.y, label: e.def.boss ? 'ボス' : e.raidTargetId ? '略奪' : '敵', color: e.def.boss ? '#ffd35b' : e.raidTargetId ? '#d7beff' : '#ff6b5e', priority: e.def.boss ? 0 : e.raidTargetId ? 1 : 3 });
      }
      const activePads = (this.pads || []).filter((p) => (!this.isPadVisible || this.isPadVisible(p)) && !p.facilityId && this.isPadUnlocked(p)).slice(0, 16);
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

    drawMiniMap(ctx) {
      const worldW = this.worldWidth ? this.worldWidth() : C.w;
      const worldH = this.worldHeight ? this.worldHeight() : C.h;
      if (worldW <= C.w && worldH <= C.h) return;

      const bounds = this.miniMapBounds ? this.miniMapBounds() : { x: C.w - 140, y: C.h - 206, w: 128, h: 188, expanded: false };
      const mapW = bounds.w;
      const mapH = bounds.h;
      const x = bounds.x;
      const y = bounds.y;
      const expanded = !!bounds.expanded;
      const compact = this.isMobileView && this.isMobileView();
      const pad = expanded ? 12 : 8;
      const titleH = expanded ? 30 : 24;
      const legendH = expanded ? 24 : 22;
      const innerX = x + pad;
      const innerY = y + titleH;
      const innerW = mapW - pad * 2;
      const innerH = mapH - titleH - legendH;
      const sx = innerW / worldW;
      const sy = innerH / worldH;
      const mx = (wx) => innerX + wx * sx;
      const my = (wy) => innerY + wy * sy;

      ctx.save();
      ctx.fillStyle = expanded ? 'rgba(8, 13, 15, 0.88)' : 'rgba(10, 16, 18, 0.76)';
      rounded(ctx, x, y, mapW, mapH, expanded ? 18 : 14);
      ctx.fill();
      ctx.strokeStyle = expanded ? 'rgba(255, 240, 188, 0.70)' : 'rgba(255, 240, 188, 0.40)';
      ctx.lineWidth = expanded ? 2 : 1.5;
      rounded(ctx, x + 0.5, y + 0.5, mapW - 1, mapH - 1, expanded ? 18 : 14);
      ctx.stroke();

      ctx.fillStyle = '#fff0bb';
      ctx.font = expanded ? '900 18px system-ui' : compact ? '900 12px system-ui' : '900 11px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(expanded ? '全体マップ' : '地図', x + 10, y + (expanded ? 21 : 16));
      ctx.textAlign = 'right';
      ctx.fillStyle = 'rgba(255, 244, 214, 0.78)';
      ctx.font = expanded ? '800 12px system-ui' : '800 9px system-ui';
      ctx.fillText(expanded ? 'タップで閉じる' : 'タップで拡大', x + mapW - 10, y + (expanded ? 21 : 16));

      ctx.save();
      rounded(ctx, innerX, innerY, innerW, innerH, expanded ? 10 : 8);
      ctx.clip();
      ctx.fillStyle = 'rgba(58, 119, 77, 0.62)';
      ctx.fillRect(innerX, innerY, innerW, innerH);

      const theme = this.stageTheme ? this.stageTheme() : null;
      ctx.strokeStyle = theme ? theme.roadInner : 'rgba(210, 170, 105, 0.8)';
      ctx.lineWidth = expanded ? 3 : 2;
      const stagePathsForMini = (C.stagePaths && C.stagePaths[this.stageKey && this.stageKey()]) || C.stagePaths.meadow || {};
      const routesForMini = Object.keys(stagePathsForMini).length ? Object.keys(stagePathsForMini) : ['main', 'side'];
      for (const route of routesForMini) {
        const path = this.routePath ? this.routePath(route) : [];
        if (!path || path.length < 2) continue;
        ctx.beginPath();
        ctx.moveTo(mx(path[0].x), my(path[0].y));
        for (let i = 1; i < path.length; i += 1) ctx.lineTo(mx(path[i].x), my(path[i].y));
        ctx.stroke();
      }
      const miniChokes = (C.routeChokepoints && C.routeChokepoints[this.stageKey()]) || [];
      ctx.strokeStyle = 'rgba(255, 240, 188, 0.52)';
      ctx.lineWidth = expanded ? 1.6 : 1;
      for (const cp of miniChokes) {
        ctx.beginPath();
        ctx.arc(mx(cp.x), my(cp.y), Math.max(3, (cp.r || 72) * sx), 0, Math.PI * 2);
        ctx.stroke();
      }
      const sitesForTrails = (this.discoveries || []).filter((d) => d.discovered && this.isRaidableDiscovery && this.isRaidableDiscovery(d));
      if (sitesForTrails.length && this.raidTrailPathForSite) {
        ctx.strokeStyle = 'rgba(210, 150, 88, 0.64)';
        ctx.lineWidth = expanded ? 2 : 1;
        for (const site of sitesForTrails) {
          const path = this.raidTrailPathForSite(site, site.x > this.castle.x ? 'side' : 'main');
          if (!path || path.length < 2) continue;
          ctx.beginPath();
          ctx.moveTo(mx(path[0].x), my(path[0].y));
          for (let i = 1; i < path.length; i += 1) ctx.lineTo(mx(path[i].x), my(path[i].y));
          ctx.stroke();
        }
      }

      const cam = this.camera || { x: 0, y: 0 };
      ctx.fillStyle = 'rgba(255, 255, 255, 0.10)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.78)';
      ctx.lineWidth = expanded ? 2 : 1;
      ctx.fillRect(mx(cam.x), my(cam.y), C.w * sx, C.h * sy);
      ctx.strokeRect(mx(cam.x), my(cam.y), C.w * sx, C.h * sy);

      if (expanded && this.pads) {
        for (const p of this.pads) {
          if (this.isPadVisible && !this.isPadVisible(p)) continue;
          const built = p.facilityId;
          const unlocked = !this.isPadUnlocked || this.isPadUnlocked(p);
          ctx.fillStyle = built ? '#9ee1bb' : unlocked ? '#ffd35b' : 'rgba(200, 200, 200, 0.45)';
          ctx.beginPath();
          ctx.arc(mx(p.x), my(p.y), built ? 3.2 : 2.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (this.discoveries) {
        for (const d of this.discoveries) {
          const raidable = this.isRaidableDiscovery && this.isRaidableDiscovery(d);
          const underRaid = raidable && (d.siteUnderRaid || 0) > 0;
          const damaged = raidable && (d.siteHp || 0) < (d.siteMaxHp || 1) * 0.55;
          ctx.fillStyle = underRaid ? '#ff6b5e' : damaged ? '#ffd35b' : d.discovered ? '#fff3a3' : '#fff0bb';
          ctx.strokeStyle = underRaid ? 'rgba(255,255,255,0.90)' : d.discovered ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)';
          ctx.lineWidth = expanded ? 1.5 : 1;
          ctx.beginPath();
          ctx.arc(mx(d.x), my(d.y), underRaid ? (expanded ? 5.6 : 4) : d.discovered ? (expanded ? 4 : 2.8) : (expanded ? 4.6 : 3.2), 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          if (expanded && !d.discovered) {
            ctx.fillStyle = '#1a1a16';
            ctx.font = '900 8px system-ui';
            ctx.textAlign = 'center';
            ctx.fillText('?', mx(d.x), my(d.y) + 3);
          }
        }
      }

      if (this.facilities) {
        ctx.fillStyle = '#9ee1bb';
        for (const f of this.facilities) {
          if (f.hp <= 0) continue;
          ctx.beginPath();
          ctx.arc(mx(f.x), my(f.y), expanded ? 3.4 : 2.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (this.enemies) {
        if (expanded) {
          ctx.lineWidth = 1.2;
          for (const e of this.enemies.slice(0, 50)) {
            if (e.hp <= 0) continue;
            let tx = this.castle ? this.castle.x : null;
            let ty = this.castle ? this.castle.y : null;
            if (e.raidTargetId) {
              const target = (this.discoveries || []).find((d) => d.id === e.raidTargetId);
              if (target) { tx = target.x; ty = target.y; }
            }
            if (tx != null) {
              ctx.strokeStyle = e.raidTargetId ? 'rgba(215,190,255,0.34)' : 'rgba(255,107,94,0.18)';
              ctx.beginPath();
              ctx.moveTo(mx(e.x), my(e.y));
              ctx.lineTo(mx(tx), my(ty));
              ctx.stroke();
            }
          }
        }
        for (const e of this.enemies.slice(0, expanded ? 120 : 70)) {
          if (e.hp <= 0) continue;
          ctx.fillStyle = e.def && e.def.boss ? '#ffd35b' : e.raidTargetId ? '#d7beff' : '#ff6b5e';
          ctx.beginPath();
          ctx.arc(mx(e.x), my(e.y), e.def && e.def.boss ? (expanded ? 5 : 3.4) : e.raidTargetId ? (expanded ? 3.8 : 2.8) : (expanded ? 3.2 : 2.1), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (this.castle) {
        ctx.fillStyle = '#86e3a0';
        ctx.beginPath();
        ctx.rect(mx(this.castle.x) - (expanded ? 5 : 3), my(this.castle.y) - (expanded ? 5 : 3), expanded ? 10 : 6, expanded ? 10 : 6);
        ctx.fill();
      }

      if (this.king) {
        ctx.fillStyle = '#4aa3ff';
        ctx.strokeStyle = 'rgba(255,255,255,0.96)';
        ctx.lineWidth = expanded ? 2.5 : 1.6;
        ctx.beginPath();
        ctx.arc(mx(this.king.x), my(this.king.y), expanded ? 6.5 : 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();

      ctx.fillStyle = 'rgba(255, 244, 214, 0.88)';
      ctx.font = expanded ? '800 12px system-ui' : '800 9px system-ui';
      ctx.textAlign = 'left';
      const legend = expanded ? '青:主人公  緑:防衛都市/施設  赤:敵  黄:床/損傷' : '青:主人公 赤:敵 黄:床';
      ctx.fillText(legend, x + 9, y + mapH - (expanded ? 8 : 9));
      ctx.restore();
    }


    nearestBuildPad(maxDistance = 64) {
      let best = null;
      let bestD = maxDistance;
      for (const pad of this.pads || []) {
        if (this.isPadVisible && !this.isPadVisible(pad)) continue;
        const d = distXY(this.king.x, this.king.y, pad.x, pad.y);
        if (d < bestD) { best = pad; bestD = d; }
      }
      return best;
    }

    facilityMeta(type) {
      const ui = C.facilityUi || {};
      return ui[type] || { category: 'defense', icon: (C.facilityTypes[type] && C.facilityTypes[type].name || '?').slice(0, 1), short: '防衛施設', timing: '道・敵・所持金を見て配置を決める。' };
    }

    facilityCategory(type) {
      return this.facilityMeta(type).category || 'defense';
    }

    facilityCategoryColor(type) {
      const category = this.facilityCategory(type);
      return (C.categoryColors && C.categoryColors[category]) || '#ffd35b';
    }

    facilityCategoryLabel(type) {
      const category = this.facilityCategory(type);
      return (C.categoryLabels && C.categoryLabels[category]) || '施設';
    }

    facilityIcon(type) {
      return this.facilityMeta(type).icon || '?';
    }

    facilityShortText(type) {
      return this.facilityMeta(type).short || this.facilityRoleText(type);
    }

    facilityTimingText(type) {
      return this.facilityMeta(type).timing || this.facilityRoleText(type);
    }

    facilityMatchupText(type) {
      const meta = this.facilityMeta(type);
      if (!meta.good && !meta.weak) return '';
      return `${meta.good ? '得意: ' + meta.good : ''}${meta.good && meta.weak ? ' / ' : ''}${meta.weak ? '注意: ' + meta.weak : ''}`;
    }

    facilityUpgradeDeltaText(type, fromLevel) {
      const def = C.facilityTypes[type];
      if (!def || !def.levelStats) return '';
      const toLevel = Math.min((def.maxLevel || 4), (fromLevel || 1) + 1);
      const cur = def.levelStats[fromLevel] || {};
      const next = def.levelStats[toLevel] || {};
      const labels = [];
      const addDelta = (key, label, lowerBetter = false) => {
        if (cur[key] == null || next[key] == null || cur[key] === next[key]) return;
        const diff = next[key] - cur[key];
        const better = lowerBetter ? diff < 0 : diff > 0;
        if (!better) return;
        labels.push(`${label}${lowerBetter ? Math.abs(diff) : `+${diff}`}`);
      };
      addDelta('hp', '耐久');
      addDelta('damage', '攻撃');
      addDelta('range', '射程');
      addDelta('splash', '爆風');
      addDelta('blockRadius', '足止め');
      addDelta('blockArmor', '軽減');
      addDelta('soldierCap', '兵士上限');
      addDelta('soldierDamage', '兵士攻撃');
      addDelta('income', '収入');
      addDelta('cooldown', '連射', true);
      addDelta('spawnTime', '出撃', true);
      addDelta('incomeTime', '収入間隔', true);
      const hint = C.facilityUpgradeHints && C.facilityUpgradeHints[type] && C.facilityUpgradeHints[type][toLevel];
      return hint || labels.slice(0, 3).join(' / ');
    }

    facilityRoleText(type) {
      return this.facilityShortText(type);
    }

    drawBuildInfoPanel(ctx) {
      if (this.minimapExpanded) return;
      const pad = this.nearestBuildPad ? this.nearestBuildPad(this.isMobileView && this.isMobileView() ? 96 : 72) : null;
      if (!pad) return;
      const def = C.facilityTypes[pad.type];
      if (!def) return;
      const existing = pad.facilityId ? this.facilities.find((f) => f.id === pad.facilityId) : null;
      const locked = !this.isPadUnlocked || !this.isPadUnlocked(pad);
      const compact = this.isMobileView && this.isMobileView();
      const mini = compact && this.miniMapBounds ? this.miniMapBounds() : null;
      const w = compact ? Math.min(320, Math.max(270, (mini ? mini.x - 24 : 320))) : 302;
      const h = compact ? 168 : 172;
      const x = compact ? 12 : C.w - w - 14;
      const y = compact ? 548 : C.h - h - 18;
      const categoryColor = this.facilityCategoryColor(pad.type);
      const categoryLabel = this.facilityCategoryLabel(pad.type);
      const icon = this.facilityIcon(pad.type);
      ctx.save();
      ctx.fillStyle = 'rgba(8, 14, 13, 0.91)';
      rounded(ctx, x, y, w, h, 18);
      ctx.fill();
      ctx.strokeStyle = locked ? 'rgba(220,220,220,0.36)' : categoryColor;
      ctx.lineWidth = 2.5;
      rounded(ctx, x + 0.5, y + 0.5, w - 1, h - 1, 18);
      ctx.stroke();

      ctx.fillStyle = categoryColor;
      rounded(ctx, x + 14, y + 14, compact ? 54 : 46, compact ? 54 : 46, 14);
      ctx.fill();
      ctx.fillStyle = '#1a1810';
      ctx.font = compact ? '900 24px system-ui' : '900 20px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(icon, x + (compact ? 41 : 37), y + (compact ? 49 : 43));

      ctx.textAlign = 'left';
      const currentLevel = existing ? existing.level : 1;
      const maxLevel = this.facilityMaxLevel(pad.type);
      const currentLevelColor = this.facilityLevelColor(currentLevel);
      ctx.fillStyle = locked ? '#d7d7d7' : currentLevelColor;
      ctx.font = compact ? '900 22px system-ui' : '900 18px system-ui';
      const title = existing ? `${def.name} Lv.${existing.level}${existing.level >= maxLevel ? ' MAX' : ''}` : `${def.name} Lv.1`;
      ctx.fillText(title, x + (compact ? 78 : 70), y + (compact ? 31 : 28));
      ctx.fillStyle = categoryColor;
      ctx.font = compact ? '900 13px system-ui' : '800 12px system-ui';
      ctx.fillText(`${categoryLabel} / ${this.facilityShortText(pad.type)}`, x + (compact ? 78 : 70), y + (compact ? 54 : 49));

      ctx.fillStyle = '#fff0bb';
      ctx.font = compact ? '900 18px system-ui' : '800 15px system-ui';
      const need = existing ? (existing.level >= maxLevel ? 0 : this.getUpgradeNeed(existing)) : def.cost;
      const current = existing ? pad.upgradeInvested : pad.invested;
      const nextLevel = existing ? Math.min(maxLevel, existing.level + 1) : 1;
      const nextColor = this.facilityLevelColor(nextLevel);
      const nextColorName = (C.levelColorNames && C.levelColorNames[nextLevel]) || '';
      const costText = locked ? `領土${pad.territory}が必要` : existing && existing.level >= maxLevel ? 'Lv4 MAX / 最終強化' : `次: Lv.${nextLevel} ${nextColorName} / 残り ${Math.max(0, Math.ceil(need - current))} コイン`;
      ctx.fillStyle = existing && existing.level < maxLevel ? nextColor : '#fff0bb';
      ctx.fillText(costText, x + 16, y + (compact ? 82 : 72));
      if (existing && existing.level < maxLevel) {
        ctx.fillStyle = nextColor;
        ctx.font = compact ? '900 13px system-ui' : '900 12px system-ui';
        const delta = this.facilityUpgradeDeltaText ? this.facilityUpgradeDeltaText(pad.type, existing.level) : '';
        ctx.fillText(`強化効果: ${delta}`.slice(0, compact ? 34 : 40), x + 16, y + (compact ? 106 : 94));
      }
      ctx.fillStyle = '#d6f2a3';
      ctx.font = compact ? '800 13px system-ui' : '800 12px system-ui';
      const timing = this.facilityTimingText(pad.type);
      ctx.fillText(timing.slice(0, compact ? 30 : 38), x + 16, y + (compact ? 130 : 116));
      const matchup = this.facilityMatchupText ? this.facilityMatchupText(pad.type) : '';
      if (matchup && !compact) {
        ctx.fillStyle = '#dce5ff';
        ctx.font = '800 11px system-ui';
        ctx.fillText(matchup.slice(0, 40), x + 16, y + 134);
      }
      if (this.padStrategicAdvice && !locked && !existing) {
        const advice = this.padStrategicAdvice(pad);
        if (advice) {
          ctx.fillStyle = '#fff3a3';
          ctx.font = compact ? '900 14px system-ui' : '900 12px system-ui';
          ctx.fillText(`判断: ${advice}`.slice(0, compact ? 30 : 38), x + 16, y + (compact ? 152 : 154));
        }
      }
      if (!locked && !(existing && existing.level >= maxLevel)) {
        const holdNeed = C.buildHoldTime || 620;
        const holdProgress = Math.max(0, Math.min(1, (pad.holdTime || 0) / holdNeed));
        ctx.fillStyle = 'rgba(255,255,255,0.10)';
        rounded(ctx, x + w - 88, y + 72, 70, 38, 12);
        ctx.fill();
        ctx.fillStyle = holdProgress >= 1 ? '#9ee1bb' : '#ffd35b';
        ctx.font = '900 13px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(holdProgress >= 1 ? '投資中' : '滞在で投資', x + w - 53, y + 92);
        ctx.fillStyle = 'rgba(255, 211, 91, 0.32)';
        rounded(ctx, x + w - 78, y + 99, 50 * holdProgress, 7, 4);
        ctx.fill();
      }
      ctx.restore();
    }

    drawDiscoveryToast(ctx) {
      const toast = this.discoveryToast;
      if (!toast || toast.life <= 0) return;
      const alpha = Math.min(1, toast.life / 360, (toast.max - toast.life) / 220 + 0.15);
      const compact = this.isMobileView && this.isMobileView();
      const w = compact ? 340 : 330;
      const h = compact ? 104 : 116;
      const x = Math.round((C.w - w) / 2);
      const hasTopAlert = (this.routeAlert && this.routeAlert.life > 0) || (this.wave && this.wave.banner > 0);
      const hasBuildInfo = this.nearestBuildPad && this.nearestBuildPad(compact ? 96 : 82);
      const y = compact ? (hasTopAlert ? 250 : (hasBuildInfo ? 214 : 132)) : 108;
      ctx.save();
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.fillStyle = 'rgba(10, 16, 15, 0.88)';
      rounded(ctx, x, y, w, h, 20);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 211, 91, 0.78)';
      ctx.lineWidth = 2;
      rounded(ctx, x + 0.5, y + 0.5, w - 1, h - 1, 20);
      ctx.stroke();
      ctx.fillStyle = '#ffd35b';
      ctx.font = compact ? '900 22px system-ui' : '900 20px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(toast.title, C.w / 2, y + 32);
      ctx.fillStyle = '#fff0bb';
      ctx.font = compact ? '900 16px system-ui' : '800 14px system-ui';
      const lines = toast.lines || [];
      for (let i = 0; i < Math.min(compact ? 2 : 3, lines.length); i += 1) ctx.fillText(lines[i], C.w / 2, y + 58 + i * 20);
      if (toast.note && lines.length < 3) {
        ctx.fillStyle = '#d6f2a3';
        ctx.font = compact ? '800 13px system-ui' : '800 12px system-ui';
        ctx.fillText(toast.note.slice(0, 24), C.w / 2, y + 104);
      }
      ctx.restore();
    }


    drawStrategicHint(ctx) {
      if (this.minimapExpanded) return;
      if (this.status !== 'playing') return;
      if (this.tutorialMode) return;
      const compact = this.isMobileView && this.isMobileView();
      if (compact) {
        if (this.discoveryToast && this.discoveryToast.life > 0) return;
        if (this.routeAlert && this.routeAlert.life > 0) return;
        if (this.wave && this.wave.banner > 0) return;
        if (this.nearestBuildPad && this.nearestBuildPad(120)) return;
        if (this.notice && this.notice.life > 0) return;
      }
      const elapsed = this.time || 0;
      let text = '';
      if (elapsed < 9000 && !(this.facilities || []).length) text = (this.stageGoal && this.stageGoal().opening) || 'まず近くの床へ。弓塔・柵・金鉱のどれを先に作るかが最初の判断です。';
      else if (elapsed < 17000 && (this.facilities || []).length < 2) text = '建設床は0.6秒滞在で投資。通過だけではコインを使いません。';
      else if (this.enemyIntentSummary) text = this.enemyIntentSummary();
      else return;
      const w = compact ? 356 : 360;
      const h = compact ? 52 : 44;
      const x = Math.round((C.w - w) / 2);
      const y = compact ? 112 : 94;
      ctx.save();
      ctx.globalAlpha = compact ? 0.92 : 0.82;
      ctx.fillStyle = 'rgba(8, 14, 13, 0.86)';
      rounded(ctx, x, y, w, h, 16);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 211, 91, 0.42)';
      ctx.lineWidth = 1.5;
      rounded(ctx, x + 0.5, y + 0.5, w - 1, h - 1, 16);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#fff0bb';
      ctx.font = compact ? '900 14px system-ui' : '800 13px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(text.slice(0, compact ? 28 : 38), C.w / 2, y + (compact ? 31 : 27));
      ctx.restore();
    }

    drawHudOnCanvas(ctx) {
      const compact = this.isMobileView && this.isMobileView();
      if (compact) {
        this.drawMobileHudOnCanvas(ctx);
        return;
      }
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
      ctx.fillText(`進軍 ${this.wave.index < 0 ? 0 : this.wave.index + 1}/${this.waves.length}`, 119, 58);
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
      this.drawAlertBanners(ctx);
    }

    drawMobileHudOnCanvas(ctx) {
      ctx.save();
      ctx.fillStyle = 'rgba(12, 18, 15, 0.78)';
      rounded(ctx, 12, 12, 456, 86, 18);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.14)';
      ctx.lineWidth = 1.5;
      rounded(ctx, 12.5, 12.5, 455, 85, 18);
      ctx.stroke();

      const cards = [
        { icon: 'uiCoin', label: '金', value: Math.floor(this.king.coins), x: 22 },
        { icon: 'uiHeart', label: '主人公', value: `${Math.ceil(this.king.hp)}`, x: 128 },
        { icon: 'uiCastleHp', label: '城', value: `${Math.max(0, Math.ceil(this.castle.hp))}`, x: 234 },
        { icon: 'uiWarning', label: '進軍', value: `${this.wave.index < 0 ? 0 : this.wave.index + 1}/${this.waves.length}`, x: 340 }
      ];
      for (const card of cards) {
        ctx.fillStyle = 'rgba(255,255,255,0.065)';
        rounded(ctx, card.x, 22, 94, 42, 12);
        ctx.fill();
        this.drawAsset(ctx, card.icon, card.x + 18, 43, 24, 24);
        ctx.fillStyle = '#fff0bb';
        ctx.font = '900 20px system-ui';
        ctx.textAlign = 'left';
        ctx.fillText(`${card.value}`, card.x + 34, 47);
        ctx.fillStyle = 'rgba(214,242,163,0.86)';
        ctx.font = '800 10px system-ui';
        ctx.fillText(card.label, card.x + 35, 59);
      }

      ctx.fillStyle = '#d6f2a3';
      ctx.font = '900 13px system-ui';
      ctx.textAlign = 'left';
      const short = this.nextWaveShortSummary ? this.nextWaveShortSummary() : this.nextWaveSummary().slice(0, 28);
      ctx.fillText(short.slice(0, 40), 24, 84);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff0bb';
      ctx.fillText(`${this.speed}x${this.paused ? ' 停止' : ''}`, 456, 84);

      ctx.fillStyle = '#ff6b5e';
      rounded(ctx, 22, 100, 190, 10, 5);
      ctx.fill();
      ctx.fillStyle = '#86e3a0';
      rounded(ctx, 22, 100, 190 * Math.max(0, this.castle.hp / this.castle.maxHp), 10, 5);
      ctx.fill();

      this.drawMobileMessageBar(ctx);
      this.drawAlertBanners(ctx);
      ctx.restore();
    }

    drawMobileMessageBar(ctx) {
      if (this.minimapExpanded) return;
      const b = this.miniMapBounds ? this.miniMapBounds() : { x: 344, y: 628, w: 126, h: 156 };
      const x = 14;
      const y = 706;
      const w = Math.max(260, b.x - 24);
      const h = 78;
      ctx.save();
      ctx.fillStyle = 'rgba(12, 18, 15, 0.80)';
      rounded(ctx, x, y, w, h, 17);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.14)';
      ctx.lineWidth = 1.5;
      rounded(ctx, x + 0.5, y + 0.5, w - 1, h - 1, 17);
      ctx.stroke();
      ctx.fillStyle = '#ffd35b';
      ctx.font = '900 14px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('状況', x + 14, y + 23);
      ctx.fillStyle = '#fff0bb';
      ctx.font = '900 15px system-ui';
      const src = (this.notice && this.notice.life > 0) ? this.notice.text : this.message;
      const msg = (src || '').replace(/。/g, '。 ');
      const first = msg.slice(0, 18);
      const second = msg.slice(18, 36);
      ctx.fillText(first, x + 14, y + 47);
      if (second) ctx.fillText(second, x + 14, y + 68);
      ctx.restore();
    }

    drawAlertBanners(ctx) {
      const compact = this.isMobileView && this.isMobileView();
      if (this.routeAlert.life > 0) {
        ctx.globalAlpha = Math.min(1, this.routeAlert.life / 300);
        ctx.fillStyle = this.routeAlert.route === 'side' ? 'rgba(110, 39, 32, 0.82)' : 'rgba(93, 62, 24, 0.82)';
        const ax = compact ? 72 : 56;
        const ay = compact ? 112 : 112;
        const aw = compact ? 336 : 368;
        const ah = compact ? 46 : 54;
        rounded(ctx, ax, ay, aw, ah, 16);
        ctx.fill();
        ctx.fillStyle = '#ffe7a8';
        ctx.font = compact ? '900 18px system-ui' : '900 22px system-ui';
        ctx.textAlign = 'center';
        this.drawAsset(ctx, 'uiWarning', ax + 27, ay + ah / 2, compact ? 28 : 34, compact ? 28 : 34);
        ctx.fillText(this.routeAlert.text.slice(0, compact ? 16 : 22), C.w / 2 + 8, ay + (compact ? 30 : 34));
        ctx.globalAlpha = 1;
      }
      if (this.wave.banner > 0 && this.wave.index >= 0) {
        ctx.globalAlpha = Math.min(1, this.wave.banner / 300);
        ctx.fillStyle = 'rgba(20, 22, 18, 0.76)';
        rounded(ctx, 58, 176, 364, 66, 18);
        ctx.fill();
        ctx.fillStyle = '#ffd35b';
        ctx.font = '900 26px system-ui';
        ctx.textAlign = 'center';
        this.drawAsset(ctx, 'uiWarning', 84, 209, 38, 38);
        ctx.fillText(`敵軍進行 ${this.wave.index + 1}`, 178, 203);
        ctx.font = '900 18px system-ui';
        ctx.fillText(this.waves[this.wave.index].title, 260, 226);
        ctx.globalAlpha = 1;
      }
    }


    drawNoticeBar(ctx) {
      if (this.isMobileView && this.isMobileView()) return;
      if (!this.notice || this.notice.life <= 0) return;
      if (this.minimapExpanded) return;
      const msg = this.notice.text || '';
      if (!msg) return;
      const alpha = Math.min(1, this.notice.life / 320);
      ctx.save();
      ctx.globalAlpha = alpha;
      const x = 64;
      const y = 730;
      const w = 352;
      const h = 42;
      ctx.fillStyle = this.notice.kind === 'danger' ? 'rgba(92, 26, 22, 0.84)' : this.notice.kind === 'good' ? 'rgba(24, 76, 48, 0.82)' : 'rgba(12, 18, 15, 0.82)';
      rounded(ctx, x, y, w, h, 14);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.16)';
      ctx.lineWidth = 1.4;
      rounded(ctx, x + 0.5, y + 0.5, w - 1, h - 1, 14);
      ctx.stroke();
      ctx.fillStyle = '#fff0bb';
      ctx.font = '900 15px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(msg.slice(0, 34), C.w / 2, y + 27);
      ctx.restore();
    }


    drawUpgradeBanner(ctx) {
      if (!this.upgradeBanner) return;
      const t = clamp((this.upgradeBanner.life || 0) / (this.upgradeBanner.max || 1), 0, 1);
      const pop = 1 + Math.sin((1 - t) * Math.PI) * 0.08;
      const width = this.upgradeBanner.final ? 300 : 250;
      const height = this.upgradeBanner.final ? 72 : 62;
      const x = C.w / 2 - width / 2;
      const y = 52 - (1 - t) * 18;
      ctx.save();
      ctx.globalAlpha = Math.min(1, 0.20 + t * 0.90);
      rounded(ctx, x, y, width, height, 16);
      ctx.fillStyle = this.upgradeBanner.final ? 'rgba(91,38,18,0.88)' : 'rgba(34,42,58,0.82)';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = this.upgradeBanner.color || '#fff3a3';
      ctx.stroke();
      ctx.textAlign = 'center';
      ctx.font = `900 ${Math.round((this.upgradeBanner.final ? 24 : 22) * pop)}px system-ui`;
      ctx.lineWidth = 6;
      ctx.strokeStyle = 'rgba(0,0,0,0.58)';
      ctx.fillStyle = '#fff6c5';
      ctx.strokeText(this.upgradeBanner.text, C.w / 2, y + 28);
      ctx.fillText(this.upgradeBanner.text, C.w / 2, y + 28);
      ctx.font = '700 13px system-ui';
      ctx.lineWidth = 4;
      ctx.strokeText(this.upgradeBanner.sub, C.w / 2, y + 49);
      ctx.fillStyle = this.upgradeBanner.color || '#fff3a3';
      ctx.fillText(this.upgradeBanner.sub, C.w / 2, y + 49);
      ctx.restore();
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

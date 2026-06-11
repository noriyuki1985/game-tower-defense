/*
 * Grouped JS file generated in v3.2.2.
 * Behavior should remain identical; only file grouping/script loading changed.
 */


/* ===== src/core/save.js ===== */

(function () {
  'use strict';

  const C = window.KBD_CONFIG;

  const defaultMeta = () => Object.fromEntries(Object.keys(C.metaUpgrades).map((key) => [key, 0]));
  const defaultSave = () => ({
    crowns: 0,
    meta: defaultMeta(),
    unlockedStages: ['meadow', 'crossroads', 'ridge'],
    bestScores: {},
    selectedStage: 'meadow',
    selectedDifficulty: 'normal'
  });

  function loadSave() {
    const base = defaultSave();
    try {
      const raw = localStorage.getItem(C.saveKey);
      if (!raw) return base;
      const data = JSON.parse(raw);
      return {
        ...base,
        ...data,
        meta: { ...base.meta, ...(data.meta || {}) },
        unlockedStages: Array.isArray(data.unlockedStages) && data.unlockedStages.length ? Array.from(new Set([...base.unlockedStages, ...data.unlockedStages])) : base.unlockedStages,
        bestScores: data.bestScores || {}
      };
    } catch (_) {
      return base;
    }
  }

  function storeSave(save) {
    try { localStorage.setItem(C.saveKey, JSON.stringify(save)); } catch (_) {}
  }

  function metaCost(key, level) {
    const def = C.metaUpgrades[key];
    return Math.round(def.baseCost * (level + 1) * (1 + level * 0.72));
  }

  window.KBD_SAVE = { defaultMeta, defaultSave, loadSave, storeSave, metaCost };
})();

(function () {
  'use strict';

  const C = window.KBD_CONFIG;
  const { $, rand } = window.KBD_UTILS;
  const { storeSave } = window.KBD_SAVE;

  window.KBD_SYSTEMS = window.KBD_SYSTEMS || {};
  window.KBD_SYSTEMS.end = {
    checkEnd() {
  if (this.status !== 'playing') return;
  if (this.castle.hp <= 0) {
    const reward = this.finishRun(false);
    this.status = 'lose';
    this.startResultFx('lose');
    this.stopBgm();
    this.playSfx('defeat');
    this.showOverlay('敗北', `城が落ちました。スコア: ${this.score}。獲得クラウン: ${reward}`, 'もう一度', 'lose');
  } else if (this.wave.done && this.enemies.length === 0) {
    const reward = this.finishRun(true);
    this.status = 'win';
    this.startResultFx('win');
    this.stopBgm();
    this.playSfx('victory');
    this.showOverlay('勝利', `ステージクリア。スコア: ${this.score}。獲得クラウン: ${reward}`, 'もう一度', 'win');
  }
},

    finishRun(won) {
  const stage = this.currentStage;
  const diff = this.currentDifficulty;
  const progress = Math.max(0, this.wave.index + 1) / Math.max(1, this.waves.length);
  const base = won ? stage.crownBase : Math.max(1, Math.floor(stage.crownBase * progress * 0.35));
  const scoreBonus = won ? Math.floor(this.score / 650) : Math.floor(this.score / 1400);
  const reward = Math.max(won ? 1 : 0, Math.round((base + scoreBonus) * diff.crownMult));
  this.save.crowns += reward;
  const bestKey = `${this.selectedStage}:${this.selectedDifficulty}`;
  this.save.bestScores[bestKey] = Math.max(this.save.bestScores[bestKey] || 0, this.score);
  if (won && stage.next && !this.save.unlockedStages.includes(stage.next)) {
    this.save.unlockedStages.push(stage.next);
    this.addFloater('新ステージ解放', C.w / 2, 132, '#fff3a3');
  }
  storeSave(this.save);
  this.populateSetupControls();
  this.renderMetaUpgrades();
  this.updateSetupHud();
  return reward;
}
  };
})();

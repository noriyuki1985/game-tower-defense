(function () {
  'use strict';

  const C = window.KBD_CONFIG;
  const { clamp, distXY } = window.KBD_UTILS;

  window.KBD_SYSTEMS = window.KBD_SYSTEMS || {};
  window.KBD_SYSTEMS.king = {
    updateKing(dt) {
  const oldX = this.king.x;
  const oldY = this.king.y;
  if (this.king.stunned > 0) {
    this.king.attackTimer -= dt;
    this.king.moving = false;
    return;
  }
  let vx = 0;
  let vy = 0;
  if (this.keys.has('a') || this.keys.has('arrowleft')) vx -= 1;
  if (this.keys.has('d') || this.keys.has('arrowright')) vx += 1;
  if (this.keys.has('w') || this.keys.has('arrowup')) vy -= 1;
  if (this.keys.has('s') || this.keys.has('arrowdown')) vy += 1;
  if (vx !== 0 || vy !== 0) {
    this.pointerTarget = null;
    const len = Math.hypot(vx, vy) || 1;
    this.king.x += (vx / len) * C.kingSpeed * dt / 1000;
    this.king.y += (vy / len) * C.kingSpeed * dt / 1000;
    if (Math.abs(vx) > 0.05) this.king.face = vx > 0 ? 1 : -1;
  } else if (this.pointerTarget) {
    const dx = this.king.targetX - this.king.x;
    const dy = this.king.targetY - this.king.y;
    const len = Math.hypot(dx, dy);
    const step = C.kingSpeed * dt / 1000;
    if (len <= step) {
      this.king.x = this.king.targetX;
      this.king.y = this.king.targetY;
      this.pointerTarget = null;
    } else {
      this.king.x += dx / len * step;
      this.king.y += dy / len * step;
      if (Math.abs(dx) > 1) this.king.face = dx > 0 ? 1 : -1;
    }
  }
  this.king.x = clamp(this.king.x, 18, this.worldWidth() - 18);
  this.king.y = clamp(this.king.y, 128, this.worldHeight() - 18);
  const moved = distXY(oldX, oldY, this.king.x, this.king.y);
  this.king.moving = moved > 0.25;
  this.king.speedRatio = clamp((moved / Math.max(1, dt)) / (C.kingSpeed / 1000), 0, 1.35);
  if (this.king.moving) {
    this.king.runDistance = (this.king.runDistance || 0) + moved;
    this.king.moveAngle = Math.atan2(this.king.y - oldY, this.king.x - oldX);
    this.king.stepTimer = (this.king.stepTimer || 0) + moved;
    if (this.king.stepTimer > 24) {
      this.king.stepTimer = 0;
      this.king.lastStepSide = -(this.king.lastStepSide || 1);
      this.addRunDust(this.king.x - Math.cos(this.king.moveAngle || 0) * 14, this.king.y + 16, this.king.lastStepSide || 1);
    }
  }
  this.king.animTime = (this.king.animTime || 0) + dt * (this.king.moving ? 2.15 : 0.72);
  this.king.attackTimer -= dt;
  if (this.king.attackTimer <= 0) {
    const target = this.nearestEnemy(this.king.x, this.king.y, 52);
    if (target) {
      this.damageEnemy(target, 22, 'king');
      this.king.attackTimer = 390;
      this.king.attackFlash = 180;
      this.addBurst(target.x, target.y, '#fff2a8', 5, 'hit');
      this.addFloater('斬撃', target.x, target.y - 18, '#fff2a8');
    }
  }
  this.king.attackFlash = Math.max(0, (this.king.attackFlash || 0) - dt);
},

    damageKing(amount, enemy) {
  if (this.king.invuln > 0 || this.king.stunned > 0) return;
  this.king.hp -= amount;
  this.king.invuln = 650;
  this.shake = 130;
  this.addBurst(this.king.x, this.king.y, '#ffdf7b', 9, 'warning');
  this.addFloater(`王 -${Math.round(amount)}`, this.king.x, this.king.y - 40, '#ffdf7b');
  this.playSfx('kingHit', 320);
  if (enemy) {
    const dx = this.king.x - enemy.x;
    const dy = this.king.y - enemy.y;
    const len = Math.hypot(dx, dy) || 1;
    this.king.x = clamp(this.king.x + dx / len * 18, 18, this.worldWidth() - 18);
    this.king.y = clamp(this.king.y + dy / len * 18, 128, this.worldHeight() - 18);
  }
  if (this.king.hp <= 0) {
    this.king.hp = Math.ceil(this.king.maxHp * 0.45);
    this.king.stunned = 2600;
    this.king.invuln = 3200;
    const lost = Math.min(35, Math.floor(this.king.coins * 0.25));
    this.king.coins -= lost;
    this.addFloater(`気絶 -${lost}`, this.king.x, this.king.y - 48, '#ff6b5e');
    this.message = '王が倒れました。防衛施設は戦いますが、しばらく建設できません。';
    this.playSfx('stun');
  }
}
  };
})();

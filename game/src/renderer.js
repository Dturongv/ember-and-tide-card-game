/**
 * EMBER & TIDE - Visual Renderer & FX Particle System
 * Manages DOM updates, card fan layouts, floating combat text, and procedural canvas particles.
 */

import { renderCardHtml } from './cards.js';
import { evaluateCombo } from './combos.js';

export class GameRenderer {
  constructor() {
    this.canvas = document.getElementById('fx-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.particles = [];
    this.floatingTexts = [];
    this.animating = false;

    if (this.canvas) {
      this.resizeCanvas();
      window.addEventListener('resize', () => this.resizeCanvas());
      this.startParticleLoop();
    }
  }

  resizeCanvas() {
    if (!this.canvas) return;
    this.canvas.width = 1280;
    this.canvas.height = 720;
  }

  /** Renders the complete duel table. */
  renderTable(engine) {
    this.renderHUD(engine);
    this.renderHands(engine);
    this.renderArena(engine);
    this.renderComboBadge(engine);
    this.renderLogs(engine);
  }

  renderHUD(engine) {
    const pHpText = document.getElementById('player-hp-text');
    const pHpBar = document.getElementById('player-hp-bar');
    const pShieldText = document.getElementById('player-shield-text');
    const pShieldBar = document.getElementById('player-shield-bar');
    const energyOrbs = document.getElementById('energy-orbs');

    if (pHpText) pHpText.textContent = `${engine.player.hp}/${engine.player.maxHp}`;
    if (pHpBar) pHpBar.style.width = `${Math.max(0, (engine.player.hp / engine.player.maxHp) * 100)}%`;
    if (pShieldText) pShieldText.textContent = `${engine.player.shield}`;
    if (pShieldBar) pShieldBar.style.width = `${Math.min(100, engine.player.shield * 10)}%`;

    if (energyOrbs) {
      let html = '';
      const totalOrbs = Math.max(3, engine.player.maxEnergy || 3);
      for (let i = 0; i < totalOrbs; i++) {
        html += `<span class="energy-orb ${i < engine.player.energy ? 'active' : ''}"></span>`;
      }
      energyOrbs.innerHTML = html;
    }

    // Status Badges for Player
    const playerStatusEl = document.getElementById('player-status');
    if (playerStatusEl) {
      let statusList = ['Your Turn'];
      if (engine.player.burn > 0) statusList.push(`🔥 Burn (${engine.player.burn})`);
      if (engine.player.thorns > 0) statusList.push(`🛡️ Thorns (${engine.player.thorns})`);
      if (engine.player.bonusEnergyNext > 0) statusList.push(`⚡ Surge (+1)`);
      playerStatusEl.textContent = statusList.join(' | ');
    }

    const oHpText = document.getElementById('opponent-hp-text');
    const oHpBar = document.getElementById('opponent-hp-bar');
    const oShieldText = document.getElementById('opponent-shield-text');
    const oShieldBar = document.getElementById('opponent-shield-bar');

    if (oHpText) oHpText.textContent = `${engine.opponent.hp}/${engine.opponent.maxHp}`;
    if (oHpBar) oHpBar.style.width = `${Math.max(0, (engine.opponent.hp / engine.opponent.maxHp) * 100)}%`;
    if (oShieldText) oShieldText.textContent = `${engine.opponent.shield}`;
    if (oShieldBar) oShieldBar.style.width = `${Math.min(100, engine.opponent.shield * 10)}%`;

    // Status Badges for Opponent
    const oppStatusEl = document.getElementById('opponent-status');
    if (oppStatusEl) {
      let statusList = ['Plotting...'];
      if (engine.opponent.burn > 0) statusList.push(`🔥 Burn (${engine.opponent.burn})`);
      if (engine.opponent.frozen) statusList.push(`❄️ Frozen (-50% Atk)`);
      oppStatusEl.textContent = statusList.join(' | ');
    }
  }

  renderHands(engine) {
    const playerHandEl = document.getElementById('player-hand');
    if (!playerHandEl) return;

    playerHandEl.innerHTML = '';
    const total = engine.player.hand.length;

    engine.player.hand.forEach((card, index) => {
      const isSelected = engine.player.playedCards.includes(card);
      const cardEl = document.createElement('div');
      cardEl.className = 'card-wrapper';

      // Fan mathematics: rotate and arc cards smoothly
      const mid = (total - 1) / 2;
      const offset = index - mid;
      const rot = offset * 5;
      const transY = Math.abs(offset) * 6;

      cardEl.style.position = 'relative';
      cardEl.style.transform = `rotate(${rot}deg) translateY(${transY}px)`;
      cardEl.style.margin = '0 -16px';
      cardEl.style.zIndex = index + 10;

      cardEl.innerHTML = renderCardHtml(card, { selected: isSelected, index });
      playerHandEl.appendChild(cardEl);
    });

    // Opponent Hand (simple face down cards)
    const oppHandEl = document.getElementById('opponent-hand');
    if (oppHandEl) {
      oppHandEl.innerHTML = '';
      engine.opponent.hand.forEach((card, index) => {
        const cardBack = document.createElement('div');
        cardBack.innerHTML = renderCardHtml(card, { faceDown: true, index });
        cardBack.style.transform = 'scale(0.85)';
        oppHandEl.appendChild(cardBack);
      });
    }
  }

  renderArena(engine) {
    // Opponent Arena slots
    const oppSlot0 = document.getElementById('opp-slot-0');
    const oppSlot1 = document.getElementById('opp-slot-1');
    const intent = engine.opponent.intent;

    if (oppSlot0) {
      oppSlot0.innerHTML = intent && intent.faceUp
        ? renderCardHtml(intent.faceUp, { telegraphed: true })
        : '';
    }
    if (oppSlot1) {
      oppSlot1.innerHTML = intent && intent.faceDown
        ? renderCardHtml(intent.faceDown, { faceDown: engine.currentState !== 'resolving' })
        : '';
    }

    // Player Arena slots
    const pSlot0 = document.getElementById('player-slot-0');
    const pSlot1 = document.getElementById('player-slot-1');
    const played = engine.player.playedCards;

    if (pSlot0) pSlot0.innerHTML = played[0] ? renderCardHtml(played[0]) : '';
    if (pSlot1) pSlot1.innerHTML = played[1] ? renderCardHtml(played[1]) : '';
  }

  renderComboBadge(engine) {
    const badge = document.getElementById('combo-preview-badge');
    if (!badge) return;

    const played = engine.player.playedCards;
    if (played.length === 2) {
      const combo = evaluateCombo(played[0], played[1]);
      if (combo) {
        badge.textContent = `${combo.badge} (${combo.details.description})`;
        badge.className = 'combo-preview-badge visible';
        return;
      }
    } else if (played.length === 1) {
      // Find possible combo with remaining cards
      const current = played[0];
      for (const other of engine.player.hand) {
        if (other !== current) {
          const combo = evaluateCombo(current, other);
          if (combo) {
            badge.textContent = `COMBO POSSIBLE: ${combo.name.toUpperCase()} (+${combo.details.description})`;
            badge.className = 'combo-preview-badge visible';
            return;
          }
        }
      }
    }

    badge.className = 'combo-preview-badge';
  }

  renderLogs(engine) {
    const logBox = document.getElementById('combat-log');
    if (!logBox) return;

    logBox.innerHTML = '';
    engine.combatLog.slice().reverse().forEach(entry => {
      const el = document.createElement('div');
      el.className = `log-entry ${entry.style}`;
      el.textContent = entry.text;
      logBox.appendChild(el);
    });
  }

  /* ---------------- Floating Combat Text ---------------- */
  spawnFloatingText(x, y, text, color = '#ffd700') {
    this.floatingTexts.push({
      x,
      y,
      text,
      color,
      alpha: 1,
      vy: -1.2,
      scale: 1.2
    });
  }

  /* ---------------- Particle System ---------------- */
  startParticleLoop() {
    this.animating = true;
    const loop = () => {
      this.updateParticles();
      this.updateFloatingTexts();
      this.drawCanvas();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  spawnBurst(x, y, color = '#ffd700', count = 35) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 1.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 4 + 2,
        color,
        alpha: 1,
        life: 1,
        decay: Math.random() * 0.025 + 0.015
      });
    }
  }

  updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05; // gravity
      p.alpha -= p.decay;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  updateFloatingTexts() {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const t = this.floatingTexts[i];
      t.y += t.vy;
      t.alpha -= 0.016;
      if (t.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  drawCanvas() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw Particles
    for (const p of this.particles) {
      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.alpha);
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    // Draw Floating Texts
    for (const t of this.floatingTexts) {
      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, t.alpha);
      this.ctx.fillStyle = t.color;
      this.ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      this.ctx.shadowColor = 'rgba(0,0,0,0.8)';
      this.ctx.shadowBlur = 6;
      this.ctx.fillText(t.text, t.x, t.y);
      this.ctx.restore();
    }
  }
}

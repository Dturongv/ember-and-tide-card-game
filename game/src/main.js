/**
 * EMBER & TIDE - Main Game Entrypoint
 * Orchestrates screens, duel lifecycle, input, sound, and screenshot staging.
 */

import { CARD_CATALOG, renderCardHtml } from './cards.js';
import { DuelEngine, STATE } from './engine.js';
import { GameRenderer } from './renderer.js';
import { SoundFX } from './audio.js';
import { InputController } from './input.js';

export class GameApp {
  constructor() {
    this.engine = new DuelEngine(12345);
    this.renderer = new GameRenderer();
    this.audio = new SoundFX();
    this.input = new InputController(this);

    this.titleScreen = document.getElementById('title-screen');
    this.tableScreen = document.getElementById('table-screen');
    this.victoryModal = document.getElementById('victory-modal');
    this.defeatModal = document.getElementById('defeat-modal');

    this.initShowcaseCards();
    this.checkScreenshotMode();
  }

  initShowcaseCards() {
    const showcaseContainer = document.getElementById('title-showcase');
    if (!showcaseContainer) return;

    // Pick 1 iconic card from each of the 4 suits
    const showcaseCards = [
      CARD_CATALOG.find(c => c.id === 'ember-inferno'),
      CARD_CATALOG.find(c => c.id === 'tide-undertow'),
      CARD_CATALOG.find(c => c.id === 'gale-tempest'),
      CARD_CATALOG.find(c => c.id === 'stone-monolith')
    ].filter(Boolean);

    showcaseContainer.innerHTML = '';
    showcaseCards.forEach((c, idx) => {
      const wrap = document.createElement('div');
      wrap.className = 'showcase-card-wrapper';
      wrap.innerHTML = renderCardHtml(c);
      wrap.style.transform = `rotate(${(idx - 1.5) * 6}deg)`;
      showcaseContainer.appendChild(wrap);
    });
  }

  isTitleScreen() {
    return this.titleScreen && this.titleScreen.classList.contains('active');
  }

  isDuelScreen() {
    return this.tableScreen && this.tableScreen.classList.contains('active');
  }

  showScreen(name) {
    if (this.titleScreen) this.titleScreen.classList.remove('active');
    if (this.tableScreen) this.tableScreen.classList.remove('active');
    if (this.victoryModal) this.victoryModal.classList.remove('active');
    if (this.defeatModal) this.defeatModal.classList.remove('active');

    if (name === 'title' && this.titleScreen) {
      this.titleScreen.classList.add('active');
    } else if (name === 'duel' && this.tableScreen) {
      this.tableScreen.classList.add('active');
    }
  }

  startNewGame() {
    this.audio.init();
    this.audio.playCardSlide();
    this.showScreen('duel');
    this.engine.startDuel();
    this.renderer.renderTable(this.engine);
  }

  onCardSelected(index) {
    const changed = this.engine.toggleSelectCard(index);
    if (changed) {
      this.audio.playCardSnap();
      this.renderer.renderTable(this.engine);
      const played = this.engine.player.playedCards;
      if (played.length > 0) {
        this.renderer.spawnBurst(640, 520, '#d4af37', 15);
      }
    }
  }

  endTurn() {
    if (this.engine.player.playedCards.length === 0) {
      // Must select at least 1 card
      this.renderer.spawnBurst(640, 540, '#ff4141', 20);
      return;
    }

    this.audio.playCardSlide();
    const resolution = this.engine.resolveTurn();
    this.renderer.renderTable(this.engine);

    if (!resolution) return;

    // Handle Combo Audio & FX
    if (resolution.playerCombo) {
      this.audio.playComboChime();
      this.renderer.spawnBurst(640, 360, '#ffd700', 45);
      if (resolution.playerCombo.details.burn) this.audio.playBurn();
      if (resolution.playerCombo.details.bonusShield) this.audio.playShield();
    }
    if (resolution.counterBonus > 0) {
      this.audio.playCounterImpact();
      this.renderer.spawnBurst(640, 360, '#e84a27', 35);
    }

    // Process Floating Combat Texts from Events
    if (resolution.events) {
      resolution.events.forEach((ev, i) => {
        if (ev.type === 'floating') {
          const x = ev.target === 'opponent' ? 480 + (i * 30) : 220 + (i * 30);
          const y = ev.target === 'opponent' ? 240 : 560;
          this.renderer.spawnFloatingText(x, y, ev.text, ev.color);
        }
      });
    }

    // Check game termination
    if (resolution.result === 'victory') {
      setTimeout(() => this.showVictory(), 600);
    } else if (resolution.result === 'defeat') {
      setTimeout(() => this.showDefeat(), 600);
    } else {
      // Proceed to next turn after brief resolution beat
      setTimeout(() => {
        this.engine.startTurn();
        this.renderer.renderTable(this.engine);
      }, 900);
    }
  }

  showVictory() {
    this.audio.playVictory();
    if (this.victoryModal) {
      this.victoryModal.classList.add('active');
      const stats = document.getElementById('victory-stats');
      if (stats) {
        stats.innerHTML = `
          <div class="stat-box"><span class="stat-label">Rounds Won</span><span class="stat-value">${this.engine.turnNumber}</span></div>
          <div class="stat-box"><span class="stat-label">Combos Unleashed</span><span class="stat-value">${this.engine.combosTriggered}</span></div>
          <div class="stat-box"><span class="stat-label">Counter Breaks</span><span class="stat-value">${this.engine.counterBreaks}</span></div>
          <div class="stat-box"><span class="stat-label">Remaining Vitality</span><span class="stat-value">${this.engine.player.hp}/${this.engine.player.maxHp}</span></div>
        `;
      }
      this.renderer.spawnBurst(640, 360, '#ffd700', 90);
    }
  }

  showDefeat() {
    this.audio.playDefeat();
    if (this.defeatModal) {
      this.defeatModal.classList.add('active');
      const stats = document.getElementById('defeat-stats');
      if (stats) {
        stats.innerHTML = `
          <div class="stat-box"><span class="stat-label">Turns Survived</span><span class="stat-value">${this.engine.turnNumber}</span></div>
          <div class="stat-box"><span class="stat-label">Combos Formed</span><span class="stat-value">${this.engine.combosTriggered}</span></div>
          <div class="stat-box"><span class="stat-label">Archmage Vex HP</span><span class="stat-value">${this.engine.opponent.hp}/${this.engine.opponent.maxHp}</span></div>
          <div class="stat-box"><span class="stat-label">Status</span><span class="stat-value">Incinerated</span></div>
        `;
      }
      this.renderer.spawnBurst(640, 360, '#e84a27', 70);
    }
  }

  toggleMute() {
    const isMuted = this.audio.toggleMute();
    const btnMute = document.getElementById('btn-mute');
    if (btnMute) btnMute.innerHTML = isMuted ? '&#128263;' : '&#128266;';
  }

  /**
   * Deterministic Screenshot Stager (?shot=gameplay|start|victory|defeat)
   */
  checkScreenshotMode() {
    const params = new URLSearchParams(window.location.search);
    const shot = params.get('shot');
    if (!shot) return;

    if (shot === 'start') {
      this.showScreen('title');
      return;
    }

    // Common setup for gameplay/victory/defeat table scene
    this.showScreen('duel');
    this.engine.startDuel();

    // Stage specific mid-duel state for Cover Gameplay shot
    this.engine.turnNumber = 3;
    this.engine.combosTriggered = 2;
    this.engine.counterBreaks = 2;
    this.engine.player.hp = 16;
    this.engine.player.shield = 4;
    this.engine.player.energy = 2;
    this.engine.player.thorns = 3; // Show thorns status badge!

    this.engine.opponent.hp = 13;
    this.engine.opponent.shield = 2;
    this.engine.opponent.burn = 2;   // Show burn status badge!

    // Fixed realistic cards for presentation
    this.engine.player.hand = [
      CARD_CATALOG.find(c => c.id === 'ember-blaze'),      // Ember 5
      CARD_CATALOG.find(c => c.id === 'gale-squall'),      // Gale 5 (combo wildfire!)
      CARD_CATALOG.find(c => c.id === 'tide-undertow'),    // Tide 5
      CARD_CATALOG.find(c => c.id === 'stone-monolith'),   // Stone 5
      CARD_CATALOG.find(c => c.id === 'ember-cinder')      // Ember 3
    ];

    // Player selected card 0 (Ember Blaze)
    this.engine.player.playedCards = [this.engine.player.hand[0]];

    // Opponent telegraphed intent
    this.engine.opponent.intent = {
      faceUp: CARD_CATALOG.find(c => c.id === 'gale-vortex'), // Gale 4 (Ember counters Gale!)
      faceDown: CARD_CATALOG.find(c => c.id === 'stone-crag')
    };

    // Staged combat log entries
    this.engine.combatLog = [
      { text: '--- Turn 3 begins ---', style: '' },
      { text: 'Opponent telegraphs Vortex (GALE 4)!', style: 'opp-action' },
      { text: 'COUNTER BREAK! Ember counters Gale! (+3 Break)', style: 'combo-action' },
      { text: 'You struck for 8 Damage with Wildfire!', style: 'player-action' }
    ];

    this.renderer.renderTable(this.engine);

    // Ensure badge displays glowing combo preview
    const badge = document.getElementById('combo-preview-badge');
    if (badge) {
      badge.textContent = 'WILDFIRE READY (Ember + Gale: +6 Burst Damage!)';
      badge.className = 'combo-preview-badge visible';
    }

    // Add glowing ambient particles and floating combat texts
    this.renderer.spawnBurst(640, 350, '#ffd700', 45);
    this.renderer.spawnBurst(580, 520, '#e84a27', 30);
    this.renderer.spawnFloatingText(520, 260, '-8 HP (WILDFIRE)', '#ff4141');
    this.renderer.spawnFloatingText(210, 560, '+5 SHIELD', '#1BA6A6');
    this.renderer.spawnFloatingText(560, 340, 'COUNTER BREAK! +3', '#E84A27');

    if (shot === 'victory') {
      this.showVictory();
    } else if (shot === 'defeat') {
      this.showDefeat();
    }
  }
}

// Initialize on DOM Ready
window.addEventListener('DOMContentLoaded', () => {
  window.app = new GameApp();
});

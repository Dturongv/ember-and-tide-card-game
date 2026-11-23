/**
 * EMBER & TIDE - Duel Engine & Turn State Machine
 * Handles state transitions, combat calculations, and win/loss resolution.
 */

import { createDeck } from './cards.js';
import { evaluateCombo, evaluateCounterBreak } from './combos.js';
import { OpponentAI } from './opponent.js';

export const STATE = {
  TITLE: 'title',
  PLAYER_TURN: 'player_turn',
  RESOLVING: 'resolving',
  VICTORY: 'victory',
  DEFEAT: 'defeat'
};

export class DuelEngine {
  constructor(seed = 1) {
    this.seed = seed;
    this.ai = new OpponentAI('Archmage Vex');
    this.reset();
  }

  reset() {
    this.currentState = STATE.TITLE;
    this.turnNumber = 0;
    this.combosTriggered = 0;
    this.counterBreaks = 0;

    // Player State
    this.player = {
      maxHp: 20,
      hp: 20,
      shield: 0,
      energy: 3,
      deck: createDeck(this.seed + 10),
      hand: [],
      discard: [],
      playedCards: []
    };

    // Opponent State
    this.opponent = {
      maxHp: 20,
      hp: 20,
      shield: 0,
      deck: createDeck(this.seed + 99),
      hand: [],
      discard: [],
      intent: { faceUp: null, faceDown: null }
    };

    this.combatLog = [];
  }

  startDuel() {
    this.reset();
    this.drawCards(this.player, 5);
    this.drawCards(this.opponent, 5);
    this.startTurn();
  }

  drawCards(entity, count) {
    for (let i = 0; i < count; i++) {
      if (entity.deck.length === 0) {
        if (entity.discard.length === 0) break;
        entity.deck = [...entity.discard];
        entity.discard = [];
      }
      if (entity.deck.length > 0 && entity.hand.length < 5) {
        entity.hand.push(entity.deck.pop());
      }
    }
  }

  startTurn() {
    this.turnNumber++;
    this.currentState = STATE.PLAYER_TURN;

    // Reset energy & shields for new round
    this.player.energy = 3;
    this.player.shield = 0;
    this.opponent.shield = 0;
    this.player.playedCards = [];

    // Draw up to 5 cards
    this.drawCards(this.player, 5 - this.player.hand.length);
    this.drawCards(this.opponent, 5 - this.opponent.hand.length);

    // AI forms intent
    this.opponent.intent = this.ai.planTurn(this.opponent.hand, this.opponent, this.player);

    this.log(`--- Turn ${this.turnNumber} begins ---`);
    if (this.opponent.intent.faceUp) {
      this.log(`Opponent telegraphs ${this.opponent.intent.faceUp.title} (${this.opponent.intent.faceUp.suit.toUpperCase()} ${this.opponent.intent.faceUp.value})!`, 'opp-action');
    }
  }

  /** Toggles card selection from player's hand. */
  toggleSelectCard(index) {
    if (this.currentState !== STATE.PLAYER_TURN) return false;
    const card = this.player.hand[index];
    if (!card) return false;

    const existingIdx = this.player.playedCards.indexOf(card);
    if (existingIdx !== -1) {
      // Deselect
      this.player.playedCards.splice(existingIdx, 1);
      this.player.energy += card.cost;
      return true;
    }

    // Attempt select
    if (this.player.playedCards.length >= 2) return false; // max 2
    if (this.player.energy < card.cost) return false; // not enough energy

    this.player.playedCards.push(card);
    this.player.energy -= card.cost;
    return true;
  }

  /** Resolves turn combat clash between player and opponent. */
  resolveTurn() {
    if (this.currentState !== STATE.PLAYER_TURN) return null;
    this.currentState = STATE.RESOLVING;

    const pCards = [...this.player.playedCards];
    const oIntent = this.opponent.intent;
    const oCards = [oIntent.faceUp, oIntent.faceDown].filter(Boolean);

    // Remove played cards from hands
    pCards.forEach(c => {
      const idx = this.player.hand.indexOf(c);
      if (idx !== -1) this.player.hand.splice(idx, 1);
      this.player.discard.push(c);
    });

    oCards.forEach(c => {
      const idx = this.opponent.hand.indexOf(c);
      if (idx !== -1) this.opponent.hand.splice(idx, 1);
      this.opponent.discard.push(c);
    });

    // 1. Evaluate Player Combo
    let playerDamage = pCards.reduce((acc, c) => acc + c.value, 0);
    let playerShield = 0;
    const playerCombo = pCards.length === 2 ? evaluateCombo(pCards[0], pCards[1]) : null;

    if (playerCombo) {
      this.combosTriggered++;
      const det = playerCombo.details;
      playerDamage += (det.bonusDamage || 0);
      playerShield += (det.bonusShield || 0);
      if (det.drawCards) this.drawCards(this.player, det.drawCards);
      this.log(`COMBO! ${playerCombo.name}: ${det.description}`, 'combo-action');
    }

    // 2. Evaluate Opponent Combo
    let oppDamage = oCards.reduce((acc, c) => acc + c.value, 0);
    let oppShield = 0;
    const oppCombo = oCards.length === 2 ? evaluateCombo(oCards[0], oCards[1]) : null;

    if (oppCombo) {
      const det = oppCombo.details;
      oppDamage += (det.bonusDamage || 0);
      oppShield += (det.bonusShield || 0);
      this.log(`Archmage Vex triggered ${oppCombo.name}!`, 'combo-action');
    }

    // 3. Counter Breaks between cards
    let counterBonus = 0;
    if (pCards[0] && oIntent.faceUp) {
      const cb = evaluateCounterBreak(pCards[0], oIntent.faceUp);
      if (cb.countered) {
        this.counterBreaks++;
        counterBonus += cb.breakBonus;
        this.log(`COUNTER BREAK! ${cb.reason}`, 'combo-action');
      }
    }
    playerDamage += counterBonus;

    // 4. Apply Shields
    this.player.shield += playerShield;
    this.opponent.shield += oppShield;

    // 5. Apply Damage: Opponent takes Player Damage
    let damageToOppHp = Math.max(0, playerDamage - this.opponent.shield);
    this.opponent.shield = Math.max(0, this.opponent.shield - playerDamage);
    this.opponent.hp = Math.max(0, this.opponent.hp - damageToOppHp);
    this.log(`You strike for ${playerDamage} (Enemy HP: ${this.opponent.hp})`, 'player-action');

    // Apply Damage: Player takes Opponent Damage
    let damageToPlayerHp = Math.max(0, oppDamage - this.player.shield);
    this.player.shield = Math.max(0, this.player.shield - oppDamage);
    this.player.hp = Math.max(0, this.player.hp - damageToPlayerHp);
    this.log(`Opponent strikes for ${oppDamage} (Your HP: ${this.player.hp})`, 'opp-action');

    // 6. Check Win / Loss
    let result = 'continue';
    if (this.opponent.hp <= 0 && this.player.hp > 0) {
      this.currentState = STATE.VICTORY;
      result = 'victory';
      this.log('VICTORY! Archmage Vex has been banished!', 'combo-action');
    } else if (this.player.hp <= 0) {
      this.currentState = STATE.DEFEAT;
      result = 'defeat';
      this.log('DEFEAT! Your elemental energy dispersed.', 'opp-action');
    }

    return {
      result,
      playerCombo,
      oppCombo,
      counterBonus,
      playerDamage,
      oppDamage
    };
  }

  log(msg, style = '') {
    this.combatLog.push({ text: msg, style });
    if (this.combatLog.length > 50) this.combatLog.shift();
  }
}

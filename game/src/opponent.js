/**
 * EMBER & TIDE - Opponent AI (Archmage Vex)
 * Generates telegraphed tactical plays with 1 face-up and 1 face-down card.
 */

import { evaluateCombo } from './combos.js';

export class OpponentAI {
  constructor(name = 'Archmage Vex') {
    this.name = name;
  }

  /**
   * Plans the turn: selects 2 cards from opponent's hand to play.
   * Exactly 1 card is designated as face-up (telegraphed intent)
   * and 1 card is face-down (hidden surprise).
   */
  planTurn(hand, opponentState, playerState) {
    if (!hand || hand.length === 0) return { faceUp: null, faceDown: null };
    if (hand.length === 1) return { faceUp: hand[0], faceDown: null };

    // Find best combination of 2 cards within 3 Energy budget
    let bestPair = [hand[0], hand[1]];
    let bestScore = -999;

    for (let i = 0; i < hand.length; i++) {
      for (let j = i + 1; j < hand.length; j++) {
        const c1 = hand[i];
        const c2 = hand[j];
        if (c1.cost + c2.cost > 3) continue; // exceed energy

        let score = c1.value + c2.value;

        // Synergy bonus
        const combo = evaluateCombo(c1, c2);
        if (combo) score += 6;

        // Health-based tactical adjustments
        if (opponentState.hp <= 8) {
          // Desperately needs shield/sustain
          if (c1.suit === 'tide' || c2.suit === 'tide') score += 5;
          if (c1.suit === 'stone' || c2.suit === 'stone') score += 5;
        } else if (playerState.hp <= 8) {
          // Go for lethal with attack/burn
          if (c1.suit === 'ember' || c2.suit === 'ember') score += 6;
          if (c1.suit === 'gale' || c2.suit === 'gale') score += 5;
        }

        if (score > bestScore) {
          bestScore = score;
          bestPair = [c1, c2];
        }
      }
    }

    // Decide which card is telegraphed face-up:
    // Telegraph the threat card or setup card to bait player counterplay
    const [cardA, cardB] = bestPair;
    let faceUp = cardA;
    let faceDown = cardB;

    if (cardB.value > cardA.value && Math.random() > 0.4) {
      faceUp = cardB;
      faceDown = cardA;
    }

    return { faceUp, faceDown };
  }
}

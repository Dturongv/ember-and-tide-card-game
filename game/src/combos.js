/**
 * EMBER & TIDE - Combo & Counter Resolution System
 * Evaluates Harmonic Pairs, Elemental Reactions, and Counter Breaks.
 * Fully drives combat status effects: Burn, Thorns, Freeze, Shatter, and Pierce.
 */

import { SUITS } from './cards.js';

export const HARMONIC_PAIRS = {
  ember: {
    name: 'Hellfire Surge',
    bonusDamage: 4,
    bonusShield: 0,
    burn: 2,
    piercing: false,
    description: '+4 Direct Damage & 2 Burn stacks (scorch over time)'
  },
  tide: {
    name: 'Oceanic Bastion',
    bonusDamage: 0,
    bonusShield: 6,
    drawCards: 1,
    description: '+6 Shield & Draw 1 Card immediately'
  },
  gale: {
    name: 'Cyclonic Haste',
    bonusDamage: 3,
    bonusShield: 0,
    bonusEnergyNext: 1,
    piercing: true,
    description: '+3 Piercing Damage & +1 Energy next turn'
  },
  stone: {
    name: 'Granite Aegis',
    bonusDamage: 0,
    bonusShield: 8,
    thorns: 3,
    description: '+8 Shield & 3 Thorns (reflects attacker strikes)'
  }
};

export const ELEMENTAL_REACTIONS = {
  'ember+gale': {
    name: 'Wildfire',
    bonusDamage: 6,
    bonusShield: 0,
    burn: 1,
    piercing: false,
    description: 'Blazing storm deals +6 Burst Damage & inflicts Burn!'
  },
  'ember+tide': {
    name: 'Steam Veil',
    bonusDamage: 3,
    bonusShield: 5,
    piercing: false,
    description: 'Scalding vapor deals 3 Dmg & grants 5 Shield'
  },
  'ember+stone': {
    name: 'Magma Eruption',
    bonusDamage: 7,
    bonusShield: 0,
    piercing: true,
    description: 'Molten rock pierces enemy defenses for +7 Direct Dmg!'
  },
  'gale+tide': {
    name: 'Maelstrom',
    bonusDamage: 2,
    bonusShield: 3,
    drawCards: 1,
    description: 'Whirling vortex deals 2 Dmg, grants 3 Shield & draws 1'
  },
  'gale+stone': {
    name: 'Shatter',
    bonusDamage: 5,
    bonusShield: 0,
    breakShield: true,
    description: 'Shatters enemy shield to 0 and crushes for +5 Dmg!'
  },
  'stone+tide': {
    name: 'Glacier',
    bonusDamage: 0,
    bonusShield: 8,
    freeze: true,
    description: 'Absolute zero barrier grants 8 Shield & freezes foe action!'
  }
};

/** Evaluates the combo triggered by 2 played cards. */
export function evaluateCombo(cardA, cardB) {
  if (!cardA || !cardB) return null;

  const suitA = cardA.suit.toLowerCase();
  const suitB = cardB.suit.toLowerCase();

  // Harmonic Pair (Same Suit)
  if (suitA === suitB) {
    const pair = HARMONIC_PAIRS[suitA];
    return {
      type: 'harmonic',
      name: pair.name,
      badge: `${pair.name.toUpperCase()} READY`,
      details: pair
    };
  }

  // Elemental Reaction (Different Suits)
  const key1 = `${suitA}+${suitB}`;
  const key2 = `${suitB}+${suitA}`;
  const reaction = ELEMENTAL_REACTIONS[key1] || ELEMENTAL_REACTIONS[key2];

  if (reaction) {
    return {
      type: 'reaction',
      name: reaction.name,
      badge: `${reaction.name.toUpperCase()} READY`,
      details: reaction
    };
  }

  return null;
}

/** Resolves elemental counter-break between an attacking card and a defending card. */
export function evaluateCounterBreak(playerCard, opponentCard) {
  if (!playerCard || !opponentCard) {
    return { countered: false, breakBonus: 0, reason: '' };
  }

  const pSuit = SUITS[playerCard.suit.toUpperCase()];
  const oSuit = SUITS[opponentCard.suit.toUpperCase()];

  let countered = false;
  let reason = '';
  let breakBonus = 0;

  // Suit Advantage check
  if (pSuit.counters === oSuit.id) {
    countered = true;
    breakBonus += 3;
    reason = `${pSuit.name} counters ${oSuit.name}! (+3 Counter Break)`;
  } else if (oSuit.counters === pSuit.id) {
    reason = `${oSuit.name} has counter-advantage over ${pSuit.name}!`;
  }

  // Value Superiority check
  if (playerCard.value > opponentCard.value) {
    const diff = playerCard.value - opponentCard.value;
    breakBonus += Math.min(diff, 4);
    if (!countered) {
      countered = true;
      reason = `Value Superiority (${playerCard.value} vs ${opponentCard.value})! (+${Math.min(diff, 4)} Break)`;
    }
  }

  return { countered, breakBonus, reason };
}

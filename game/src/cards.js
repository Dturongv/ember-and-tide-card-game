/**
 * EMBER & TIDE - Card & Suit Definitions
 * Modular, vanilla ES module, zero external dependencies.
 */

export const SUITS = {
  EMBER: {
    id: 'ember',
    name: 'Ember',
    color: '#E84A27',
    glow: 'rgba(232, 74, 39, 0.45)',
    type: 'Attack & Burn',
    shape: 'Flame / Diamond',
    counters: 'gale',
    counteredBy: 'stone'
  },
  TIDE: {
    id: 'tide',
    name: 'Tide',
    color: '#1BA6A6',
    glow: 'rgba(27, 166, 166, 0.45)',
    type: 'Shield & Heal',
    shape: 'Droplet / Wave',
    counters: 'stone',
    counteredBy: 'gale'
  },
  GALE: {
    id: 'gale',
    name: 'Gale',
    color: '#F2B705',
    glow: 'rgba(242, 183, 5, 0.45)',
    type: 'Tempo & Pierce',
    shape: 'Bolt / Chevron',
    counters: 'tide',
    counteredBy: 'ember'
  },
  STONE: {
    id: 'stone',
    name: 'Stone',
    color: '#8A5CF6',
    glow: 'rgba(138, 92, 246, 0.45)',
    type: 'Counter & Thorns',
    shape: 'Hexagon / Crystal',
    counters: 'ember',
    counteredBy: 'tide'
  }
};

/**
 * Returns inline SVG markup for a suit icon.
 * Ensures bold thumbnail readability without external assets.
 */
export function getSuitSvg(suitId, size = 48) {
  const s = SUITS[suitId.toUpperCase()] || SUITS.EMBER;
  switch (s.id) {
    case 'ember':
      return `<svg class="card-suit-svg" width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 4C24 4 34 16 34 26C34 32.6 29.5 38 24 38C18.5 38 14 32.6 14 26C14 19 20 12 24 4Z" fill="${s.color}"/>
        <path d="M24 16C24 16 29 23 29 28C29 31.3 26.8 34 24 34C21.2 34 19 31.3 19 28C19 23 22 20 24 16Z" fill="#FFA23A"/>
        <path d="M24 2C12 18 8 26 8 32C8 40.8 15.2 46 24 46C32.8 46 40 40.8 40 32C40 18 24 2 24 2Z" stroke="#7C220F" stroke-width="2.5" stroke-linejoin="round"/>
      </svg>`;
    case 'tide':
      return `<svg class="card-suit-svg" width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 4C24 4 10 20 10 30C10 37.7 16.3 44 24 44C31.7 44 38 37.7 38 30C38 20 24 4 24 4Z" fill="${s.color}"/>
        <path d="M16 30C18 34 22 36 26 36C29 36 32 34 34 30C31 33 27 34 24 34C20 34 18 32 16 30Z" fill="#A4F4F4"/>
        <circle cx="21" cy="22" r="3" fill="#E0FFFF"/>
        <path d="M24 4C24 4 10 20 10 30C10 37.7 16.3 44 24 44C31.7 44 38 37.7 38 30C38 20 24 4 24 4Z" stroke="#0C5656" stroke-width="2.5" stroke-linejoin="round"/>
      </svg>`;
    case 'gale':
      return `<svg class="card-suit-svg" width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M28 4L12 26H24L20 44L36 22H24L28 4Z" fill="${s.color}"/>
        <path d="M25 10L16 24H24L21 36L31 22H24L25 10Z" fill="#FFF275"/>
        <path d="M28 4L12 26H24L20 44L36 22H24L28 4Z" stroke="#775A02" stroke-width="2.5" stroke-linejoin="round"/>
      </svg>`;
    case 'stone':
      return `<svg class="card-suit-svg" width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 4L40 14V34L24 44L8 34V14L24 4Z" fill="${s.color}"/>
        <path d="M24 12L34 18V30L24 36L14 30V18L24 12Z" fill="#B49BFF"/>
        <path d="M24 4L40 14V34L24 44L8 34V14L24 4Z" stroke="#4A2D8A" stroke-width="2.5" stroke-linejoin="round"/>
      </svg>`;
  }
}

/** Pre-defined card catalog for balanced, tactical duels. Enhanced with lore and roles. */
export const CARD_CATALOG = [
  // Ember Cards (Attack, Direct, Burn)
  { id: 'ember-cinder', suit: 'ember', value: 3, cost: 1, title: 'Cinder', role: 'Attack', desc: 'A searing burst of sparks.' },
  { id: 'ember-blaze', suit: 'ember', value: 5, cost: 1, title: 'Blaze', role: 'Heavy Atk', desc: 'Roaring flame that consumes armor.' },
  { id: 'ember-inferno', suit: 'ember', value: 7, cost: 2, title: 'Inferno', role: 'Firestorm', desc: 'Unleashes an incinerating conflagration.' },
  { id: 'ember-cataclysm', suit: 'ember', value: 9, cost: 2, title: 'Cataclysm', role: 'Ultimate', desc: 'Primordial devastation from the core.' },
  { id: 'ember-spark', suit: 'ember', value: 2, cost: 1, title: 'Spark', role: 'Quick Atk', desc: 'Swift ignition of volatile embers.' },
  { id: 'ember-flare', suit: 'ember', value: 4, cost: 1, title: 'Solar Flare', role: 'Burn', desc: 'Blinding heat that scorches foes.' },

  // Tide Cards (Shield, Sustain, Cleanse)
  { id: 'tide-ripple', suit: 'tide', value: 3, cost: 1, title: 'Ripple', role: 'Shield', desc: 'Gentle eddy that absorbs impacts.' },
  { id: 'tide-undertow', suit: 'tide', value: 5, cost: 1, title: 'Undertow', role: 'Bastion', desc: 'Submerged current creating dense barriers.' },
  { id: 'tide-surge', suit: 'tide', value: 6, cost: 2, title: 'Surge', role: 'Tsunami', desc: 'Crashing wave washing away strikes.' },
  { id: 'tide-leviathan', suit: 'tide', value: 8, cost: 2, title: 'Abyss', role: 'Ultimate', desc: 'Depths of the ocean swallowing all harm.' },
  { id: 'tide-mist', suit: 'tide', value: 2, cost: 1, title: 'Mist', role: 'Dodge', desc: 'Elusive shroud dispersing enemy aim.' },
  { id: 'tide-torrent', suit: 'tide', value: 4, cost: 1, title: 'Torrent', role: 'Ward', desc: 'Spiraling deluge shielding the caster.' },

  // Gale Cards (Tempo, Pierce, Draw)
  { id: 'gale-gust', suit: 'gale', value: 3, cost: 1, title: 'Gust', role: 'Pierce', desc: 'Piercing wind that slips past barriers.' },
  { id: 'gale-squall', suit: 'gale', value: 5, cost: 1, title: 'Squall', role: 'Tempo', desc: 'Cutting drafts quickening your flow.' },
  { id: 'gale-tempest', suit: 'gale', value: 6, cost: 2, title: 'Tempest', role: 'Cyclone', desc: 'Violent vortex scattering defenses.' },
  { id: 'gale-zephyr', suit: 'gale', value: 8, cost: 2, title: 'Zephyr', role: 'Ultimate', desc: 'Transcendent gale piercing all opposition.' },
  { id: 'gale-breeze', suit: 'gale', value: 2, cost: 1, title: 'Breeze', role: 'Agile', desc: 'Light draft granting swift momentum.' },
  { id: 'gale-vortex', suit: 'gale', value: 4, cost: 1, title: 'Vortex', role: 'Pierce', desc: 'Sharpened air stream striking true.' },

  // Stone Cards (Counter, Thorns, Fortify)
  { id: 'stone-pebble', suit: 'stone', value: 3, cost: 1, title: 'Pebble', role: 'Thorns', desc: 'Jagged gravel stinging reckless foes.' },
  { id: 'stone-monolith', suit: 'stone', value: 5, cost: 1, title: 'Monolith', role: 'Fortress', desc: 'Ancient obelisk deflecting assault.' },
  { id: 'stone-bastion', suit: 'stone', value: 7, cost: 2, title: 'Bastion', role: 'Reflect', desc: 'Impenetrable rampart turning force back.' },
  { id: 'stone-titan', suit: 'stone', value: 9, cost: 2, title: 'Titan Aegis', role: 'Ultimate', desc: 'Colossal mountain standing unbreakable.' },
  { id: 'stone-crag', suit: 'stone', value: 2, cost: 1, title: 'Crag', role: 'Block', desc: 'Steep granite blocking incoming strikes.' },
  { id: 'stone-pillar', suit: 'stone', value: 4, cost: 1, title: 'Pillar', role: 'Counter', desc: 'Stout column shattering attacker posture.' }
];

/** Creates a fresh shuffled 24-card duel deck. */
export function createDeck(seed = 1) {
  const deck = CARD_CATALOG.map((c, i) => ({ ...c, uid: `${c.id}-${i}-${seed}` }));
  // Deterministic Fisher-Yates shuffle
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  const nextRand = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(nextRand() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

/** Renders a card element HTML string. */
export function renderCardHtml(card, { faceDown = false, telegraphed = false, selected = false, index = 0 } = {}) {
  if (faceDown) {
    return `<div class="card card-back" data-uid="${card.uid || index}">
      <div class="card-back-pattern">
        <div class="card-back-rune">&#10022;</div>
      </div>
    </div>`;
  }

  const suit = card.suit.toLowerCase();
  const svg = getSuitSvg(suit, 46);

  return `<div class="card card-${suit} ${selected ? 'selected' : ''}" data-uid="${card.uid || index}" data-suit="${suit}" data-value="${card.value}" data-cost="${card.cost}">
    ${telegraphed ? '<div class="telegraphed-badge">TELEGRAPHED INTENT</div>' : ''}
    <div class="card-inner">
      <div class="card-top-row">
        <span class="card-value">${card.value}</span>
        <div class="card-cost-gem" title="Energy Cost: ${card.cost}">${card.cost}</div>
      </div>
      <div class="card-art-area">
        ${svg}
      </div>
      <div class="card-bottom-row">
        <div class="card-title">${card.title}</div>
        <div class="card-type-tag">${card.role}</div>
      </div>
    </div>
  </div>`;
}

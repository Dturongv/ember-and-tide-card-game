/**
 * EMBER & TIDE - Mouse & Keyboard Controller
 * Supports dual input modality: clicks + keys (1-5, Space, Enter, M, R).
 */

export class InputController {
  constructor(gameApp) {
    this.app = gameApp;
    this.setupListeners();
  }

  setupListeners() {
    // Keyboard Handler
    window.addEventListener('keydown', (e) => {
      // Ignore if typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const code = e.code;
      const key = e.key;

      // 1 - 5: Select Card in Hand
      if (['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5'].includes(code)) {
        const index = parseInt(key, 10) - 1;
        this.app.onCardSelected(index);
        e.preventDefault();
        return;
      }

      // Space / Enter / E: End Turn or Play Duel
      if (code === 'Space' || code === 'Enter' || code === 'KeyE') {
        if (this.app.isTitleScreen()) {
          this.app.startNewGame();
        } else if (this.app.isDuelScreen()) {
          this.app.endTurn();
        }
        e.preventDefault();
        return;
      }

      // M: Mute Sound
      if (code === 'KeyM') {
        this.app.toggleMute();
        e.preventDefault();
        return;
      }

      // R: Rematch / Restart
      if (code === 'KeyR') {
        this.app.startNewGame();
        e.preventDefault();
      }
    });

    // Mouse Card Selection Delegation
    const playerHand = document.getElementById('player-hand');
    if (playerHand) {
      playerHand.addEventListener('click', (e) => {
        const cardEl = e.target.closest('.card');
        if (!cardEl) return;
        const wrappers = Array.from(playerHand.querySelectorAll('.card-wrapper'));
        const parentWrapper = cardEl.closest('.card-wrapper');
        const index = wrappers.indexOf(parentWrapper);
        if (index !== -1) {
          this.app.onCardSelected(index);
        }
      });
    }

    // UI Buttons
    const btnPlay = document.getElementById('btn-play');
    if (btnPlay) btnPlay.addEventListener('click', () => this.app.startNewGame());

    const btnEndTurn = document.getElementById('btn-end-turn');
    if (btnEndTurn) btnEndTurn.addEventListener('click', () => this.app.endTurn());

    const btnMute = document.getElementById('btn-mute');
    if (btnMute) btnMute.addEventListener('click', () => this.app.toggleMute());

    const btnVicAgain = document.getElementById('btn-victory-again');
    if (btnVicAgain) btnVicAgain.addEventListener('click', () => this.app.startNewGame());

    const btnDefRematch = document.getElementById('btn-defeat-rematch');
    if (btnDefRematch) btnDefRematch.addEventListener('click', () => this.app.startNewGame());
  }
}

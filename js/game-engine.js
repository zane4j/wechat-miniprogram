import { deal } from './deck.js';
import { canPlay, sortHand } from './rules.js';
import { chooseCard } from './ai-player.js';

export class GameEngine {
  constructor() {
    this.reset();
  }

  reset() {
    const result = deal(4, 13);
    this.players = result.hands.map((hand, index) => ({
      id: index,
      name: index === 0 ? '你' : `机器人${index}`,
      hand: sortHand(hand),
      passed: false
    }));
    this.bottomCards = result.bottomCards;
    this.currentPlayer = 0;
    this.tableCard = null;
    this.lastPlayer = null;
    this.passCount = 0;
    this.winner = null;
    this.message = '轮到你出牌';
  }

  playCard(playerId, cardId) {
    if (this.winner !== null || playerId !== this.currentPlayer) return false;
    const player = this.players[playerId];
    const index = player.hand.findIndex((card) => card.id === cardId);
    if (index < 0) return false;

    const card = player.hand[index];
    if (!canPlay(card, this.tableCard)) {
      this.message = '这张牌不够大';
      return false;
    }

    player.hand.splice(index, 1);
    this.tableCard = card;
    this.lastPlayer = playerId;
    this.passCount = 0;
    this.players.forEach((item) => { item.passed = false; });

    if (player.hand.length === 0) {
      this.winner = playerId;
      this.message = `${player.name}获胜`;
      return true;
    }

    this.nextTurn();
    return true;
  }

  pass(playerId) {
    if (this.winner !== null || playerId !== this.currentPlayer || !this.tableCard) return false;
    this.players[playerId].passed = true;
    this.passCount += 1;

    if (this.passCount >= this.players.length - 1 && this.lastPlayer !== null) {
      this.currentPlayer = this.lastPlayer;
      this.tableCard = null;
      this.passCount = 0;
      this.players.forEach((item) => { item.passed = false; });
      this.message = `${this.players[this.currentPlayer].name}重新出牌`;
      return true;
    }

    this.nextTurn();
    return true;
  }

  nextTurn() {
    this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
    this.message = `轮到${this.players[this.currentPlayer].name}`;
  }

  runRobotTurn() {
    if (this.currentPlayer === 0 || this.winner !== null) return;
    const player = this.players[this.currentPlayer];
    const card = chooseCard(player.hand, this.tableCard);
    if (card) this.playCard(player.id, card.id);
    else this.pass(player.id);
  }
}

import { canPlay, getPower } from './rules.js';

export function chooseCard(hand, tableCard) {
  const playable = hand.filter((card) => canPlay(card, tableCard));
  if (playable.length === 0) return null;
  return playable.sort((a, b) => getPower(a) - getPower(b))[0];
}

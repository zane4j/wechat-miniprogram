const RANK_POWER = {
  '3': 1,
  '4': 2,
  '6': 3,
  '8': 4,
  '9': 5,
  '10': 6,
  J: 7,
  Q: 8,
  K: 9,
  A: 10,
  '5': 11,
  '2': 12,
  '7': 13,
  SJ: 14,
  BJ: 15
};

export function getPower(card) {
  return RANK_POWER[card.rank] || 0;
}

export function sortHand(cards) {
  return cards.slice().sort((a, b) => {
    const powerDiff = getPower(a) - getPower(b);
    return powerDiff !== 0 ? powerDiff : a.suit.localeCompare(b.suit);
  });
}

export function canPlay(card, tableCard) {
  if (!tableCard) return true;
  return getPower(card) > getPower(tableCard);
}

export function getCardLabel(card) {
  if (card.rank === 'SJ') return '小王';
  if (card.rank === 'BJ') return '大王';
  return `${card.suit}${card.rank}`;
}

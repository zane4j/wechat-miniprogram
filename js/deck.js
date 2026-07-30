const SUITS = ['♠', '♥', '♣', '♦'];
const RANKS = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'];

export function createDeck() {
  const cards = [];
  let id = 1;

  SUITS.forEach((suit) => {
    RANKS.forEach((rank) => {
      cards.push({ id: id++, suit, rank, joker: false });
    });
  });

  cards.push({ id: id++, suit: '', rank: 'SJ', joker: true });
  cards.push({ id: id++, suit: '', rank: 'BJ', joker: true });
  return cards;
}

export function shuffle(cards) {
  const result = cards.slice();
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function deal(playerCount = 4, cardsPerPlayer = 13) {
  const deck = shuffle(createDeck());
  const hands = Array.from({ length: playerCount }, () => []);

  for (let i = 0; i < playerCount * cardsPerPlayer; i += 1) {
    hands[i % playerCount].push(deck[i]);
  }

  return {
    hands,
    bottomCards: deck.slice(playerCount * cardsPerPlayer)
  };
}

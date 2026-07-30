import { GameEngine } from './game-engine.js';
import { getCardLabel } from './rules.js';

const system = wx.getSystemInfoSync();
const canvas = wx.createCanvas();
const ctx = canvas.getContext('2d');
const width = system.windowWidth;
const height = system.windowHeight;
const dpr = system.pixelRatio || 1;

canvas.width = width * dpr;
canvas.height = height * dpr;
ctx.scale(dpr, dpr);

const game = new GameEngine();
let selectedCardId = null;
let robotTimer = null;

function roundRect(x, y, w, h, r, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function drawText(text, x, y, size = 16, align = 'left') {
  ctx.font = `${size}px sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
}

function drawBackground() {
  ctx.fillStyle = '#176b48';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  for (let y = 0; y < height; y += 32) {
    for (let x = 0; x < width; x += 32) {
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawPlayers() {
  const positions = [
    { x: width / 2, y: height - 175 },
    { x: 48, y: height / 2 - 30 },
    { x: width / 2, y: 75 },
    { x: width - 48, y: height / 2 - 30 }
  ];

  game.players.forEach((player, index) => {
    const pos = positions[index];
    ctx.fillStyle = game.currentPlayer === index ? '#ffe083' : '#ffffff';
    drawText(player.name, pos.x, pos.y, 15, 'center');
    ctx.fillStyle = '#ffffff';
    drawText(`${player.hand.length} 张`, pos.x, pos.y + 22, 13, 'center');
  });
}

function drawTableCard() {
  const x = width / 2 - 34;
  const y = height / 2 - 62;
  ctx.fillStyle = '#f7f3e8';
  ctx.strokeStyle = '#d1c7b8';
  ctx.lineWidth = 2;
  roundRect(x, y, 68, 96, 8, true, true);
  ctx.fillStyle = '#222222';
  drawText(game.tableCard ? getCardLabel(game.tableCard) : '空', width / 2, y + 48, 20, 'center');
}

function getHandLayout() {
  const hand = game.players[0].hand;
  const cardWidth = 54;
  const overlap = Math.min(30, (width - 32 - cardWidth) / Math.max(1, hand.length - 1));
  const totalWidth = cardWidth + Math.max(0, hand.length - 1) * overlap;
  const startX = (width - totalWidth) / 2;
  return { cardWidth, cardHeight: 78, overlap, startX, y: height - 135 };
}

function drawHand() {
  const hand = game.players[0].hand;
  const layout = getHandLayout();

  hand.forEach((card, index) => {
    const x = layout.startX + index * layout.overlap;
    const selected = card.id === selectedCardId;
    const y = layout.y - (selected ? 16 : 0);
    ctx.fillStyle = '#fffdf6';
    ctx.strokeStyle = selected ? '#ffd45c' : '#c9c1b5';
    ctx.lineWidth = selected ? 3 : 1;
    roundRect(x, y, layout.cardWidth, layout.cardHeight, 6, true, true);
    ctx.fillStyle = card.suit === '♥' || card.suit === '♦' ? '#c93232' : '#202020';
    drawText(getCardLabel(card), x + 7, y + 18, 15, 'left');
  });
}

function drawButton(label, x, y, w, h, enabled) {
  ctx.fillStyle = enabled ? '#f1c94c' : '#8a927f';
  roundRect(x, y, w, h, 8, true, false);
  ctx.fillStyle = enabled ? '#29240f' : '#d6d6d6';
  drawText(label, x + w / 2, y + h / 2, 16, 'center');
}

function drawUi() {
  ctx.fillStyle = '#ffffff';
  drawText('7鬼523', width / 2, 28, 24, 'center');
  drawText(game.message, width / 2, height / 2 + 62, 16, 'center');

  const canOperate = game.currentPlayer === 0 && game.winner === null;
  drawButton('出牌', width / 2 - 100, height - 205, 80, 40, canOperate && selectedCardId !== null);
  drawButton('过牌', width / 2 + 20, height - 205, 80, 40, canOperate && !!game.tableCard);

  if (game.winner !== null) {
    drawButton('再来一局', width / 2 - 55, height / 2 + 95, 110, 42, true);
  }
}

function render() {
  drawBackground();
  drawPlayers();
  drawTableCard();
  drawUi();
  drawHand();
  requestAnimationFrame(render);
}

function findTouchedCard(x, y) {
  const hand = game.players[0].hand;
  const layout = getHandLayout();
  for (let i = hand.length - 1; i >= 0; i -= 1) {
    const cardX = layout.startX + i * layout.overlap;
    if (x >= cardX && x <= cardX + layout.cardWidth && y >= layout.y - 20 && y <= layout.y + layout.cardHeight) {
      return hand[i];
    }
  }
  return null;
}

function scheduleRobots() {
  if (robotTimer) clearTimeout(robotTimer);
  if (game.currentPlayer !== 0 && game.winner === null) {
    robotTimer = setTimeout(() => {
      game.runRobotTurn();
      scheduleRobots();
    }, 650);
  }
}

wx.onTouchStart((event) => {
  const touch = event.touches[0];
  if (!touch) return;
  const x = touch.clientX;
  const y = touch.clientY;

  if (game.winner !== null && x >= width / 2 - 55 && x <= width / 2 + 55 && y >= height / 2 + 95 && y <= height / 2 + 137) {
    game.reset();
    selectedCardId = null;
    scheduleRobots();
    return;
  }

  if (game.currentPlayer !== 0 || game.winner !== null) return;

  const card = findTouchedCard(x, y);
  if (card) {
    selectedCardId = selectedCardId === card.id ? null : card.id;
    return;
  }

  if (x >= width / 2 - 100 && x <= width / 2 - 20 && y >= height - 205 && y <= height - 165 && selectedCardId !== null) {
    const played = game.playCard(0, selectedCardId);
    if (played) selectedCardId = null;
    scheduleRobots();
    return;
  }

  if (x >= width / 2 + 20 && x <= width / 2 + 100 && y >= height - 205 && y <= height - 165) {
    if (game.pass(0)) selectedCardId = null;
    scheduleRobots();
  }
});

render();
scheduleRobots();

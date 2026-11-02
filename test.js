const assert = require('node:assert/strict');
const { Canvas } = require('./canvas');
const { WIDTH, HEIGHT, step, territory } = require('./life');

function grid() { return Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(null)); }
function points(g) { const out = []; g.forEach((row, y) => row.forEach((v, x) => { if (v) out.push(`${x},${y}`); })); return out.sort(); }

const blinker = grid();
for (const [x, y] of [[10, 9], [10, 10], [10, 11]]) blinker[y][x] = 'fire';
assert.deepEqual(points(step(blinker).grid), ['10,10', '11,10', '9,10']);
assert.deepEqual(points(step(step(blinker).grid).grid), points(blinker));

const block = grid();
for (const [x, y] of [[4, 4], [5, 4], [4, 5], [5, 5]]) block[y][x] = 'ice';
assert.deepEqual(points(step(block).grid), points(block));
assert.deepEqual(territory(block), { fire: 0, ice: 4, total: 4, firePct: 0, icePct: 100 });
assert.equal(step(block).winner, 'ICE WINS');

const c = new Canvas();
assert.equal(c.join('Ada', 'fire').ok, true);
assert.equal(c.place('Ada', 1, 1, 10000).pixels.length, 4); // 3x3 clipped at the corner
assert.equal(c.place('Ada', 10, 10, 12000).error.includes('3 seconds'), true);
assert.equal(c.join('Bea', 'ice').team, 'ice');
assert.equal(c.place('Bea', 48, 27, 10000).pixels.length, 4);
assert.equal(c.stats().territory.total, 8);
assert.equal(c.place('Nobody', 1, 1, 10000).ok, false);
assert.equal(c.place('Ada', 49, 1, 14000).ok, false);

const capped = new Canvas();
for (const [x, y] of [[4, 4], [5, 4], [4, 5], [5, 5]]) capped.grid[y][x] = 'ice';
capped.generation = 99;
assert.equal(capped.advance().winner, 'ICE WINS');
console.log('Canvas and Life tests passed.');

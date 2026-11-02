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

function activate(canvas, user, team, now) {
  canvas.join(user, team);
  canvas.place(user, team === 'fire' ? 2 : 46, team === 'fire' ? 2 : 26, now);
}
function putBlock(canvas, team, x, y) {
  for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) canvas.grid[y + dy][x + dx] = team;
}

// One active team cannot claim an extinction win, even across many generations.
const solo = new Canvas();
activate(solo, 'solo', 'fire', 10000);
solo.grid = grid(); putBlock(solo, 'fire', 10, 10);
for (let i = 0; i < 20; i++) assert.equal(solo.advance(() => 0).winner, null);

// When both teams have entered, extinction of FIRE awards ICE the round.
const extinction = new Canvas();
activate(extinction, 'f', 'fire', 10000); activate(extinction, 'i', 'ice', 10000);
extinction.grid = grid(); putBlock(extinction, 'ice', 4, 4); extinction.grid[20][20] = 'fire';
assert.equal(extinction.advance(() => 0).winner, 'ICE WINS');

// Empty rounds never end, including beyond the nominal generation cap.
const empty = new Canvas();
for (let i = 0; i < 105; i++) assert.equal(empty.advance(() => 0).winner, null);

// A late second team counts once it paints; FIRE's later extinction awards ICE.
const delayed = new Canvas();
activate(delayed, 'fireuser', 'fire', 10000);
delayed.grid = grid(); putBlock(delayed, 'fire', 10, 10);
assert.equal(delayed.advance(() => 0).winner, null);
activate(delayed, 'iceuser', 'ice', 14000);
delayed.grid = grid(); putBlock(delayed, 'ice', 4, 4); delayed.grid[20][20] = 'fire';
assert.equal(delayed.advance(() => 0).winner, 'ICE WINS');

// At the cap, territory wins; equal territory is a draw.
const cappedLead = new Canvas();
activate(cappedLead, 'f', 'fire', 10000); activate(cappedLead, 'i', 'ice', 10000);
cappedLead.grid = grid(); putBlock(cappedLead, 'fire', 5, 5);
cappedLead.generation = 99;
assert.equal(cappedLead.advance(() => 0).winner, 'FIRE WINS');

const capped = new Canvas();
activate(capped, 'f', 'fire', 10000); activate(capped, 'i', 'ice', 10000);
capped.grid = grid(); putBlock(capped, 'fire', 5, 5); putBlock(capped, 'ice', 35, 18);
capped.generation = 99;
assert.equal(capped.advance(() => 0).winner, 'DRAW');
capped.reset();
assert.equal(capped.activeTeams.size, 0);
console.log('Canvas and Life tests passed.');

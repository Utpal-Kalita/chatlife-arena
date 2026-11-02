const WIDTH = 48, HEIGHT = 27;

function territory(grid) {
  let fire = 0, ice = 0;
  for (const row of grid) for (const cell of row) if (cell === 'fire') fire++; else if (cell === 'ice') ice++;
  const total = fire + ice;
  return { fire, ice, total, firePct: total ? Math.round(fire * 100 / total) : 0, icePct: total ? Math.round(ice * 100 / total) : 0 };
}

function step(grid, random = Math.random) {
  const next = Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(null));
  for (let y = 0; y < HEIGHT; y++) for (let x = 0; x < WIDTH; x++) {
    let neighbors = 0, fire = 0, ice = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const team = grid[y + dy]?.[x + dx];
      if (team === 'fire' || team === 'ice') { neighbors++; team === 'fire' ? fire++ : ice++; }
    }
    const alive = grid[y][x] === 'fire' || grid[y][x] === 'ice';
    if ((alive && (neighbors === 2 || neighbors === 3)) || (!alive && neighbors === 3))
      next[y][x] = fire === ice ? (random() < 0.5 ? 'fire' : 'ice') : fire > ice ? 'fire' : 'ice';
  }
  const stats = territory(next);
  const winner = stats.fire === 0 && stats.ice === 0 ? 'DRAW' : stats.fire === 0 ? 'ICE WINS' : stats.ice === 0 ? 'FIRE WINS' : null;
  return { grid: next, territory: stats, winner };
}

module.exports = { WIDTH, HEIGHT, step, territory };

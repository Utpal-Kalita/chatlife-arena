const { WIDTH, HEIGHT, step, territory } = require('./life');

class Canvas {
  constructor() { this.reset(); this.teams = new Map(); this.cooldowns = new Map(); }

  reset() {
    this.grid = Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(null));
    this.generation = 0;
    this.placements = 0;
    this.lastPainters = [];
    this.activeTeams = new Set();
  }

  join(user, team) {
    team = String(team || '').toLowerCase();
    if (!['fire', 'ice'].includes(team)) return { ok: false, error: 'Choose a team: !join fire or !join ice.' };
    this.teams.set(String(user).toLowerCase(), team);
    return { ok: true, team };
  }

  place(user, x, y, now = Date.now()) {
    x = Number(x); y = Number(y);
    const name = String(user).replace(/^@/, '').slice(0, 32) || 'anonymous';
    const team = this.teams.get(name.toLowerCase());
    if (!team) return { ok: false, error: 'Join a team first with !join fire or !join ice.' };
    if (!Number.isInteger(x) || x < 1 || x > WIDTH || !Number.isInteger(y) || y < 1 || y > HEIGHT)
      return { ok: false, error: 'Coordinates must be x 1–48 and y 1–27.' };
    const key = name.toLowerCase();
    if (now - (this.cooldowns.get(key) ?? -Infinity) < 3000) return { ok: false, error: 'Give your pixels 3 seconds to breathe.' };
    this.cooldowns.set(key, now);
    this.activeTeams.add(team);
    const pixels = [];
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const px = x + dx, py = y + dy;
      if (px < 1 || px > WIDTH || py < 1 || py > HEIGHT) continue;
      this.grid[py - 1][px - 1] = team;
      pixels.push({ x: px, y: py, team, user: name });
    }
    this.placements++;
    this.lastPainters.unshift(name);
    this.lastPainters = this.lastPainters.slice(0, 5);
    return { ok: true, pixels, stats: this.stats() };
  }

  advance(random) {
    const result = step(this.grid, random);
    this.grid = result.grid;
    this.generation++;
    result.generation = this.generation;
    result.latest = [...this.lastPainters];
    result.winner = null;
    if (this.generation >= 100 && this.activeTeams.size > 0) {
      result.winner = result.territory.fire === result.territory.ice ? 'DRAW' : result.territory.fire > result.territory.ice ? 'FIRE WINS' : 'ICE WINS';
    } else if (this.activeTeams.has('fire') && this.activeTeams.has('ice')) {
      if (result.territory.fire === 0 && result.territory.ice === 0) result.winner = 'DRAW';
      else if (result.territory.fire === 0) result.winner = 'ICE WINS';
      else if (result.territory.ice === 0) result.winner = 'FIRE WINS';
    }
    result.type = 'generation';
    return result;
  }

  stats() { return { generation: this.generation, territory: territory(this.grid), placements: this.placements, latest: [...this.lastPainters] }; }
  snapshot() {
    const cells = [];
    for (let y = 0; y < HEIGHT; y++) for (let x = 0; x < WIDTH; x++) if (this.grid[y][x]) cells.push({ x: x + 1, y: y + 1, team: this.grid[y][x] });
    return { type: 'snapshot', cells, stats: this.stats() };
  }
}

module.exports = { Canvas };

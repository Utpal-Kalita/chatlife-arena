const fs = require('fs');
const path = require('path');
const { Canvas } = require('./canvas');
const { startServer } = require('./server');

if (fs.existsSync(path.join(__dirname, '.env'))) {
  for (const line of fs.readFileSync(path.join(__dirname, '.env'), 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][\w]*)\s*=\s*(.*?)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
  }
}

const canvas = new Canvas();
let round = null, announceRound = () => {};
const { broadcast } = startServer(canvas, Number(process.env.PORT) || 3000, () => round);
const publish = update => broadcast({ ...update, round });

if (process.env.SIMULATE_CHAT !== '1') {
  const readOnly = process.env.READ_ONLY === '1';
  const required = readOnly ? ['TWITCH_CHANNEL'] : ['TWITCH_USERNAME', 'TWITCH_OAUTH', 'TWITCH_CHANNEL'];
  const missing = required.filter(key => !process.env[key]);
  if (missing.length) {
    console.error(`Missing ${missing.join(', ')}. Copy .env.example to .env and add your Twitch bot credentials, use READ_ONLY=1 for anonymous read-only chat, or use SIMULATE_CHAT=1 for local development.`);
    process.exit(1);
  }
  const botConfig = readOnly
    ? { username: `justinfan${Math.floor(10000 + Math.random() * 89999)}`, oauth: 'oauth:anonymous', channel: process.env.TWITCH_CHANNEL, readOnly: true }
    : { username: process.env.TWITCH_USERNAME, oauth: process.env.TWITCH_OAUTH, channel: process.env.TWITCH_CHANNEL, readOnly: false };
  if (readOnly) console.log('READ-ONLY MODE: reading chat anonymously; bot replies disabled.');
  require('./bot').startBot(botConfig, canvas, publish, fn => { announceRound = fn; });
} else {
  console.log('LOCAL DEV MODE: simulated teams are joining and painting; Twitch is not connected.');
  const players = [['pixelpioneer', 'fire'], ['streamsprite', 'ice'], ['chatwizard', 'fire'], ['neonotter', 'ice']];
  players.forEach(([name, team]) => canvas.join(name, team));
  let turn = 0;
  setInterval(() => {
    if (round) return;
    const [name] = players[turn++ % players.length];
    const team = canvas.teams.get(name);
    const result = canvas.place(name, team === 'ice' ? 35 + Math.floor(Math.random() * 10) : 3 + Math.floor(Math.random() * 10), 3 + Math.floor(Math.random() * 21));
    if (result.ok) publish({ type: 'paint', pixels: result.pixels, stats: result.stats });
  }, 850);
}

setInterval(() => {
  if (round) return;
  const result = canvas.advance();
  if (result.winner) {
    round = { banner: result.winner, territory: result.territory, until: Date.now() + 10000 };
    announceRound(result);
    publish({ ...result, type: 'round' });
    setTimeout(() => {
      canvas.reset();
      round = null;
      broadcast({ ...canvas.snapshot(), round: null });
    }, 10000);
  } else publish({ ...result, round });
}, 5000);

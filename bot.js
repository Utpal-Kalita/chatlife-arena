const tmi = require('tmi.js');

function startBot(config, canvas, onUpdate, onRound) {
  const client = new tmi.Client({ options: { debug: false }, identity: { username: config.username, password: config.oauth }, channels: [config.channel] });
  const say = (target, msg) => { if (config.readOnly) return; client.say(target, msg).catch(err => console.error('chat reply failed:', err.message)); };
  let confirmations = 0;
  client.connect().catch(err => console.error('Twitch connection failed:', err.message));
  client.on('message', (channel, tags, message, self) => {
    if (self || tags.username?.toLowerCase() === config.username.toLowerCase()) return;
    console.log('CHAT', tags['display-name'] || tags.username, ':', message);
    const user = tags['display-name'] || tags.username || 'anonymous';
    const [command, ...args] = message.trim().split(/\s+/);
    switch (command.toLowerCase()) {
      case '!join': {
        const result = canvas.join(user, args[0]); console.log('JOIN result', JSON.stringify(result));
        say(channel, result.ok ? `${user} joined TEAM ${result.team.toUpperCase()}!` : result.error);
        break;
      }
      case '!paint': {
        const result = canvas.place(user, args[0], args[1]); console.log('PAINT result ok=', result.ok, result.error || '');
        if (result.ok) {
          onUpdate({ type: 'paint', pixels: result.pixels, stats: result.stats });
          if (++confirmations % 12 === 0) say(channel, `Team ${canvas.teams.get(user.toLowerCase()).toUpperCase()} placed a blob!`);
        } else say(channel, result.error);
        break;
      }
      case '!score': {
        const { generation, territory: t } = canvas.stats();
        say(channel, `Gen ${generation} · FIRE ${t.fire} (${t.firePct}%) vs ICE ${t.ice} (${t.icePct}%).`);
        break;
      }
    }
  });
  onRound( result => say(config.channel, `${result.winner}! Final territory — FIRE ${result.territory.firePct}% / ICE ${result.territory.icePct}%.`) );
  return client;
}

module.exports = { startBot };

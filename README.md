# ChatLife Arena

Twitch chat joins FIRE or ICE and evolves its shared pixel art into a live Conway's Game of Life arena.

## For streamers

Add `http://localhost:3000/overlay` as an OBS browser source. Chatters use `!join fire` or `!join ice`, then `!paint <x> <y>` (coordinates 1–48 and 1–27) to place a clipped 3×3 blob of live team cells. `!score` reports the current generation and territory split. Chatters may switch teams at any time; their selected team remains in memory for the process lifetime.

Every five seconds the board advances one standard Life generation. Cells survive with two or three live neighbors; empty cells are born with exactly three. A surviving or newborn cell takes the majority team among its live neighbors, with random ties. A round can only be won once both teams have living cells on the board. After that, a round ends when one team's cells are wiped out, or after 100 generations when the team holding more territory wins (ties are a draw). An empty board never ends a round. The bot announces the result and final territory once, holds the board for ten seconds, then starts a fresh round.

ChatLife Arena is a Codex x TwitchCon Hackathon project. The core game engine, team-based Life rules, Twitch bot, overlay and test suite were developed with OpenAI Codex in a single Codex CLI session, with manual integration fixes for the live Twitch hookup.

## Setup

1. Install Node.js LTS.
2. Create a Twitch bot account and get an OAuth chat token.
3. Copy `.env.example` to `.env` and set `TWITCH_USERNAME`, `TWITCH_OAUTH` (including the `oauth:` prefix), and `TWITCH_CHANNEL` (without `#`).
4. Run `npm install`, then `npm start`.
5. Open `http://localhost:3000/overlay`, or add it to OBS as a browser source. Keep the process running during the stream.

For local preview without Twitch credentials, run `SIMULATE_CHAT=1 npm start` (PowerShell: `$env:SIMULATE_CHAT="1"; npm start`). This local development mode simulates FIRE and ICE chatters joining and painting. `GET /status` returns current board and round state as JSON.

For a read-only live preview against a real channel without any credentials, run `READ_ONLY=1 TWITCH_CHANNEL=your_channel npm start`: the bot connects anonymously (Twitch justinfan), reads chat and drives the overlay, but cannot post replies such as join confirmations or `!score` answers.

## Limitations

Teams, canvas cells, scores, and round state live in memory and reset when the process restarts; there is no database. The bot reads one configured channel at a time. Twitch chat is the live mode; the simulator is only for local development.

# ChatLife Arena

Twitch chat joins FIRE or ICE and evolves its shared pixel art into a live Conway's Game of Life arena.

## For streamers

Add `http://localhost:3000/overlay` as an OBS browser source. Chatters use `!join fire` or `!join ice`, then `!paint <x> <y>` (coordinates 1–48 and 1–27) to place a clipped 3×3 blob of live team cells. `!score` reports the current generation and territory split. Chatters may switch teams at any time; their selected team remains in memory for the process lifetime.

Every five seconds the board advances one standard Life generation. Cells survive with two or three live neighbors; empty cells are born with exactly three. A surviving or newborn cell takes the majority team among its live neighbors, with random ties. A round ends when a team is wiped out or after 100 generations. The bot announces the result and final territory once, holds the board for ten seconds, then starts a fresh round.

ChatLife Arena is a Codex x TwitchCon Hackathon project, built with OpenAI Codex.

## Setup

1. Install Node.js LTS.
2. Create a Twitch bot account and get an OAuth chat token.
3. Copy `.env.example` to `.env` and set `TWITCH_USERNAME`, `TWITCH_OAUTH` (including the `oauth:` prefix), and `TWITCH_CHANNEL` (without `#`).
4. Run `npm install`, then `npm start`.
5. Open `http://localhost:3000/overlay`, or add it to OBS as a browser source. Keep the process running during the stream.

For local preview without Twitch credentials, run `SIMULATE_CHAT=1 npm start` (PowerShell: `$env:SIMULATE_CHAT="1"; npm start`). This local development mode simulates FIRE and ICE chatters joining and painting. `GET /status` returns current board and round state as JSON.

## Limitations

Teams, canvas cells, scores, and round state live in memory and reset when the process restarts; there is no database. The bot reads one configured channel at a time. Twitch chat is the live mode; the simulator is only for local development.

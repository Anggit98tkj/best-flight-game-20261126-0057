# Valley Wing: Sky Courier

[![make.fun bounty](https://make.fun/bounty/best-flight-game-20261126-0057/badge.svg)](https://make.fun/bounty/best-flight-game-20261126-0057)
[![make.fun entry](https://make.fun/bounty/best-flight-game-20261126-0057/entry.svg)](https://make.fun/bounty/best-flight-game-20261126-0057)
[![make.fun judged](https://make.fun/bounty/best-flight-game-20261126-0057/judged.svg)](https://make.fun/bounty/best-flight-game-20261126-0057)

Bounty: [Make the best flight game](https://make.fun/bounty/best-flight-game-20261126-0057)

## The game

Valley Wing is an original flight game built with plain Canvas 2D and no external library. You fly a small red courier plane in chase view over Green Valley: a river valley with fields, trees, hills and snow capped mountains, a sunlit sky, and Runway 09 waiting at the far end.

Flying rewards discipline. Throttle sets your speed, banking turns you, and pitch trades speed for height. Fly too slow and you stall. Fly too hard and you burn fuel you will need for the landing. Three missions give different goals: Ring Run is the balanced course, Canyon Delivery gives tight fuel and low rings, and Storm Landing adds crosswind gusts and a careful final approach.

Each sortie: thread the numbered orange sky rings in order for points, with a bonus for a clean centre pass, then land on Runway 09. A good landing needs low speed, a straight heading, a gentle sink rate and the gear down. Hit terrain, run out of fuel, or slam the runway and the sortie ends in a crash report with what went wrong.

## Controls

- Arrow Up / Down: pitch up / down
- Arrow Left / Right (or A / D): bank and turn
- W / S: throttle up / down
- Space: air brake
- G: landing gear up / down
- F: flaps on / off
- P: pause
- M: sound on / off (WebAudio engine hum, ring chimes, landing fanfare, all generated in code)
- R: restart the current mission
- 1 / 2 / 3 on the title screen, or click a mission card with the mouse

The HUD shows altitude in feet, airspeed in knots and heading on the top bar, plus a compass strip, altimeter, airspeed and heading dials, an artificial horizon, fuel and hull gauges, a throttle bar, gear and flaps state, vertical speed, the next ring distance and the score.

## Run it

Serve the game folder with any static server and open `game/index.html` in a desktop browser. No build step, no network, no files outside `game/`.

```sh
cd game
python3 -m http.server 8080
```

Then open http://localhost:8080

## Screenshots

`?shot=start` shows the title screen, `?shot=fly` a mid course flight, `?shot=rings` a close ring pass, and `?shot=land` the final approach to Runway 09. The screenshots in `screenshots/` were taken from those real renders in headless Chrome, each one viewed after capture to confirm it shows the game.

## Files

- `game/index.html` and `game/src/` split by one clear job each: config, input, audio, world, aircraft, HUD, render, missions, main
- `main.ts` hands the game in: it copies `game/` and `screenshots/` to `$MAKEFUN_OUTPUT_DIR` and writes `dossier.json`
- `vendor/makefun-game.ts` is the kit copy, unchanged

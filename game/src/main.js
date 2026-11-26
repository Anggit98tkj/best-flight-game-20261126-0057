// Main: game loop, screens, shot presets and wiring for Valley Wing.
import { GAME_NAME, GAME_TAGLINE, MISSIONS, PALETTE, TUNING } from './config.js';
import { createInput, pointInRect } from './input.js';
import { createAudio } from './audio.js';
import { createWorld, terrainHeight } from './world.js';
import { createAircraft, updateAircraft } from './aircraft.js';
import { drawHUD, drawCentreMessage } from './hud.js';
import { drawScene, drawPlane } from './render.js';
import { createMissionState, updateMission, setMessage } from './missions.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;
const input = createInput(canvas);
const audio = createAudio();

const params = new URLSearchParams(location.search);
const shot = params.get('shot') || '';

let missionIndex = 0;
let mission = MISSIONS[missionIndex];
let world = createWorld(mission);
let plane = createAircraft(mission);
let game = createMissionState(mission, world);
game.plane = plane;
game.phase = 'title';
game.score = 0;
game.landingPrompted = false;

function startMission(index) {
  missionIndex = index;
  mission = MISSIONS[index];
  world = createWorld(mission);
  plane = createAircraft(mission);
  game = createMissionState(mission, world);
  game.plane = plane;
  game.phase = 'fly';
  game.score = 0;
  game.landingPrompted = false;
  game.startTime = performance.now();
  audio.ensure();
  setMessage(game, mission.name + ': ' + mission.blurb, 4);
}

function applyShotPreset() {
  if (!shot) return;
  if (shot === 'start') {
    game.phase = 'title';
    plane.y = 300;
    plane.z = 600;
    plane.speed = 130;
    return;
  }
  if (shot === 'fly') {
    startMission(0);
    plane.x = -20;
    plane.y = 300;
    plane.z = 620;
    plane.speed = 140;
    plane.throttle = 0.7;
    return;
  }
  if (shot === 'rings') {
    startMission(0);
    world.rings[0].passed = true;
    plane.x = 112;
    plane.y = 310;
    plane.z = 1480;
    plane.speed = 150;
    plane.throttle = 0.72;
    game.score = 160;
    return;
  }
  if (shot === 'land') {
    startMission(0);
    world.rings.forEach((r) => { r.passed = true; });
    plane.x = 8;
    plane.y = 95;
    plane.z = 4520;
    plane.speed = 88;
    plane.throttle = 0.42;
    plane.gearDown = true;
    plane.flaps = true;
    game.score = 640;
    game.landingPrompted = true;
    setMessage(game, 'FINAL APPROACH: Runway 09 ahead, gear down, hold 80 kt', 5);
  }
}

function drawTitle(t) {
  drawScene(ctx, W, H, game, t);
  drawPlane(ctx, W, H, plane, t);
  ctx.save();
  ctx.fillStyle = 'rgba(6, 16, 30, 0.55)';
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd23e';
  ctx.font = 'bold 64px monospace';
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 12;
  ctx.fillText(GAME_NAME.toUpperCase(), W / 2, 150);
  ctx.fillStyle = PALETTE.text;
  ctx.font = 'bold 20px monospace';
  ctx.fillText(GAME_TAGLINE, W / 2, 186);
  ctx.font = '15px monospace';
  ctx.fillText('A complete flight game: rings, fuel, damage, landings. No network, no files but this page.', W / 2, 214);
  MISSIONS.forEach((m, i) => {
    const y = 258 + i * 62;
    const hover = pointInRect(input.mouseX, input.mouseY, W / 2 - 320, y - 24, 640, 48);
    ctx.fillStyle = hover ? 'rgba(79, 216, 255, 0.35)' : 'rgba(10, 22, 38, 0.85)';
    ctx.fillRect(W / 2 - 320, y - 24, 640, 48);
    ctx.strokeStyle = PALETTE.panelEdge;
    ctx.lineWidth = 2;
    ctx.strokeRect(W / 2 - 320, y - 24, 640, 48);
    ctx.fillStyle = PALETTE.text;
    ctx.font = 'bold 17px monospace';
    ctx.fillText(m.name, W / 2, y - 2);
    ctx.fillStyle = '#9fc6e8';
    ctx.font = '12px monospace';
    ctx.fillText(m.blurb, W / 2, y + 16);
  });
  ctx.fillStyle = PALETTE.text;
  ctx.font = '14px monospace';
  ctx.fillText('Arrows fly the plane  |  W / S throttle  |  Space brake  |  G gear  |  F flaps  |  P pause  |  M sound', W / 2, 470);
  ctx.fillText('Click a mission above, or press 1, 2 or 3 to fly. Throttle and turn discipline win sorties.', W / 2, 494);
  ctx.fillText('ALT, SPD and HDG are live on the HUD in every flight.', W / 2, 518);
  ctx.restore();
  drawHUD(ctx, W, H, game);
}

function drawEnd() {
  drawScene(ctx, W, H, game, performance.now());
  ctx.save();
  ctx.fillStyle = 'rgba(6, 16, 30, 0.62)';
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
  if (game.result) drawCentreMessage(ctx, W, H, [game.result.title, ...game.result.lines], game.phase === 'landed' ? '#7dffa8' : '#ff5d5d');
  drawHUD(ctx, W, H, game);
}

let last = performance.now();
let paused = false;

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  const click = input.poll();
  if (input.pressed('m')) { audio.toggle(); }
  if (input.pressed('p') && game.phase === 'fly') paused = !paused;
  if (input.pressed('r')) { startMission(missionIndex); }
  if (input.pressed('g') && game.phase === 'fly') { plane.gearDown = !plane.gearDown; setMessage(game, plane.gearDown ? 'GEAR DOWN' : 'GEAR UP', 1.5); }
  if (input.pressed('f') && game.phase === 'fly') { plane.flaps = !plane.flaps; setMessage(game, plane.flaps ? 'FLAPS DOWN: slower, steadier' : 'FLAPS UP', 1.5); }
  if (game.phase === 'title') {
    if (input.pressed('1')) startMission(0);
    if (input.pressed('2')) startMission(1);
    if (input.pressed('3')) startMission(2);
    if (click) {
      MISSIONS.forEach((m, i) => {
        const y = 258 + i * 62;
        if (pointInRect(click.x, click.y, W / 2 - 320, y - 24, 640, 48)) startMission(i);
      });
    }
    plane.z += 18 * dt;
    plane.heading = Math.sin(now / 9000) * 0.12;
    drawTitle(now);
    requestAnimationFrame(frame);
    return;
  }
  if (game.phase === 'landed' || game.phase === 'crashed') {
    if (click && pointInRect(click.x, click.y, W / 2 - 120, H - 90, 240, 40)) startMission(missionIndex);
    drawEnd();
    requestAnimationFrame(frame);
    return;
  }
  if (!paused) {
    const outcome = updateAircraft(plane, input, mission, dt, world);
    if (outcome.hitGround) {
      game.phase = 'crashed';
      game.result = { title: 'CRASHED INTO THE VALLEY', lines: ['Terrain height ' + Math.round(outcome.ground) + ' ft, you were at ' + Math.round(plane.y) + ' ft.', 'Watch the altimeter and climb before the hills.', 'Score ' + game.score, 'Press R to try again.'] };
      audio.crashThud();
    }
    updateMission(game, plane, dt, audio);
    audio.setEngine(plane.throttle, plane.speed);
    if (plane.fuel <= 0) setMessage(game, 'FUEL EMPTY: engine at idle, find the runway', 2);
  }
  drawScene(ctx, W, H, game, now);
  drawHUD(ctx, W, H, game);
  if (game.message && now < game.messageUntil) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = 'bold 14px monospace';
    ctx.fillStyle = 'rgba(10, 22, 38, 0.92)';
    const tw = Math.min(W - 40, ctx.measureText(game.message).width + 32);
    ctx.fillRect(W / 2 - tw / 2, 118, tw, 30);
    ctx.strokeStyle = PALETTE.panelEdge;
    ctx.strokeRect(W / 2 - tw / 2, 118, tw, 30);
    ctx.fillStyle = '#ffd23e';
    ctx.fillText(game.message, W / 2, 138);
    ctx.restore();
  }
  if (paused) drawCentreMessage(ctx, W, H, ['PAUSED', 'Press P to keep flying'], '#4fd8ff');
  requestAnimationFrame(frame);
}

applyShotPreset();
requestAnimationFrame(frame);

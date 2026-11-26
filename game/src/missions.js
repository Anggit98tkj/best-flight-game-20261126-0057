// Missions: ring progress, scoring, landing verdicts and end of sortie text.
import { TUNING } from './config.js';
import { distanceToRing, ringCentreScore } from './world.js';
import { checkLanding, landingHints } from './aircraft.js';

export function createMissionState(mission, world) {
  return {
    mission,
    world,
    phase: 'title',
    score: 0,
    bestScore: 0,
    message: '',
    messageUntil: 0,
    result: null,
    startTime: 0,
    elapsed: 0,
  };
}

export function setMessage(game, text, seconds) {
  game.message = text;
  game.messageUntil = performance.now() + (seconds || 3) * 1000;
}

export function updateMission(game, plane, dt, audio) {
  if (game.phase !== 'fly') return;
  game.elapsed += dt;
  const next = game.world.nextRing();
  if (next) {
    const d = distanceToRing(plane, next);
    if (d < next.radius) {
      next.passed = true;
      const centre = ringCentreScore(plane, next);
      const pts = TUNING.ringScore + Math.round(centre * TUNING.centreBonusMax);
      game.score += pts;
      setMessage(game, 'RING ' + (next.index + 1) + ' CLEAR: +' + pts + (centre > 0.7 ? ' PERFECT CENTRE' : ''), 2.5);
      if (audio) audio.ringChime();
    } else if (plane.z > next.z + 30) {
      next.passed = true;
      plane.damage = Math.min(100, plane.damage + 8);
      setMessage(game, 'RING ' + (next.index + 1) + ' MISSED: hull -8%', 2.5);
      if (audio) audio.beep(220, 0.3, 'square', 0.12);
    }
  }
  if (!game.world.nextRing() && game.phase === 'fly') {
    if (!game.landingPrompted) {
      game.landingPrompted = true;
      setMessage(game, 'ALL RINGS DONE: fly to Runway 09 and land, gear down, slow and straight', 5);
    }
    const landing = checkLanding(plane, game.world);
    if (landing === 'landed') {
      const timeBonus = Math.max(0, 600 - Math.round(game.elapsed) * 2);
      const fuelBonus = Math.round(plane.fuel * 3);
      game.score += timeBonus + fuelBonus;
      game.phase = 'landed';
      game.result = { title: 'LANDED: SORTIE COMPLETE', lines: ['Score ' + game.score + ' (time +' + timeBonus + ', fuel +' + fuelBonus + ')', 'A clean landing on Runway 09. The valley courier delivers again.', 'Press R to fly again, or click a mission on the title screen.'] };
      if (audio) audio.landChime();
    } else if (landing === 'gear') {
      setMessage(game, 'TOUCHDOWN WITH GEAR UP: press G and go around', 2);
    } else if (landing === 'crash') {
      game.phase = 'crashed';
      game.result = { title: 'CRASHED ON THE RUNWAY', lines: landingHints(plane).concat(['Score ' + game.score, 'Press R to try again.']) };
      if (audio) audio.crashThud();
    }
  }
  if (plane.fuel <= 0 && plane.y < 30) {
    game.phase = 'crashed';
    game.result = { title: 'OUT OF FUEL', lines: ['The engine quit over the valley. Glide practice next time.', 'Score ' + game.score, 'Press R to try again.'] };
    if (audio) audio.crashThud();
  }
}

export function endReason(game) {
  return game.result;
}

export function scoreSummary(game) {
  return 'Score ' + game.score + ', rings ' + (game.world.rings.length - game.world.ringsLeft()) + '/' + game.world.rings.length;
}

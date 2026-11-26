// Aircraft: the courier plane, its flight model, fuel and damage.
import { TUNING } from './config.js';
import { terrainHeight } from './world.js';

export function createAircraft(mission) {
  return {
    x: 0,
    y: 240,
    z: 0,
    heading: 0,
    pitch: 0,
    bank: 0,
    speed: 120,
    throttle: 0.62,
    fuel: mission.fuel,
    damage: 0,
    gearDown: false,
    flaps: false,
    verticalSpeed: 0,
    grounded: false,
    stall: false,
    windPush: 0,
  };
}

export function updateAircraft(plane, input, mission, dt, world) {
  const wind = mission.wind || 0;
  if (input.throttleUp) plane.throttle = Math.min(1, plane.throttle + dt * 0.45);
  if (input.throttleDown) plane.throttle = Math.max(0, plane.throttle - dt * 0.45);
  if (input.brake) plane.speed = Math.max(40, plane.speed - dt * 55);

  const targetSpeed = 30 + plane.throttle * (TUNING.maxSpeed - 30);
  plane.speed += (targetSpeed - plane.speed) * Math.min(1, dt * 0.55);
  if (plane.flaps) plane.speed = Math.max(48, plane.speed - dt * 8);

  const targetBank = input.turn * TUNING.bankMax;
  plane.bank += (targetBank - plane.bank) * Math.min(1, dt * 4.5);
  plane.heading += -plane.bank * TUNING.turnRate * dt * (0.55 + plane.speed / TUNING.maxSpeed);
  const targetPitch = input.pitch * 0.32;
  plane.pitch += (targetPitch - plane.pitch) * Math.min(1, dt * 3.2);

  const climb = Math.sin(plane.pitch) * (plane.speed > TUNING.minFlySpeed ? TUNING.climbRate : TUNING.climbRate * 0.4);
  plane.verticalSpeed = climb - (plane.speed < TUNING.minFlySpeed ? 18 : 0);
  plane.y += plane.verticalSpeed * dt * 2.2;
  plane.y = Math.max(2, Math.min(900, plane.y));

  const forward = plane.speed * dt;
  plane.z += Math.cos(plane.heading) * forward;
  plane.x += Math.sin(plane.heading) * forward;
  plane.windPush = Math.sin(performance.now() / 1400) * wind * 26;
  plane.x += plane.windPush * dt;

  plane.stall = plane.speed < TUNING.minFlySpeed && plane.y > 40;
  if (plane.stall) plane.y -= 14 * dt;

  const burn = (TUNING.fuelBurnBase + plane.throttle * TUNING.fuelBurnThrottle) * dt;
  plane.fuel = Math.max(0, plane.fuel - burn);
  if (plane.fuel <= 0 && plane.throttle > 0.25) plane.throttle = 0.25;

  const ground = terrainHeight(plane.x, plane.z);
  let hitGround = false;
  if (plane.y <= ground + 3) {
    hitGround = true;
    plane.y = ground + 3;
  }
  return { hitGround, ground };
}

export function checkLanding(plane, world) {
  const rw = world.runway;
  const dz = plane.z - rw.z;
  const onStrip = Math.abs(dz) < rw.length / 2 && Math.abs(plane.x - rw.x) < rw.width / 2 + 6;
  const low = plane.y < 26;
  const slow = plane.speed <= TUNING.landingSpeedMax;
  const aligned = Math.abs(plane.heading) < TUNING.landingAlignMax;
  const gentle = plane.verticalSpeed > -TUNING.landingSinkMax;
  if (onStrip && low) {
    if (slow && aligned && gentle && plane.gearDown) return 'landed';
    if (slow && aligned && gentle && !plane.gearDown) return 'gear';
    return 'crash';
  }
  return null;
}

export function landingHints(plane) {
  const hints = [];
  if (plane.speed > TUNING.landingSpeedMax) hints.push('TOO FAST: cut throttle, use Space brake');
  if (Math.abs(plane.heading) > TUNING.landingAlignMax) hints.push('LINE UP: turn to heading 000');
  if (!plane.gearDown) hints.push('LOWER GEAR: press G');
  if (plane.y > 60) hints.push('DESCEND: pitch down gently');
  return hints;
}

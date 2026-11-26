// World: deterministic valley terrain, river, runway and sky rings.
import { TUNING } from './config.js';

export function terrainHeight(x, z) {
  const hill = Math.sin(x * 0.004 + 1.2) * 26 + Math.cos(z * 0.0031) * 30 + Math.sin((x + z) * 0.0016) * 22;
  const valley = Math.max(0, 60 - Math.abs(x) * 0.35);
  let h = 18 + hill * 0.55 - valley * 0.4;
  const dz = z - TUNING.runwayZ;
  const nearRunway = Math.exp(-(dz * dz) / (2 * 420 * 420)) * Math.exp(-(x * x) / (2 * 260 * 260));
  h = h * (1 - nearRunway) + 0 * nearRunway;
  if (z < 200) h = h * (z / 200);
  return Math.max(0, h);
}

export function riverX(z) {
  return -260 + Math.sin(z * 0.0011) * 190 + Math.sin(z * 0.00037) * 90;
}

export function createWorld(mission) {
  const rings = mission.rings.map((r, i) => ({
    x: r.x, y: r.y, z: r.z, index: i, passed: false, radius: TUNING.ringRadius,
  }));
  const trees = [];
  for (let i = 0; i < 260; i++) {
    const z = (i * 137.5) % 5600;
    const side = i % 2 === 0 ? -1 : 1;
    const x = side * (180 + ((i * 53) % 420));
    trees.push({ x, z, s: 0.7 + ((i * 37) % 10) / 14, kind: i % 5 });
  }
  const fields = [];
  for (let i = 0; i < 42; i++) {
    fields.push({ x: -520 + ((i * 173) % 1040), z: (i * 251) % 5400, w: 120 + ((i * 61) % 160), d: 180 + ((i * 43) % 220), c: i % 3 });
  }
  const clouds = [];
  for (let i = 0; i < 14; i++) {
    clouds.push({ x: -900 + ((i * 311) % 1800), y: 520 + ((i * 97) % 260), z: (i * 613) % 5200, s: 60 + ((i * 47) % 90) });
  }
  return {
    rings,
    trees,
    fields,
    clouds,
    runway: { x: 0, z: TUNING.runwayZ, length: TUNING.runwayLength, width: TUNING.runwayWidth },
    nextRing() { return rings.find((r) => !r.passed) || null; },
    ringsLeft() { return rings.filter((r) => !r.passed).length; },
    reset() { rings.forEach((r) => { r.passed = false; }); },
  };
}

export function distanceToRing(plane, ring) {
  const dx = plane.x - ring.x;
  const dy = plane.y - ring.y;
  const dz = plane.z - ring.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function ringCentreScore(plane, ring) {
  const dx = plane.x - ring.x;
  const dy = plane.y - ring.y;
  const off = Math.sqrt(dx * dx + dy * dy);
  return Math.max(0, 1 - off / ring.radius);
}

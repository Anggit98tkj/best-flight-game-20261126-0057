// Render: sky, valley terrain, river, runway, rings and the courier plane.
// Every picture in the game is drawn here in code, with no image files.
import { PALETTE } from './config.js';
import { terrainHeight, riverX } from './world.js';

export function project(plane, px, py, pz, W, H) {
  const dx = px - plane.x;
  const dy = py - plane.y;
  const dz = pz - plane.z;
  const cos = Math.cos(-plane.heading);
  const sin = Math.sin(-plane.heading);
  const fwd = dx * sin + dz * cos;
  const lat = dx * cos - dz * sin;
  if (fwd < 8) return null;
  const scale = H * 0.9;
  const horizonY = H * 0.42 - plane.pitch * 260 - (plane.y - 240) * 0.08;
  return {
    x: W / 2 + (lat / fwd) * scale,
    y: horizonY - (dy / fwd) * scale,
    s: scale / fwd,
    fwd,
  };
}

function drawSky(ctx, W, H, t) {
  const g = ctx.createLinearGradient(0, 0, 0, H * 0.55);
  g.addColorStop(0, PALETTE.skyTop);
  g.addColorStop(0.6, PALETTE.skyMid);
  g.addColorStop(1, PALETTE.skyLow);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H * 0.55);
  ctx.fillStyle = PALETTE.sun;
  ctx.beginPath();
  ctx.arc(W * 0.78, H * 0.12, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 233, 168, 0.35)';
  ctx.beginPath();
  ctx.arc(W * 0.78, H * 0.12, 52, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  for (let i = 0; i < 6; i++) {
    const cx = ((i * 211 + t * 6) % (W + 200)) - 100;
    const cy = 40 + (i % 3) * 42;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 62, 16, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 34, cy + 6, 44, 13, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawMountains(ctx, W, H, plane) {
  const horizonY = H * 0.42 - plane.pitch * 260 - (plane.y - 240) * 0.08;
  ctx.fillStyle = PALETTE.mountainFar;
  ctx.beginPath();
  ctx.moveTo(0, horizonY);
  for (let x = 0; x <= W; x += 40) {
    const h = 60 + Math.sin(x * 0.008 + plane.heading * 4) * 34 + Math.sin(x * 0.021) * 18;
    ctx.lineTo(x, horizonY - h);
  }
  ctx.lineTo(W, horizonY);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  for (let x = 60; x < W; x += 160) {
    const h = 60 + Math.sin(x * 0.008 + plane.heading * 4) * 34 + Math.sin(x * 0.021) * 18;
    ctx.beginPath();
    ctx.moveTo(x - 18, horizonY - h + 14);
    ctx.lineTo(x, horizonY - h);
    ctx.lineTo(x + 18, horizonY - h + 14);
    ctx.closePath();
    ctx.fill();
  }
}

function drawGround(ctx, W, H, plane, world, t) {
  const horizonY = H * 0.42 - plane.pitch * 260 - (plane.y - 240) * 0.08;
  const g = ctx.createLinearGradient(0, horizonY, 0, H);
  g.addColorStop(0, PALETTE.hill);
  g.addColorStop(1, '#3f7a34');
  ctx.fillStyle = g;
  ctx.fillRect(0, horizonY, W, H - horizonY);
  ctx.fillStyle = PALETTE.fieldB;
  for (let i = 0; i < 14; i++) {
    const z = plane.z + 200 + i * 320;
    const p = project(plane, -300 + ((i * 173) % 600), terrainHeight(-300, z), z, W, H);
    if (!p) continue;
    ctx.fillRect(p.x, p.y, p.s * 130, p.s * 90);
  }
  ctx.fillStyle = PALETTE.fieldC;
  for (let i = 0; i < 10; i++) {
    const z = plane.z + 420 + i * 430;
    const p = project(plane, 120 + ((i * 251) % 500), terrainHeight(200, z), z, W, H);
    if (!p) continue;
    ctx.fillRect(p.x, p.y, p.s * 110, p.s * 70);
  }
  ctx.strokeStyle = PALETTE.river;
  ctx.lineWidth = 10;
  ctx.beginPath();
  let started = false;
  for (let z = plane.z + 60; z < plane.z + 5200; z += 160) {
    const p = project(plane, riverX(z), terrainHeight(riverX(z), z) + 2, z, W, H);
    if (!p) continue;
    if (!started) { ctx.moveTo(p.x, p.y); started = true; } else ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 9; i++) {
    const z = plane.z + 150 + i * 520;
    const a = project(plane, -600, terrainHeight(-600, z), z, W, H);
    const b = project(plane, 600, terrainHeight(600, z), z, W, H);
    if (a && b) { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
  }
  world.trees.forEach((tree) => {
    if (tree.z < plane.z + 40 || tree.z > plane.z + 4800) return;
    const p = project(plane, tree.x, terrainHeight(tree.x, tree.z) + 14 * tree.s, tree.z, W, H);
    if (!p || p.x < -20 || p.x > W + 20) return;
    const s = Math.max(2, p.s * 16 * tree.s);
    ctx.fillStyle = '#2e6b2e';
    ctx.beginPath();
    ctx.arc(p.x, p.y - s, s * 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#5a3d24';
    ctx.fillRect(p.x - 1, p.y - s * 0.4, 2, s * 0.6);
  });
}

function drawRunway(ctx, W, H, plane, world) {
  const rw = world.runway;
  const near = project(plane, rw.x, 2, rw.z - rw.length / 2, W, H);
  const far = project(plane, rw.x, 2, rw.z + rw.length / 2, W, H);
  if (!near && !far) return;
  const leftNear = project(plane, rw.x - rw.width / 2, 2, rw.z - rw.length / 2, W, H);
  const rightNear = project(plane, rw.x + rw.width / 2, 2, rw.z - rw.length / 2, W, H);
  const leftFar = project(plane, rw.x - rw.width / 2, 2, rw.z + rw.length / 2, W, H);
  const rightFar = project(plane, rw.x + rw.width / 2, 2, rw.z + rw.length / 2, W, H);
  if (!leftNear || !rightNear || !leftFar || !rightFar) return;
  ctx.fillStyle = PALETTE.runway;
  ctx.beginPath();
  ctx.moveTo(leftNear.x, leftNear.y);
  ctx.lineTo(rightNear.x, rightNear.y);
  ctx.lineTo(rightFar.x, rightFar.y);
  ctx.lineTo(leftFar.x, leftFar.y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = PALETTE.runwayMark;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = PALETTE.runwayMark;
  for (let i = 0; i < 6; i++) {
    const z = rw.z - rw.length / 2 + 70 + i * 105;
    const p = project(plane, rw.x, 2, z, W, H);
    if (!p) continue;
    ctx.fillRect(p.x - Math.max(1, p.s * 1.2), p.y - Math.max(1, p.s * 3), Math.max(2, p.s * 2.4), Math.max(3, p.s * 6));
  }
  const label = project(plane, rw.x, 4, rw.z + rw.length / 2 + 40, W, H);
  if (label) {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold ' + Math.max(12, Math.round(label.s * 14)) + 'px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('RUNWAY 09', label.x, label.y);
  }
  const tower = project(plane, rw.x + 90, 60, rw.z + 120, W, H);
  if (tower) {
    ctx.fillStyle = '#dfe8f2';
    ctx.fillRect(tower.x - tower.s * 4, tower.y - tower.s * 30, tower.s * 8, tower.s * 30);
    ctx.fillStyle = '#2f6fb4';
    ctx.fillRect(tower.x - tower.s * 6, tower.y - tower.s * 38, tower.s * 12, tower.s * 9);
  }
  const sock = project(plane, rw.x - 70, 26, rw.z - 200, W, H);
  if (sock) {
    ctx.strokeStyle = '#ff7a1a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(sock.x, sock.y);
    ctx.lineTo(sock.x + sock.s * 14, sock.y - sock.s * 4);
    ctx.stroke();
  }
}

function drawRings(ctx, W, H, plane, world) {
  const sorted = [...world.rings].sort((a, b) => b.z - a.z);
  sorted.forEach((ring) => {
    if (ring.z < plane.z - 20) return;
    const p = project(plane, ring.x, ring.y, ring.z, W, H);
    if (!p) return;
    const r = Math.max(4, p.s * ring.radius);
    if (r < 3 || p.x < -r || p.x > W + r) return;
    ctx.save();
    ctx.globalAlpha = ring.passed ? 0.35 : 1;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, r, r * 0.92, 0, 0, Math.PI * 2);
    ctx.lineWidth = Math.max(3, r * 0.14);
    ctx.strokeStyle = ring.passed ? '#7dffa8' : PALETTE.ring;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, r * 0.82, r * 0.76, 0, 0, Math.PI * 2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = PALETTE.ringGlow;
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold ' + Math.max(12, Math.round(r * 0.5)) + 'px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(String(ring.index + 1), p.x, p.y - r - 8);
    ctx.restore();
  });
}

export function drawPlane(ctx, W, H, plane, t) {
  const cx = W / 2;
  const cy = H * 0.66;
  const scale = 1 + plane.speed / 900;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(plane.bank * 0.55);
  ctx.scale(scale, scale);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(0, 96, 150, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.planeWing;
  ctx.beginPath();
  ctx.moveTo(-150, 6);
  ctx.lineTo(-34, -6);
  ctx.lineTo(-28, 14);
  ctx.lineTo(-150, 26);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(150, 6);
  ctx.lineTo(34, -6);
  ctx.lineTo(28, 14);
  ctx.lineTo(150, 26);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = PALETTE.planeBody;
  ctx.beginPath();
  ctx.moveTo(-16, -58);
  ctx.quadraticCurveTo(0, -72, 16, -58);
  ctx.lineTo(20, 34);
  ctx.quadraticCurveTo(0, 48, -20, 34);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#bfe9ff';
  ctx.beginPath();
  ctx.ellipse(0, -34, 11, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(0, -34, 5, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f6f1e6';
  ctx.fillRect(-14, 38, 28, 8);
  ctx.fillStyle = PALETTE.planeBody;
  ctx.beginPath();
  ctx.moveTo(-12, 46);
  ctx.lineTo(12, 46);
  ctx.lineTo(20, 62);
  ctx.lineTo(-20, 62);
  ctx.closePath();
  ctx.fill();
  const prop = (t / 90) % Math.PI;
  ctx.strokeStyle = 'rgba(20,20,20,0.55)';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-26 * Math.cos(prop), -58 - 26 * Math.sin(prop));
  ctx.lineTo(26 * Math.cos(prop), -58 + 26 * Math.sin(prop));
  ctx.stroke();
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(0, -58, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = plane.gearDown ? '#ffd23e' : '#7dffa8';
  ctx.beginPath();
  ctx.arc(-24, 18, 4, 0, Math.PI * 2);
  ctx.arc(24, 18, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawScene(ctx, W, H, game, t) {
  const plane = game.plane;
  drawSky(ctx, W, H, t);
  drawMountains(ctx, W, H, plane);
  drawGround(ctx, W, H, plane, game.world, t);
  drawRunway(ctx, W, H, plane, game.world);
  drawRings(ctx, W, H, plane, game.world);
  if (game.phase !== 'title') drawPlane(ctx, W, H, plane, t);
}

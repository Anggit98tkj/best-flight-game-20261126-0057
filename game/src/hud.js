// HUD: instruments, gauges, compass and mission panel, all drawn in code.
import { PALETTE } from './config.js';

export function headingText(heading) {
  let deg = Math.round((-heading * 180) / Math.PI) % 360;
  if (deg < 0) deg += 360;
  return String(deg).padStart(3, '0');
}

function roundDial(ctx, cx, cy, r, label, valueText, frac, colour) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(8, 18, 32, 0.92)';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = PALETTE.panelEdge;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r - 5, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2);
  ctx.strokeStyle = colour;
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.fillStyle = PALETTE.text;
  ctx.font = 'bold 15px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(valueText, cx, cy + 2);
  ctx.fillStyle = '#9fc6e8';
  ctx.font = 'bold 10px monospace';
  ctx.fillText(label, cx, cy + r - 9);
  ctx.restore();
}

function barGauge(ctx, x, y, w, h, label, frac, colour, valueText) {
  ctx.save();
  ctx.fillStyle = 'rgba(8, 18, 32, 0.85)';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = colour;
  ctx.fillRect(x + 2, y + 2, Math.max(0, (w - 4) * frac), h - 4);
  ctx.strokeStyle = PALETTE.panelEdge;
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = PALETTE.text;
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(label + ' ' + valueText, x + 6, y + h / 2 + 4);
  ctx.restore();
}

export function drawHUD(ctx, W, H, game) {
  const plane = game.plane;
  const altFt = Math.round(plane.y * 3.28);
  const speedKt = Math.round(plane.speed * 0.62);
  const hdg = headingText(plane.heading);
  ctx.save();
  ctx.fillStyle = PALETTE.panel;
  ctx.fillRect(0, 0, W, 64);
  ctx.strokeStyle = PALETTE.panelEdge;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 64);
  ctx.lineTo(W, 64);
  ctx.stroke();
  ctx.fillStyle = PALETTE.text;
  ctx.textAlign = 'left';
  ctx.font = 'bold 13px monospace';
  ctx.fillText('VALLEY WING', 14, 22);
  ctx.fillStyle = '#9fc6e8';
  ctx.font = '11px monospace';
  ctx.fillText(game.mission.name + '  |  ' + game.mission.blurb.slice(0, 28), 14, 42);
  ctx.textAlign = 'center';
  ctx.fillStyle = PALETTE.hudGreen;
  ctx.font = 'bold 22px monospace';
  ctx.fillText('ALT ' + altFt + ' ft', W * 0.32, 30);
  ctx.fillText('SPD ' + speedKt + ' kt', W * 0.52, 30);
  ctx.fillText('HDG ' + hdg, W * 0.70, 30);
  ctx.fillStyle = '#9fc6e8';
  ctx.font = '11px monospace';
  ctx.fillText('ALTITUDE', W * 0.32, 50);
  ctx.fillText('AIRSPEED', W * 0.52, 50);
  ctx.fillText('HEADING', W * 0.70, 50);
  ctx.textAlign = 'right';
  ctx.fillStyle = PALETTE.hudAmber;
  ctx.font = 'bold 20px monospace';
  ctx.fillText('SCORE ' + game.score, W - 16, 30);
  ctx.fillStyle = '#9fc6e8';
  ctx.font = '11px monospace';
  ctx.fillText('RINGS ' + (game.world.rings.length - game.world.ringsLeft()) + '/' + game.world.rings.length, W - 16, 50);

  const cx = W / 2;
  const cy = 96;
  ctx.fillStyle = 'rgba(8, 18, 32, 0.7)';
  ctx.fillRect(cx - 150, cy - 14, 300, 22);
  ctx.strokeStyle = PALETTE.panelEdge;
  ctx.strokeRect(cx - 150, cy - 14, 300, 22);
  ctx.fillStyle = PALETTE.text;
  ctx.font = 'bold 12px monospace';
  ctx.textAlign = 'center';
  const marks = [-60, -30, 0, 30, 60];
  marks.forEach((m) => {
    let d = (Math.round((-plane.heading * 180) / Math.PI) + m) % 360;
    if (d < 0) d += 360;
    ctx.fillText(String(d).padStart(3, '0'), cx + m * 2.2, cy + 2);
  });
  ctx.fillStyle = PALETTE.ringGlow;
  ctx.beginPath();
  ctx.moveTo(cx - 6, cy - 16);
  ctx.lineTo(cx + 6, cy - 16);
  ctx.lineTo(cx, cy - 6);
  ctx.fill();

  const panelY = H - 118;
  ctx.fillStyle = PALETTE.panel;
  ctx.fillRect(0, panelY, W, 118);
  ctx.strokeStyle = PALETTE.panelEdge;
  ctx.beginPath();
  ctx.moveTo(0, panelY);
  ctx.lineTo(W, panelY);
  ctx.stroke();
  roundDial(ctx, 82, panelY + 58, 46, 'ALT ft', String(altFt), Math.min(1, plane.y / 900), PALETTE.hudGreen);
  roundDial(ctx, 188, panelY + 58, 46, 'SPD kt', String(speedKt), Math.min(1, plane.speed / 210), '#4fd8ff');
  roundDial(ctx, 294, panelY + 58, 46, 'HDG', hdg, (Math.round((-plane.heading * 180) / Math.PI) % 360 + 360) % 360 / 360, PALETTE.hudAmber);
  const horizonX = 400;
  const horizonY = panelY + 58;
  ctx.save();
  ctx.beginPath();
  ctx.arc(horizonX, horizonY, 42, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = '#3f8fd2';
  ctx.fillRect(horizonX - 42, horizonY - 42, 84, 42 - plane.pitch * 60);
  ctx.fillStyle = '#8a6a3f';
  ctx.fillRect(horizonX - 42, horizonY - plane.pitch * 60, 84, 84);
  ctx.restore();
  ctx.strokeStyle = PALETTE.panelEdge;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(horizonX, horizonY, 42, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = PALETTE.text;
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('HORIZON', horizonX, horizonY + 56);

  const gx = 470;
  barGauge(ctx, gx, panelY + 14, 210, 20, 'FUEL', plane.fuel / 100, plane.fuel > 30 ? PALETTE.hudGreen : PALETTE.hudRed, Math.round(plane.fuel) + '%');
  barGauge(ctx, gx, panelY + 42, 210, 20, 'HULL', 1 - plane.damage / 100, plane.damage < 40 ? PALETTE.hudGreen : PALETTE.hudRed, Math.round(100 - plane.damage) + '%');
  barGauge(ctx, gx, panelY + 70, 210, 20, 'THR', plane.throttle, '#4fd8ff', Math.round(plane.throttle * 100) + '%');
  ctx.fillStyle = '#9fc6e8';
  ctx.font = '11px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('GEAR ' + (plane.gearDown ? 'DOWN' : 'UP') + '  FLAPS ' + (plane.flaps ? 'ON' : 'OFF') + '  V/S ' + Math.round(plane.verticalSpeed * 3.28) + ' fpm', gx, panelY + 104);

  const rx = W - 250;
  ctx.fillStyle = PALETTE.text;
  ctx.font = 'bold 13px monospace';
  ctx.textAlign = 'left';
  const next = game.world.nextRing();
  ctx.font = 'bold 12px monospace';
  if (game.phase === 'fly' && next) {
    const dist = Math.round(Math.sqrt((plane.x - next.x) ** 2 + (plane.y - next.y) ** 2 + (plane.z - next.z) ** 2) * 3.28);
    ctx.fillText('NEXT RING ' + (next.index + 1) + ' : ' + dist + ' ft ahead', rx, panelY + 26);
  } else if (game.phase === 'fly') {
    ctx.fillText('ALL RINGS DONE: LAND ON RWY 09', rx, panelY + 26);
  }
  ctx.fillStyle = plane.stall ? PALETTE.hudRed : PALETTE.hudGreen;
  ctx.font = 'bold 13px monospace';
  ctx.fillText(plane.stall ? 'STALL WARNING: lower nose, add throttle' : 'FLYING SMOOTH', rx, panelY + 52);
  if (plane.fuel < 25) {
    ctx.fillStyle = PALETTE.hudRed;
    ctx.fillText('LOW FUEL: land soon', rx, panelY + 78);
  }
  ctx.fillStyle = '#9fc6e8';
  ctx.font = '11px monospace';
  ctx.fillText('Arrows fly, W/S throttle, Space brake', rx, panelY + 104);
  ctx.restore();
}

export function drawCentreMessage(ctx, W, H, lines, colour) {
  ctx.save();
  ctx.textAlign = 'center';
  lines.forEach((line, i) => {
    ctx.font = i === 0 ? 'bold 34px monospace' : '16px monospace';
    ctx.fillStyle = i === 0 ? (colour || PALETTE.text) : PALETTE.text;
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = 8;
    ctx.fillText(line, W / 2, H * 0.30 + i * 34);
  });
  ctx.restore();
}

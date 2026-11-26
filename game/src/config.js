// Valley Wing config: tuning, missions and palette in one place.
export const GAME_NAME = 'Valley Wing';
export const GAME_TAGLINE = 'Sky Courier over Green Valley';
export const VERSION = '1.0.0';

export const TUNING = {
  maxSpeed: 210,
  cruiseSpeed: 130,
  minFlySpeed: 55,
  climbRate: 42,
  descendRate: 55,
  turnRate: 0.55,
  bankMax: 0.9,
  fuelBurnBase: 0.55,
  fuelBurnThrottle: 1.35,
  ringRadius: 46,
  ringScore: 100,
  centreBonusMax: 60,
  damageGround: 100,
  landingSpeedMax: 95,
  landingSinkMax: 14,
  landingAlignMax: 0.16,
  runwayLength: 700,
  runwayWidth: 34,
  runwayZ: 5200,
  startFuel: 100,
};

export const MISSIONS = [
  {
    id: 'ring-run',
    name: '1. Ring Run',
    blurb: 'Fly the valley course. Thread all 5 sky rings, then land on Runway 09.',
    fuel: 100,
    wind: 0.02,
    rings: [
      { x: -40, y: 260, z: 900 },
      { x: 120, y: 320, z: 1700 },
      { x: -90, y: 240, z: 2500 },
      { x: 60, y: 380, z: 3300 },
      { x: 0, y: 300, z: 4100 },
    ],
  },
  {
    id: 'canyon-delivery',
    name: '2. Canyon Delivery',
    blurb: 'Tight fuel, low rings through the canyon. Smooth flying only, no wasted throttle.',
    fuel: 72,
    wind: 0.06,
    rings: [
      { x: 80, y: 170, z: 800 },
      { x: -140, y: 200, z: 1600 },
      { x: 150, y: 150, z: 2400 },
      { x: -60, y: 220, z: 3200 },
      { x: 90, y: 180, z: 4000 },
      { x: 0, y: 260, z: 4600 },
    ],
  },
  {
    id: 'storm-landing',
    name: '3. Storm Landing',
    blurb: 'Crosswind and low cloud. Only 3 rings, then a careful landing in gusty wind.',
    fuel: 88,
    wind: 0.16,
    rings: [
      { x: -70, y: 300, z: 1200 },
      { x: 110, y: 340, z: 2300 },
      { x: 0, y: 280, z: 3400 },
    ],
  },
];

export const PALETTE = {
  skyTop: '#2f6fb4',
  skyMid: '#7fb6e4',
  skyLow: '#cfe8f7',
  sun: '#ffe9a8',
  mountainFar: '#7a9cc4',
  mountainNear: '#4e7a52',
  hill: '#5da24a',
  fieldA: '#7fb84e',
  fieldB: '#a8c95a',
  fieldC: '#d9c25e',
  river: '#3f8fd2',
  road: '#8a7a5c',
  runway: '#3c4148',
  runwayMark: '#f4f6f8',
  ring: '#ff7a1a',
  ringGlow: '#ffd23e',
  planeBody: '#e8442e',
  planeWing: '#f6f1e6',
  panel: '#0a1626',
  panelEdge: '#4fd8ff',
  hudGreen: '#7dffa8',
  hudAmber: '#ffc44d',
  hudRed: '#ff5d5d',
  text: '#f2f7ff',
};

export const CONTROLS_TEXT = [
  'Up / Down arrows: pitch up / down',
  'Left / Right arrows or A / D: bank and turn',
  'W / S: throttle up / down',
  'Space: air brake, G: landing gear, F: flaps, P: pause, M: sound, R: restart',
  'Mouse: click a mission on the title screen to fly it',
];

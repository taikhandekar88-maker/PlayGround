import * as THREE from 'three';

const canvas = document.querySelector('#game');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#16171d');
scene.fog = new THREE.FogExp2('#16171d', 0.028);
const camera = new THREE.PerspectiveCamera(39, 1, 0.1, 100);
camera.position.set(0, 7.3, 16.8);
camera.lookAt(0, 1.35, 0);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

scene.add(new THREE.HemisphereLight(0xb7d2ed, 0x17121c, 1.5));
const keyLight = new THREE.DirectionalLight(0xffe6c6, 3.2);
keyLight.position.set(-5, 10, 7); keyLight.castShadow = true;
keyLight.shadow.mapSize.set(1024, 1024);
keyLight.shadow.camera.left = -10; keyLight.shadow.camera.right = 10; keyLight.shadow.camera.top = 10; keyLight.shadow.camera.bottom = -8;
scene.add(keyLight);
const cyanLight = new THREE.PointLight(0x35ebe4, 12, 14); cyanLight.position.set(-5, 3, 1); scene.add(cyanLight);
const pinkLight = new THREE.PointLight(0xff244f, 14, 14); pinkLight.position.set(5, 3, 1); scene.add(pinkLight);
const backLight = new THREE.PointLight(0xffba70, 18, 19); backLight.position.set(0, 8, -6); scene.add(backLight);

const mat = (color, roughness = .62, metalness = .08) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
const floorMat = mat('#20222a', .86, .15);
const floor = new THREE.Mesh(new THREE.CircleGeometry(12, 64), floorMat);
floor.rotation.x = -Math.PI / 2; floor.position.y = -.14; floor.receiveShadow = true; scene.add(floor);
const platform = new THREE.Mesh(new THREE.CylinderGeometry(7.5, 8, .26, 64), mat('#303038', .48, .55));
platform.position.y = -.08; platform.receiveShadow = true; platform.castShadow = true; scene.add(platform);
const ring = new THREE.Mesh(new THREE.TorusGeometry(7.47, .075, 8, 96), new THREE.MeshBasicMaterial({ color: '#46dcd6' }));
ring.rotation.x = Math.PI / 2; ring.position.y = .07; scene.add(ring);
const outerRing = new THREE.Mesh(new THREE.TorusGeometry(8.35, .045, 8, 96), new THREE.MeshBasicMaterial({ color: '#e94962', transparent: true, opacity: .8 }));
outerRing.rotation.x = Math.PI / 2; outerRing.position.y = -.01; scene.add(outerRing);
// Arena floor markings
for (let i = 0; i < 16; i++) {
  const a = i * Math.PI * 2 / 16;
  const dash = new THREE.Mesh(new THREE.BoxGeometry(.8, .018, .035), new THREE.MeshBasicMaterial({ color: i % 2 ? '#f34f68' : '#52dcd5', transparent: true, opacity: .65 }));
  dash.position.set(Math.sin(a) * 5.2, .07, Math.cos(a) * 5.2); dash.rotation.y = -a; scene.add(dash);
}
const grid = new THREE.GridHelper(80, 48, 0x343741, 0x272932);
grid.position.y = -.16; grid.material.transparent = true; grid.material.opacity = .22; scene.add(grid);

// Neon skyline and arena pylons make the stage feel deep without external assets.
const cityMat = mat('#20212b', .9, .18);
const cityGlow = new THREE.MeshBasicMaterial({ color: '#292b38' });
for (let i = 0; i < 38; i++) {
  const x = (i - 19) * .78 + (Math.random() - .5) * .35;
  const h = 2.2 + Math.random() * 5.3;
  const w = .36 + Math.random() * .5;
  const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, .55 + Math.random() * .5), cityMat);
  b.position.set(x, h / 2 - .15, -9 - Math.random() * 2); scene.add(b);
  if (i % 2 === 0) {
    const win = new THREE.Mesh(new THREE.BoxGeometry(.045, .12, .02), cityGlow);
    for (let j = 0; j < Math.min(7, Math.floor(h)); j++) {
      const light = win.clone(); light.position.set(x + (Math.random() - .5) * w * .6, .35 + j * .5, b.position.z + .3); scene.add(light);
    }
  }
}
for (const side of [-1, 1]) {
  const pylon = new THREE.Mesh(new THREE.BoxGeometry(.22, 6, .28), mat(side < 0 ? '#3ddbd7' : '#ff4765', .3, .4));
  pylon.position.set(side * 7.4, 2.8, -1.5); scene.add(pylon);
  const cap = new THREE.Mesh(new THREE.BoxGeometry(.6, .1, .45), new THREE.MeshBasicMaterial({ color: side < 0 ? '#62fff2' : '#ff5c77' }));
  cap.position.set(side * 7.4, 5.85, -1.5); scene.add(cap);
}

const sphereGeo = new THREE.SphereGeometry(1, 16, 12);
const capsuleGeo = new THREE.CapsuleGeometry(.22, .45, 4, 8);
function mesh(geometry, material, parent, pos = [0, 0, 0], scale = [1, 1, 1]) {
  const o = new THREE.Mesh(geometry, material); o.position.set(...pos); o.scale.set(...scale); o.castShadow = true; o.receiveShadow = true; parent.add(o); return o;
}
function makeFighter(kind, x) {
  const player = kind === 'nova';
  const colors = player ? { suit: '#182b33', trim: '#55eee2', skin: '#e7aa86', hair: '#e9f4f0', glove: '#52e7dc', boot: '#102129' } : { suit: '#3a2029', trim: '#ff536a', skin: '#b67c69', hair: '#27232a', glove: '#ff5269', boot: '#24131a' };
  const group = new THREE.Group(); group.position.set(x, 0, 0); scene.add(group);
  const body = new THREE.Group(); body.position.y = .12; group.add(body);
  const suit = mat(colors.suit, .42, .16), trim = mat(colors.trim, .32, .35), skin = mat(colors.skin, .76), hair = mat(colors.hair, .46), glove = mat(colors.glove, .34, .18), bootMat = mat(colors.boot, .36, .3);
  // legs pivot at hips; capsules taper into bright armored boots
  const legs = [];
  for (const side of [-1, 1]) {
    const leg = new THREE.Group(); leg.position.set(side * .22, .83, 0); body.add(leg); legs.push(leg);
    mesh(capsuleGeo, suit, leg, [0, -.32, 0], [.76, 1, .82]);
    mesh(new THREE.BoxGeometry(.26, .18, .42), bootMat, leg, [0, -.64, .09]);
    mesh(new THREE.BoxGeometry(.27, .055, .44), trim, leg, [0, -.55, .08]);
  }
  mesh(new THREE.BoxGeometry(.57, .29, .35), suit, body, [0, .94, 0]);
  const torso = new THREE.Group(); torso.position.y = 1.02; body.add(torso);
  mesh(capsuleGeo, suit, torso, [0, .38, 0], [1.32, 1.15, .78]);
  mesh(new THREE.BoxGeometry(.68, .12, .39), trim, torso, [0, .7, .015]);
  mesh(new THREE.BoxGeometry(.12, .53, .05), trim, torso, [player ? -.2 : .2, .38, .2]);
  mesh(new THREE.SphereGeometry(.19, 16, 12), skin, torso, [0, .95, 0]);
  const head = new THREE.Group(); head.position.set(0, 1.1, 0); torso.add(head);
  mesh(sphereGeo, skin, head, [0, .18, 0], [.36, .4, .32]);
  // angular fringe / mohawk silhouette
  mesh(new THREE.SphereGeometry(.34, 12, 8), hair, head, [0, .39, -.015], [1.05, .64, .98]);
  if (player) {
    mesh(new THREE.ConeGeometry(.15, .5, 5), trim, head, [.04, .72, -.02], [1, 1, .8]).rotation.z = -.1;
    mesh(new THREE.BoxGeometry(.48, .09, .35), trim, head, [0, .1, .05]);
  } else {
    mesh(new THREE.BoxGeometry(.52, .12, .32), trim, head, [0, .19, .27]);
    mesh(new THREE.BoxGeometry(.22, .05, .04), new THREE.MeshBasicMaterial({ color: '#fff0d4' }), head, [0, .2, .3]);
  }
  // eye strip facing forward (toward opponent)
  const eyeMat = new THREE.MeshBasicMaterial({ color: player ? '#71fff3' : '#ffb1a0' });
  mesh(new THREE.BoxGeometry(.22, .035, .025), eyeMat, head, [player ? .17 : -.17, .18, .29]);
  const arms = [];
  for (const side of [-1, 1]) {
    const arm = new THREE.Group(); arm.position.set(side * .46, .78, 0); torso.add(arm); arms.push(arm);
    mesh(capsuleGeo, suit, arm, [side * .035, -.28, .025], [.72, .9, .78]);
    mesh(new THREE.TorusGeometry(.18, .055, 8, 12), trim, arm, [side * .04, -.48, .05], [1, 1, 1]).rotation.x = Math.PI / 2;
    mesh(sphereGeo, glove, arm, [side * .06, -.58, .12], [.25, .24, .26]);
    mesh(new THREE.BoxGeometry(.28, .11, .26), bootMat, arm, [side * .06, -.62, .14]);
  }
  // floating angular shoulder accents
  for (const side of [-1, 1]) mesh(new THREE.BoxGeometry(.3, .2, .38), trim, torso, [side * .51, .65, .015], [1, .85, 1]);
  // loose belt tab
  mesh(new THREE.BoxGeometry(.12, .35, .05), trim, body, [player ? -.28 : .28, .66, .22]).rotation.z = player ? -.18 : .18;
  return { group, body, torso, legs, arms, player, action: null, actionTime: 0, stun: 0, walk: 0, x, health: 100, meter: 0, facing: player ? 1 : -1 };
}
const nova = makeFighter('nova', -2.35);
const titan = makeFighter('titan', 2.35);

// Dust, sparks and attack trails are lightweight, pooled scene objects.
const particles = [];
function burst(x, y, z, color, count = 12, power = 2.4) {
  for (let i = 0; i < count; i++) {
    const p = new THREE.Mesh(new THREE.SphereGeometry(.035 + Math.random() * .05, 6, 5), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 }));
    p.position.set(x, y, z); scene.add(p);
    const a = Math.random() * Math.PI * 2, up = Math.random() * 1.5;
    particles.push({ mesh: p, vel: new THREE.Vector3(Math.cos(a) * power * Math.random(), up * power * .45, Math.sin(a) * power * .4), life: .45 + Math.random() * .35, max: .8 });
  }
}
const clock = new THREE.Clock();
const ui = {
  playerHealth: document.querySelector('#playerHealth'), cpuHealth: document.querySelector('#cpuHealth'),
  playerMeter: document.querySelector('#playerMeter'), cpuMeter: document.querySelector('#cpuMeter'), timer: document.querySelector('#timer'),
  callout: document.querySelector('#callout'), combo: document.querySelector('#comboToast'), flash: document.querySelector('#flash'),
  start: document.querySelector('#startButton'), overlay: document.querySelector('#screenOverlay'), result: document.querySelector('#resultOverlay'),
  resultTitle: document.querySelector('#resultTitle'), resultCopy: document.querySelector('#resultCopy')
};
let started = false, ended = false, remaining = 60, aiThink = 0, playerCombo = 0, comboTimer = 0, soundOn = true, elapsed = 0, audioContext = null;
function playSound(type) {
  if (!soundOn || !audioContext) return;
  const now = audioContext.currentTime;
  const osc = audioContext.createOscillator(), gain = audioContext.createGain();
  const settings = type === 'heavy' ? [95, 48, .16] : type === 'special' ? [420, 90, .32] : type === 'win' ? [540, 780, .28] : [190, 75, .12];
  osc.type = type === 'special' ? 'sawtooth' : 'triangle';
  osc.frequency.setValueAtTime(settings[0], now); osc.frequency.exponentialRampToValueAtTime(settings[1], now + settings[2]);
  gain.gain.setValueAtTime(.0001, now); gain.gain.exponentialRampToValueAtTime(type === 'special' ? .055 : .035, now + .012); gain.gain.exponentialRampToValueAtTime(.0001, now + settings[2]);
  osc.connect(gain); gain.connect(audioContext.destination); osc.start(now); osc.stop(now + settings[2] + .02);
}
const keys = new Set();
const held = { left: false, right: false, jump: false };
const attackDefs = { strike: { duration: .34, hit: .13, damage: 7, reach: 2.45, meter: 12 }, heavy: { duration: .58, hit: .25, damage: 15, reach: 2.8, meter: 18 }, special: { duration: .72, hit: .3, damage: 24, reach: 3.5, meter: 0 } };

function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false); camera.aspect = w / h;
  camera.fov = w < 700 ? 43 : 39; camera.position.set(0, w < h ? 7.8 : 7.3, w < h ? 19 : 16.8);
  camera.lookAt(0, 1.3, 0); camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize); resize();
function healthUpdate() {
  ui.playerHealth.style.width = `${Math.max(0, nova.health)}%`;
  ui.cpuHealth.style.width = `${Math.max(0, titan.health)}%`;
  ui.playerMeter.style.width = `${nova.meter}%`; ui.cpuMeter.style.width = `${titan.meter}%`;
  ui.timer.textContent = Math.ceil(remaining).toString().padStart(2, '0');
}
function showCallout(text, duration = 800) {
  ui.callout.firstElementChild.textContent = text; ui.callout.classList.add('show');
  window.setTimeout(() => ui.callout.classList.remove('show'), duration);
}
function action(fighter, type) {
  if (!started || ended || fighter.action || fighter.stun > 0) return;
  const def = attackDefs[type];
  if (type === 'special' && fighter.meter < 100) {
    if (fighter === nova) { ui.combo.textContent = 'SUPER NEEDS 100%'; ui.combo.classList.add('show'); window.setTimeout(() => ui.combo.classList.remove('show'), 700); }
    return;
  }
  fighter.action = type; fighter.actionTime = 0;
  if (fighter === nova) playSound(type);
  if (type === 'special') fighter.meter = 0;
  // Attack becomes live exactly once; attach state to action object to avoid frame-rate dependence.
  fighter.didHit = false; fighter.connected = false;
  if (type === 'special') burst(fighter.group.position.x, 1.2, 0, fighter.player ? '#55fff0' : '#ff5269', 10, 1.5);
}
function hit(attacker, defender, type) {
  const def = attackDefs[type];
  if (Math.abs(attacker.group.position.x - defender.group.position.x) > def.reach) return;
  if (defender.health <= 0) return;
  let damage = def.damage;
  if (defender.action === 'guard') damage *= .35;
  defender.health = Math.max(0, defender.health - damage); defender.stun = type === 'heavy' || type === 'special' ? .42 : .24;
  attacker.meter = Math.min(100, attacker.meter + def.meter);
  if (attacker === nova) {
    playerCombo++; comboTimer = 1.8;
    if (playerCombo >= 2) { ui.combo.textContent = `${playerCombo} HIT COMBO!`; ui.combo.classList.add('show'); }
  }
  burst(defender.group.position.x - defender.facing * .18, 1.55, .15, attacker.player ? '#8efffa' : '#ff7384', type === 'special' ? 26 : 15, type === 'heavy' ? 3.3 : 2.2);
  defender.group.position.x += attacker.facing * (type === 'heavy' ? .3 : .14);
  ui.flash.classList.remove('active'); void ui.flash.offsetWidth; ui.flash.classList.add('active');
  healthUpdate();
  playSound(attacker === nova ? type : 'strike');
  if (defender.health <= 0) finish(attacker === nova);
}
function finish(won) {
  if (ended) return; ended = true; started = false; playSound(won ? 'win' : 'heavy');
  ui.resultTitle.textContent = won ? 'VICTORY' : 'DEFEAT';
  ui.resultTitle.style.color = won ? 'var(--cyan)' : 'var(--pink)';
  ui.resultCopy.textContent = won ? 'The crowd knows your name.' : 'The Iron Wall holds the arena.';
  window.setTimeout(() => ui.result.classList.remove('hidden'), 850);
}
function resetMatch() {
  nova.health = titan.health = 100; nova.meter = titan.meter = 0;
  nova.group.position.x = -2.35; titan.group.position.x = 2.35;
  nova.action = titan.action = null; nova.stun = titan.stun = 0;
  remaining = 60; ended = false; playerCombo = 0; healthUpdate();
}
ui.start.addEventListener('click', () => {
  if (started) return;
  if (!audioContext && soundOn) { const AudioCtor = window.AudioContext || window.webkitAudioContext; if (AudioCtor) audioContext = new AudioCtor(); }
  audioContext?.resume(); resetMatch(); ui.overlay.classList.add('hidden'); started = true;
  showCallout('FIGHT!', 1000);
});
document.querySelector('#rematchButton').addEventListener('click', () => {
  ui.result.classList.add('hidden'); if (audioContext) audioContext.resume(); resetMatch(); started = true; showCallout('FIGHT!', 850);
});
document.querySelector('#soundToggle').addEventListener('click', (e) => {
  soundOn = !soundOn; e.currentTarget.classList.toggle('off', !soundOn);
  e.currentTarget.querySelector('.sound-label').textContent = soundOn ? 'SOUND ON' : 'SOUND OFF';
});
function bindActionButtons() {
  for (const button of document.querySelectorAll('[data-action]')) {
    const name = button.dataset.action;
    const down = (e) => { e.preventDefault(); button.classList.add('pressed'); if (name === 'left' || name === 'right') held[name] = true; else if (name === 'jump') { if (!nova.jumping && started) { nova.jumping = true; nova.jumpV = 5.3; } } else action(nova, name); };
    const up = (e) => { e.preventDefault(); button.classList.remove('pressed'); held[name] = false; };
    button.addEventListener('pointerdown', down); button.addEventListener('pointerup', up); button.addEventListener('pointercancel', up); button.addEventListener('pointerleave', up);
  }
}
bindActionButtons();
window.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if (['arrowleft','arrowright','arrowup',' '].includes(k)) e.preventDefault();
  keys.add(k);
  if (k === 'j' || k === 'f') action(nova, 'strike');
  if (k === 'k' || k === 'g') action(nova, 'heavy');
  if (k === 'l' || k === 'h') action(nova, 'special');
  if ((k === 'w' || k === 'arrowup' || k === ' ') && !nova.jumping && started) { nova.jumping = true; nova.jumpV = 5.3; }
}, { passive: false });
window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));
window.addEventListener('blur', () => { keys.clear(); held.left = held.right = held.jump = false; });

function fighterAnimate(f, dt) {
  const opposing = f === nova ? titan : nova;
  f.facing = opposing.group.position.x >= f.group.position.x ? 1 : -1;
  f.group.rotation.y = f.facing > 0 ? Math.PI / 4 : -Math.PI / 4;
  f.stun = Math.max(0, f.stun - dt);
  const moving = f === nova ? ((keys.has('a') || keys.has('arrowleft') || held.left) ? -1 : 0) + ((keys.has('d') || keys.has('arrowright') || held.right) ? 1 : 0) : f.aiMove || 0;
  if (moving && !f.action && f.stun <= 0) {
    f.group.position.x += moving * dt * 3.7;
    f.walk += dt * 11;
  }
  f.group.position.x = THREE.MathUtils.clamp(f.group.position.x, -6.1, 6.1);
  if (f.jumping) {
    f.jumpV -= dt * 12; f.body.position.y += f.jumpV * dt;
    if (f.body.position.y <= .12) { f.body.position.y = .12; f.jumping = false; }
  }
  const bob = Math.sin(elapsed * 3.8 + (f.player ? 0 : 1)) * .035;
  f.body.position.y = (f.jumping ? f.body.position.y : .12 + bob);
  const walking = moving && !f.action ? Math.sin(f.walk) : Math.sin(elapsed * 2 + (f.player ? 0 : 1)) * .07;
  f.legs[0].rotation.x = walking * .55; f.legs[1].rotation.x = -walking * .55;
  f.torso.rotation.z = f.stun > 0 ? Math.sin(elapsed * 45) * .06 : (moving ? -moving * .045 : 0);
  f.arms[0].rotation.x = -.35 + Math.sin(elapsed * 3 + 1) * .09;
  f.arms[1].rotation.x = -.35 - Math.sin(elapsed * 3 + 1) * .09;
  f.arms[0].rotation.z = .12; f.arms[1].rotation.z = -.12;
  if (f.action) {
    f.actionTime += dt;
    const def = attackDefs[f.action], t = f.actionTime / def.duration;
    if (f.action === 'strike') { f.arms[1].rotation.x = t < .32 ? -1.2 * (t / .32) : t < .65 ? -1.2 + 1.5 * ((t - .32) / .33) : .3 * (1 - (t - .65) / .35); f.arms[1].rotation.z = -.18; }
    if (f.action === 'heavy') { f.arms[1].rotation.x = t < .42 ? -.35 - t * 2.4 : 1.05 - (t - .42) * 2; f.torso.rotation.z = -f.facing * .14; }
    if (f.action === 'special') { f.arms[0].rotation.x = -1.8; f.arms[1].rotation.x = -1.8; f.torso.rotation.z = Math.sin(t * Math.PI) * .18; }
    if (!f.didHit && f.actionTime >= def.hit) { f.didHit = true; hit(f, opposing, f.action); }
    if (f.actionTime >= def.duration) { f.action = null; f.torso.rotation.z = 0; }
  }
}
function cpuUpdate(dt) {
  if (!started || ended || titan.health <= 0) return;
  aiThink -= dt;
  const gap = titan.group.position.x - nova.group.position.x;
  if (aiThink <= 0) {
    aiThink = .28 + Math.random() * .35;
    titan.aiMove = Math.abs(gap) > 2.4 ? (gap > 0 ? -1 : 1) : 0;
    if (Math.abs(gap) < 2.9 && Math.random() < .72) action(titan, Math.random() < .65 ? 'strike' : 'heavy');
    if (Math.random() < .09 && Math.abs(gap) > 3.5) titan.aiMove *= -1;
  }
  if (titan.action && Math.abs(gap) > 3.3 && titan.actionTime < .25) titan.aiMove = gap > 0 ? -1 : 1;
}
function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]; p.life -= dt; p.mesh.position.addScaledVector(p.vel, dt); p.vel.y -= dt * 4;
    p.mesh.material.opacity = Math.max(0, p.life / p.max);
    p.mesh.scale.multiplyScalar(.985);
    if (p.life <= 0) { scene.remove(p.mesh); p.mesh.geometry.dispose(); p.mesh.material.dispose(); particles.splice(i, 1); }
  }
}
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), .04); elapsed += dt;
  if (started && !ended) {
    remaining = Math.max(0, remaining - dt); healthUpdate();
    if (remaining <= 0) finish(nova.health >= titan.health);
    if (comboTimer > 0) { comboTimer -= dt; if (comboTimer <= 0) { playerCombo = 0; ui.combo.classList.remove('show'); } }
    cpuUpdate(dt);
  }
  fighterAnimate(nova, dt); fighterAnimate(titan, dt);
  updateParticles(dt);
  ring.material.opacity = .78 + Math.sin(elapsed * 2) * .2;
  renderer.render(scene, camera);
}
healthUpdate(); animate();


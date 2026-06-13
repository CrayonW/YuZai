import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const sourceDir = join(root, "assets", "references", "action-sheets");
const spriteDir = join(root, "assets", "sprites");
const frameSize = 280;
const frameCount = 6;
const green = "#00ff00";

const actions = [
  { state: "idle", mood: "calm", view: "front", frames: idleFrames },
  { state: "walking", mood: "calm", view: "left", frames: walkingFrames },
  { state: "sleepy", mood: "sleepy", view: "front", frames: sleepyFrames },
  { state: "sleeping", mood: "sleepy", view: "front", frames: sleepingFrames },
  { state: "waking", mood: "surprised", view: "front", frames: wakingFrames },
  { state: "surprised", mood: "surprised", view: "front", frames: surprisedFrames },
  { state: "shy", mood: "shy", view: "front", frames: shyFrames },
  { state: "dragging", mood: "calm", view: "front", frames: draggingFrames },
  { state: "waving", mood: "calm", view: "front", frames: wavingFrames }
];

mkdirSync(sourceDir, { recursive: true });
mkdirSync(spriteDir, { recursive: true });

for (const action of actions) {
  const svgPath = join(sourceDir, `${action.state}_source.svg`);
  const pngPath = join(sourceDir, `${action.state}_source.png`);
  const outDir = join(spriteDir, action.state);
  mkdirSync(outDir, { recursive: true });
  for (const file of readdirSync(outDir)) {
    if (file.endsWith(".png")) rmSync(join(outDir, file));
  }

  writeFileSync(svgPath, buildSheet(action), "utf8");
  execFileSync("rsvg-convert", ["-w", String(frameSize * frameCount), "-h", String(frameSize), "-o", pngPath, svgPath]);

  for (let index = 0; index < frameCount; index += 1) {
    const output = join(outDir, `${action.state}_${String(index + 1).padStart(4, "0")}.png`);
    execFileSync("magick", [
      pngPath,
      "-crop",
      `${frameSize}x${frameSize}+${index * frameSize}+0`,
      "+repage",
      "-transparent",
      green,
      output
    ]);
  }
}

const report = validateOutputs();
writeFileSync(join(sourceDir, "generation-report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));

function buildSheet(action) {
  const frames = action.frames().slice(0, frameCount);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${frameSize * frameCount}" height="${frameSize}" viewBox="0 0 ${frameSize * frameCount} ${frameSize}">
  <rect width="100%" height="100%" fill="${green}"/>
  ${frames.map((pose, index) => frameGroup(action, pose, index)).join("\n  ")}
</svg>
`;
}

function frameGroup(action, pose, index) {
  const x = index * frameSize + frameSize / 2;
  const y = frameSize / 2 + 18 + pose.bob;
  const scaleY = pose.scaleY ?? 1;
  const direction = action.view === "left" ? -1 : 1;
  return `<g transform="translate(${x} ${y}) scale(${direction} ${scaleY})">
    ${shadow(pose)}
    ${tail(pose)}
    ${body(pose)}
    ${fins(pose)}
    ${face(action.mood, pose)}
    ${effects(action.state, pose)}
  </g>`;
}

function shadow(pose) {
  return "";
}

function body(pose) {
  const height = pose.bodyHeight ?? 82;
  const y = pose.bodyY ?? -58;
  const highlightY = pose.highlightY ?? -28;
  return `<defs>
      <linearGradient id="bodyGrad${pose.id}" x1="-70" y1="-56" x2="70" y2="46" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#ffdf7d"/>
        <stop offset="0.5" stop-color="#ffb65c"/>
        <stop offset="1" stop-color="#f47f5b"/>
      </linearGradient>
    </defs>
    <rect x="-76" y="${y}" width="152" height="${height}" rx="44" fill="url(#bodyGrad${pose.id})" stroke="#593c35" stroke-width="4"/>
    <rect x="-42" y="${highlightY}" width="74" height="36" rx="20" fill="#ffffff" opacity="0.34"/>`;
}

function tail(pose) {
  const angle = -18 + (pose.tailWag ?? 0);
  return `<g transform="translate(-72 -14) rotate(${angle})">
      <path d="M0 0 Q-44 -34 -54 12 Q-30 6 0 24 Z" fill="#f06f64" stroke="#593c35" stroke-width="4"/>
    </g>`;
}

function fins(pose) {
  const walk = pose.finLift ?? 0;
  const rightExtra = pose.waveFin ?? 0;
  return `<g transform="translate(-32 32) rotate(${walk})">
      <rect x="-18" y="0" width="32" height="26" rx="16" fill="#ffc56d" stroke="#593c35" stroke-width="4"/>
    </g>
    <g transform="translate(34 32) rotate(${-walk - rightExtra})">
      <rect x="-14" y="${rightExtra ? -8 : 0}" width="32" height="26" rx="16" fill="#ffc56d" stroke="#593c35" stroke-width="4"/>
    </g>`;
}

function face(mood, pose) {
  const eyeY = pose.eyeY ?? -20;
  const sleepy = mood === "sleepy" || pose.sleepEyes;
  const mouth = mood === "surprised"
    ? `<ellipse cx="0" cy="6" rx="8" ry="10" fill="none" stroke="#3d2b2b" stroke-width="4"/>`
    : mood === "shy"
      ? `<path d="M-12 4 A12 12 0 0 0 12 4" fill="none" stroke="#3d2b2b" stroke-width="4"/>
         <ellipse cx="-48" cy="-2" rx="13" ry="7" fill="#ff657d" opacity="0.42"/>
         <ellipse cx="48" cy="-2" rx="13" ry="7" fill="#ff657d" opacity="0.42"/>`
      : `<path d="M-12 2 A12 12 0 0 0 12 2" fill="none" stroke="#3d2b2b" stroke-width="4"/>`;
  const eyes = sleepy
    ? `<path d="M-36 ${eyeY} A10 10 0 0 0 -16 ${eyeY}" fill="none" stroke="#3d2b2b" stroke-width="4"/>
       <path d="M18 ${eyeY} A10 10 0 0 0 38 ${eyeY}" fill="none" stroke="#3d2b2b" stroke-width="4"/>`
    : `<circle cx="-26" cy="${eyeY}" r="${mood === "surprised" ? 9 : 6}" fill="#3d2b2b"/>
       <circle cx="28" cy="${eyeY}" r="${mood === "surprised" ? 9 : 6}" fill="#3d2b2b"/>`;
  return `<g>${eyes}${mouth}</g>`;
}

function effects(state, pose) {
  if (state === "sleeping") {
    return `<text x="48" y="${-66 + pose.zz}" font-family="system-ui, sans-serif" font-size="22" font-weight="700" fill="#5d6b82">Z</text>
      <text x="70" y="${-86 + pose.zz * 0.7}" font-family="system-ui, sans-serif" font-size="16" font-weight="700" fill="#5d6b82">Z</text>`;
  }
  if (state === "waving") {
    return `<path d="M76 -44 A14 14 0 0 1 88 -34 M88 -36 A18 18 0 0 1 104 -24" fill="none" stroke="#f6b04f" stroke-width="3" stroke-linecap="round"/>`;
  }
  if (state === "surprised") {
    return `<path d="M-76 -64 l-10 -14 M76 -64 l10 -14 M0 -78 v-18" stroke="#f6b04f" stroke-width="4" stroke-linecap="round"/>`;
  }
  if (state === "dragging") {
    return `<path d="M-86 -74 q-12 -10 -2 -20 M86 -74 q12 -10 2 -20" stroke="#5d6b82" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.75"/>`;
  }
  return "";
}

function idleFrames() {
  return cycle([0, 3, 5, 3, 0, -2]).map((bob, id) => ({ id, bob, tailWag: bob * 0.5 }));
}

function walkingFrames() {
  return cycle([0, 4, 1, -3, 1, 4]).map((bob, id) => ({
    id,
    bob,
    tailWag: [-9, -3, 7, 9, 3, -7][id],
    finLift: [-10, 8, 12, -8, -12, 8][id]
  }));
}

function sleepyFrames() {
  return cycle([1, 3, 5, 6, 4, 2]).map((bob, id) => ({ id, bob, scaleY: 0.92, sleepEyes: true, tailWag: -2 }));
}

function sleepingFrames() {
  return cycle([1, 2, 1, 0, 1, 2]).map((bob, id) => ({
    id,
    bob,
    scaleY: 0.78,
    bodyHeight: 58,
    bodyY: -42,
    highlightY: -18,
    sleepEyes: true,
    tailWag: -8,
    shadowWidth: 86,
    zz: [-4, -7, -10, -8, -5, -3][id]
  }));
}

function wakingFrames() {
  return cycle([8, 6, 3, 0, -2, 0]).map((bob, id) => ({
    id,
    bob,
    scaleY: [0.78, 0.84, 0.92, 1, 1.04, 1][id],
    bodyHeight: [58, 66, 74, 82, 84, 82][id],
    bodyY: [-42, -48, -54, -58, -60, -58][id],
    tailWag: [-8, -4, 0, 4, 7, 2][id],
    finLift: [0, 2, 4, 7, 10, 4][id]
  }));
}

function surprisedFrames() {
  return cycle([-6, -10, -6, 0, 2, 0]).map((bob, id) => ({ id, bob, scaleY: [1.03, 1.08, 1.04, 1, 0.98, 1][id], tailWag: [4, 10, 6, 2, -2, 0][id] }));
}

function shyFrames() {
  return cycle([0, 2, 4, 3, 1, 0]).map((bob, id) => ({ id, bob, scaleY: 0.96, eyeY: -18, tailWag: [-2, -4, -5, -3, -1, -2][id] }));
}

function draggingFrames() {
  return cycle([-2, 1, -1, 2, 0, -2]).map((bob, id) => ({
    id,
    bob,
    tailWag: [-6, 2, 8, 3, -4, -8][id],
    finLift: [8, -10, 10, -8, 7, -7][id],
    shadowAlpha: 0.16
  }));
}

function wavingFrames() {
  return cycle([0, 2, 4, 3, 1, 0]).map((bob, id) => ({
    id,
    bob,
    tailWag: [0, 3, 5, 3, 0, -2][id],
    waveFin: [0, 18, 30, 22, 10, 0][id]
  }));
}

function cycle(values) {
  return values.slice(0, frameCount);
}

function validateOutputs() {
  const states = actions.map((action) => action.state);
  const frames = [];
  for (const state of states) {
    const outDir = join(spriteDir, state);
    for (const file of readdirSync(outDir).filter((name) => name.endsWith(".png")).sort()) {
      const filePath = join(outDir, file);
      const identify = execFileSync("magick", ["identify", "-format", "%w %h %[channels]", filePath], { encoding: "utf8" });
      const [width, height, channels] = identify.trim().split(/\s+/);
      frames.push({ state, file, width: Number(width), height: Number(height), channels });
    }
  }

  const badFrames = frames.filter((frame) => frame.width !== frameSize || frame.height !== frameSize || !frame.channels.includes("a"));
  const missing = states.filter((state) => frames.filter((frame) => frame.state === state).length !== frameCount);
  const sourceSheets = actions.map((action) => {
    const png = join(sourceDir, `${action.state}_source.png`);
    const identify = execFileSync("magick", ["identify", "-format", "%w %h", png], { encoding: "utf8" });
    const [width, height] = identify.trim().split(/\s+/).map(Number);
    return { state: action.state, file: `${action.state}_source.png`, width, height };
  });

  return {
    frameSize,
    frameCount,
    states,
    sourceSheets,
    totalFrames: frames.length,
    missing,
    badFrames,
    ok: missing.length === 0 && badFrames.length === 0
  };
}

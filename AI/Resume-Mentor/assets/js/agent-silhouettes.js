/**
 * Resume-Mentor Agent 剪影
 * 每個 agent 對應一種姿勢（無臉、純色塊），讓不同角色一眼可辨。
 */
(function () {
  "use strict";

  // 肩膀 / 髖部基準點（viewBox 0 0 60 96）
  const SHOULDER_L = { x: 19, y: 30 };
  const SHOULDER_R = { x: 41, y: 30 };
  const HIP = { x: 30, y: 64 };

  // 每種姿勢：左右手臂角度（0° = 垂直向下，順時針為正）、腿部站距、頭部位移、軀幹傾斜、手臂是否在身後（壓在軀幹下層）
  const POSES = {
    "hands-on-hips": { armL: -55, armR: 55, legSpread: 9, headOffsetX: 0, lean: 0, armBehind: false },
    "talking": { armL: 12, armR: -135, legSpread: 7, headOffsetX: 2, lean: -3, armBehind: false },
    "arms-crossed": { armL: 100, armR: -100, legSpread: 8, headOffsetX: 0, lean: 0, armBehind: false },
    "pointing": { armL: 10, armR: -92, legSpread: 8, headOffsetX: 1, lean: -2, armBehind: false },
    "arms-open": { armL: -150, armR: 150, legSpread: 10, headOffsetX: 0, lean: 0, armBehind: false },
    "thinking": { armL: 14, armR: -165, legSpread: 6, headOffsetX: -2, lean: 2, armBehind: false },
    "confident-up": { armL: 8, armR: -180, legSpread: 11, headOffsetX: 0, lean: 0, armBehind: false },
    "leaning-crossed": { armL: 95, armR: -95, legSpread: 6, headOffsetX: 3, lean: 6, armBehind: false },
    "presenting": { armL: -65, armR: 65, legSpread: 9, headOffsetX: 0, lean: 0, armBehind: false },
    "hands-behind": { armL: 165, armR: -165, legSpread: 7, headOffsetX: 0, lean: -1, armBehind: true },
    "hip-and-point": { armL: -55, armR: -92, legSpread: 9, headOffsetX: 1, lean: -2, armBehind: false },
  };

  const POSE_IDS = Object.keys(POSES);

  function arm(shoulder, angle) {
    return (
      `<g transform="translate(${shoulder.x} ${shoulder.y}) rotate(${angle})">` +
      `<rect x="-3.5" y="0" width="7" height="27" rx="3.5" />` +
      `</g>`
    );
  }

  function svg(poseId, opts) {
    const p = POSES[poseId] || POSES["hands-on-hips"];
    const fill = (opts && opts.fill) || "currentColor";
    const headCx = 30 + p.headOffsetX;
    const legGap = p.legSpread;

    const head = `<circle cx="${headCx}" cy="14" r="9" />`;
    const torso = `<path d="M18,28 C18,23 23,20 30,20 C37,20 42,23 42,28 L45,62 C45,72 36,78 30,78 C24,78 15,72 15,62 Z" />`;
    const legs =
      `<rect x="${30 - legGap - 4}" y="60" width="8" height="32" rx="4" />` +
      `<rect x="${30 + legGap - 4}" y="60" width="8" height="32" rx="4" />`;
    const armL = arm(SHOULDER_L, p.armL);
    const armR = arm(SHOULDER_R, p.armR);

    const body = p.armBehind
      ? `${armL}${armR}${legs}${torso}${head}`
      : `${legs}${torso}${armL}${armR}${head}`;

    return (
      `<svg viewBox="0 0 60 96" fill="${fill}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">` +
      `<g transform="rotate(${p.lean} 30 50)">${body}</g>` +
      `</svg>`
    );
  }

  window.RM_SILHOUETTES = { svg, POSE_IDS };
})();

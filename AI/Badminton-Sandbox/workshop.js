export const SKILL_COLORS = {
  fire: "#f28b64",
  ice: "#80cbe7",
  violet: "#ba9bea",
  gold: "#f6d65a",
};
export const SPECIALTIES = {
  heavy: {
    name: "重殺",
    note: "力量 +1、穩定 -1",
    mods: { power: 1, control: -1 },
  },
  chase: {
    name: "追球",
    note: "速度 +1、力量 -1",
    mods: { speed: 1, power: -1 },
  },
  trick: {
    name: "網前假動作",
    note: "網前 +1、防守 -1",
    mods: { net: 1, defense: -1 },
  },
  rescue: {
    name: "救球",
    note: "防守 +1、網前 -1",
    mods: { defense: 1, net: -1 },
  },
  steady: {
    name: "穩定發揮",
    note: "穩定 +1、速度 -1",
    mods: { control: 1, speed: -1 },
  },
};
export const specialties = (value) =>
  [...new Set(Array.isArray(value) ? value : [])]
    .filter((key) => SPECIALTIES[key])
    .slice(0, 2);
export function skillDesign(value) {
  return {
    effect: ["speed", "deceive", "control"].includes(value?.effect)
      ? value.effect
      : "speed",
    cost: value?.cost === "risk" ? "risk" : "charge",
    color: SKILL_COLORS[value?.color] ? value.color : "gold",
  };
}
export const skillCost = (profile) =>
  profile?.skill !== "wall" && profile?.skillDesign?.cost === "risk" ? 70 : 100;
export function skillBonus(profile, base) {
  if (!profile?.skillDesign) return { ...base };
  const d = skillDesign(profile.skillDesign),
    bonus = { ...base };
  if (d.effect === "speed") {
    bonus.pace = (bonus.pace || 1) * 1.12;
    bonus.win += 0.06;
  }
  if (d.effect === "deceive") bonus.win += 0.1;
  if (d.effect === "control") bonus.errorScale = (bonus.errorScale ?? 1) * 0.55;
  if (d.cost === "risk") {
    bonus.error += 0.06;
    bonus.win -= 0.025;
  }
  return bonus;
}

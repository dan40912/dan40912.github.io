import { SHOTS, team } from "./model.js?v=20261008-targets";

// Describe observed geometry, without presenting simulated outcomes as certainty.
export function shotContext(
  state,
  actor,
  shot,
  target,
  profiles,
  event = null,
) {
  const opponents = team(actor) === 0 ? [2, 3] : [0, 1];
  const receiver =
    event?.receiver ??
    (state.phase === "serve"
      ? state.receiver
      : opponents.reduce((a, b) => (distance(a) <= distance(b) ? a : b)));
  function distance(i) {
    return Math.hypot(
      state.positions[i].x - target.x,
      state.positions[i].z - target.z,
    );
  }
  const depth = Math.abs(target.z);
  const zone = depth < 2 ? "網前" : depth > 4.5 ? "後場" : "中場";
  const travel = distance(receiver);
  const geometry = `目標在${zone}，${profiles[receiver].name}由擊球前站位到落點的直線距離約 ${travel.toFixed(1)} m。`;
  if (event?.outcome === "net")
    return `這拍未越網，原定${zone}落點沒有實現。回看擊球高度與飛行弧線，再試另一種球路。`;
  if (event?.outcome === "out")
    return `這拍實際橫向落點 ${Math.abs(event.actual.x).toFixed(1)} m，超過半場寬 3.05 m。原定落點仍在${zone}，可回到這拍重新推演。`;
  const qualification =
    state.phase === "serve"
      ? "發球須由指定接發者接球。"
      : "距離只描述站位，不等於必然得分。";
  return `${event?.weakReturn ? "這記進攻造成弱回球，對方下一拍處於被動，可繼續施壓。" : ""}${geometry}${qualification}${SHOTS[shot].note}`;
}

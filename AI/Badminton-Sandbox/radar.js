// Five actual simulation abilities, on a shared equipment-inclusive scale.
import { STATS } from "./abilities.js?v=20261008-targets";
import { escapeHTML } from "./characters.js?v=20261008-targets";
export const RADAR_MAX = 13;
export function radarSVG(stats, {color="#4782a5", size=220, labels=true, title="能力雷達圖", base=null}={}) {
  const c=size/2, r=size*.30, axes=STATS,
    value=(v)=>Math.max(0,Math.min(RADAR_MAX,Number(v)||0)),
    at=(i,v)=>[c+Math.cos(-Math.PI/2+i*Math.PI*2/axes.length)*r*value(v)/RADAR_MAX,c+Math.sin(-Math.PI/2+i*Math.PI*2/axes.length)*r*value(v)/RADAR_MAX],
    points=(s)=>axes.map((a,i)=>at(i,s[a.key]).map(n=>n.toFixed(2)).join(",")).join(" ");
  const rings=[3,6,9,13].map(v=>`<polygon points="${points(Object.fromEntries(axes.map(a=>[a.key,v])))}" fill="none" stroke="#183d31" stroke-opacity="${v===13?.22:.09}"/>`).join("");
  const spokes=axes.map((a,i)=>{const [x,y]=at(i,13);return `<line x1="${c}" y1="${c}" x2="${x}" y2="${y}" stroke="#183d31" stroke-opacity=".1"/>`;}).join("");
  const shape=`<polygon points="${points(stats)}" fill="${color}" fill-opacity=".2" stroke="${color}" stroke-width="2"/>`;
  const ghost=base?`<polygon points="${points(base)}" fill="none" stroke="#56685e" stroke-width="1.3" stroke-dasharray="4 3"/>`:"";
  const text=labels?axes.map((a,i)=>{const [x,y]=at(i,13);const tx=c+(x-c)*1.28,ty=c+(y-c)*1.28;return `<text x="${tx}" y="${ty}" text-anchor="middle" font-size="${size*.057}" fill="#183d31">${a.label}<tspan x="${tx}" dy="${size*.063}" font-weight="700">${value(stats[a.key])}</tspan></text>`;}).join(""):"";
  const description=axes.map(a=>`${a.label} ${value(stats[a.key])}`).join("、");
  return `<svg viewBox="0 0 ${size} ${size}" role="img" aria-label="${escapeHTML(title)}：${description}；共用刻度 0–13，實線為含球拍與專長${base?'，虛線為原始能力':''}"><title>${escapeHTML(description)}</title>${rings}${spokes}${shape}${ghost}${text}</svg>`;
}

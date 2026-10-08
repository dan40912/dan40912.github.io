// Team selection uses existing profiles and Player Studio through callbacks.
import {ROSTER, characterPreset, slotGender, genderOf} from './model.js?v=20261008-targets';
import {PERSONALITIES, STYLES} from './model.js?v=20261008-targets';
import {portrait, escapeHTML as safe} from './characters.js?v=20261008-targets';
import {effectiveStats, SKILLS, racketOf} from './abilities.js?v=20261008-targets';
import {SPECIALTIES} from './workshop.js?v=20261008-targets';
import {radarSVG} from './radar.js?v=20261008-targets';
let selectedSlot=0, moving=null;
export function renderTeamRoster(root, players, mode, actions) {
  if (!document.getElementById('characterDetail')) {
    const dialog=document.createElement('dialog');
    dialog.id='characterDetail'; dialog.className='character-detail';
    dialog.setAttribute('aria-label','角色詳細資料'); document.body.append(dialog);
  }
  const dialog=document.getElementById('characterDetail');
  if(moving!==null && players[moving]?.vacant) moving=null;
  const needs= new Set([0,1,2,3].map(i=>slotGender(mode,i)));
  const pool=ROSTER.filter(c=>needs.has(c.gender));
  root.innerHTML=`<div class="team-setup">${[0,1].map(t=>`<section class="team-panel ${t?'coral-team':''}"><h2>${t?'CORAL':'BLUE'} TEAM</h2><div class="team-slots">${[t*2,t*2+1].map(i=>{
    const p=players[i]; return `<article class="team-slot ${selectedSlot===i?'selected':''}" data-slot="${i}" draggable="${!p.vacant}"><button class="slot-select" data-select="${i}" aria-pressed="${selectedSlot===i}"><span class="slot-label">0${i%2+1} · ${slotGender(mode,i)}</span>${p.vacant?'<span class="empty-slot">＋<small>點選角色加入</small></span>':`<span class="slot-face">${portrait(p,i)}</span><strong>${safe(p.name)}</strong><small>LV. ${p.level} · ${safe(p.archetype||STYLES[p.style])}</small>`}</button>${!p.vacant?`<div class="slot-actions"><button data-edit="${i}">自訂</button><button data-move="${i}" aria-pressed="${moving===i}">${moving===i?'選擇目的位置':'移動'}</button><button data-remove="${i}" aria-label="移除 ${safe(p.name)}">移除</button></div>`:''}</article>`;
  }).join('')}</div></section>`).join('')}</div><div class="character-roster-heading"><div><span class="eyebrow">CHARACTER ROSTER</span><h2>找到你的打法。</h2></div><p role="status">${moving!==null?'點選另一個位置交換':`點選角色查看，加入 ${selectedSlot<2?'BLUE':'CORAL'} / 0${selectedSlot%2+1}（${slotGender(mode,selectedSlot)}）`}<br>亦可拖曳角色到位置；拖曳位置可交換。</p></div><div class="character-grid">${pool.map(c=>`<button class="character-card" data-character="${c.id}" draggable="true" style="--character-accent:${c.visualTheme.accent}"><span class="character-codename">${c.codename}</span><span class="character-portrait">${portrait(c,0)}</span><span class="character-name">${c.name}<small>LV. ${c.level} · ${c.gender}</small></span><span class="character-archetype">${c.archetype}</span><span class="character-strengths">${c.strengths.slice(0,2).map(safe).join(' / ')}</span><span class="character-skill">${SKILLS[c.skill].icon} ${SKILLS[c.skill].name}</span>${players.some(p=>!p.vacant&&p.characterId===c.id)?'<span class="in-team">已在隊伍</span>':''}</button>`).join('')}</div>`;
  const refresh=()=>renderTeamRoster(root,players,mode,actions);
  root.querySelectorAll('[data-select]').forEach(b=>b.onclick=()=>{
    const target=Number(b.dataset.select);
    if(moving!==null){const source=moving;moving=null; actions.move(source,target);}
    else {selectedSlot=target;refresh();}
  });
  root.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>actions.edit(Number(b.dataset.edit)));
  root.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>actions.remove(Number(b.dataset.remove)));
  root.querySelectorAll('[data-move]').forEach(b=>b.onclick=()=>{moving=moving===Number(b.dataset.move)?null:Number(b.dataset.move);refresh();});
  function showDetail(c) {
    const p=characterPreset(c.id);
    dialog.innerHTML=`<div class="detail-top"><span class="eyebrow">CHARACTER PROFILE</span><button data-close aria-label="關閉角色詳細資料">✕</button></div><div class="detail-portrait" style="--character-accent:${c.visualTheme.accent}">${portrait(p,0)}</div><span class="eyebrow">${c.codename} · LV. ${c.level}</span><h2>${c.name}</h2><p class="detail-tagline">${c.tagline}</p><p>${c.shortBio}</p><div class="player-tags"><span>${PERSONALITIES[c.personality]}</span><span>${STYLES[c.style]}</span></div><h3>打法優勢</h3><p>${c.strengths.map(safe).join(' · ')}</p><h3>需要隊友支援</h3><p>${c.weaknesses.map(safe).join(' · ')}</p>${radarSVG(effectiveStats(p),{base:p.stats,level:p.level,size:230,labels:true,title:c.name+'五軸能力'})}<p class="muted">實線含球拍與專長 · 虛線為原始能力 · 刻度 0–13</p><h3>Signature Skill</h3><p>${SKILLS[p.skill].icon} ${SKILLS[p.skill].name}</p><h3>Specialties / Racket</h3><p>${p.specialties.map(k=>SPECIALTIES[k]?.name).join(' · ')}<br>${racketOf(p).name}</p><div class="detail-actions"><button data-add="0">ADD TO BLUE</button><button data-add="1">ADD TO CORAL</button><button data-customize>CUSTOMIZE · Player Studio</button></div><p class="detail-feedback" role="status"></p>`;
    dialog.querySelector('[data-close]').onclick=()=>dialog.close();
    function destination(t) {
      const eligible=[t*2,t*2+1].filter(i=>slotGender(mode,i)===genderOf(c));
      return eligible.includes(selectedSlot)?selectedSlot:eligible.find(i=>players[i].vacant)??eligible[0];
    }
    function assign(t,customize=false) {
      const target=destination(t);
      if(target===undefined)return;
      const previous=selectedSlot; selectedSlot=target;
      if(actions.assign(c.id,target)){dialog.close();if(customize) actions.edit(target);}
      else selectedSlot=previous;
    }
    dialog.querySelectorAll('[data-add]').forEach(b=>{
      const t=Number(b.dataset.add);b.disabled=destination(t)===undefined;b.onclick=()=>assign(t);
    });
    dialog.querySelector('[data-customize]').onclick=()=>assign(selectedSlot<2?0:1,true);
    dialog.showModal();
  }
  root.querySelectorAll('[data-character]').forEach(b=>{
    b.onclick=()=>showDetail(ROSTER.find(c=>c.id===b.dataset.character));
    b.ondragstart=e=>{e.dataTransfer.setData('text/plain',JSON.stringify({character:b.dataset.character}));e.dataTransfer.effectAllowed='move';};
  });
  // Pointer fallback also supports touch drags where HTML drag events are absent.
  let pointerDrag=null;
  root.onpointerdown=e=>{
    if(e.target.closest('.slot-actions')) return;
    const card=e.target.closest('[data-character]'), slot=e.target.closest('[data-slot]');
    if(card || (slot && !players[Number(slot.dataset.slot)].vacant))
      pointerDrag={x:e.clientX,y:e.clientY,character:card?.dataset.character,slot:card?null:Number(slot.dataset.slot)};
  };
  root.onpointercancel=()=>{pointerDrag=null;};
  root.onpointerup=e=>{
    const payload=pointerDrag; pointerDrag=null;
    if(!payload || Math.hypot(e.clientX-payload.x,e.clientY-payload.y)<12) return;
    const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-slot]');
    if(!target || !root.contains(target)) return;
    const i=Number(target.dataset.slot);
    if(payload.character) actions.assign(payload.character,i); else actions.move(payload.slot,i);
  };
  root.querySelectorAll('[data-slot]').forEach(b=>{
    b.ondragstart=e=>{if(players[Number(b.dataset.slot)].vacant)return;e.dataTransfer.setData('text/plain',JSON.stringify({slot:Number(b.dataset.slot)}));e.dataTransfer.effectAllowed='move';};
    b.ondragover=e=>{e.preventDefault();e.dataTransfer.dropEffect='move';b.classList.add('drop-target');};
    b.ondragleave=()=>b.classList.remove('drop-target');
    b.ondrop=e=>{e.preventDefault();b.classList.remove('drop-target');try{const payload=JSON.parse(e.dataTransfer.getData('text/plain')), target=Number(b.dataset.slot);if(payload.character)actions.assign(payload.character,target);else if(Number.isInteger(payload.slot))actions.move(payload.slot,target);}catch{actions.error('請拖曳角色或隊伍位置');}};
  });
}

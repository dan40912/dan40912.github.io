import test from 'node:test';
import assert from 'node:assert/strict';
import {ROSTER, defaults, characterPreset, assignCharacter, moveTeamSlot, emptySlot, fitCharactersToMode, migrateProfile, normalizeTendencies, choosePlan, seeded, createMatch, shotOdds, SHOTS, slotGender, genderOf} from '../model.js';
import {CourtRenderer} from '../court.js';
import {portrait} from '../characters.js';
import {encodeCard,decodeCard} from '../analysis.js';
import {statTotal,budgetFor,SKILLS} from '../abilities.js';
import {SPECIALTIES} from '../workshop.js';

test('all sixteen original templates have complete, immutable presets',()=>{
  assert.equal(ROSTER.length,16);
  for(const c of ROSTER){
    for(const key of ['codename','tagline','shortBio','archetype','strengths','weaknesses','specialties','skill','visualTheme','hairColor','tendencies']) assert(c[key],`${c.name}: ${key}`);
    assert(SKILLS[c.skill]);assert(c.specialties.every(k=>SPECIALTIES[k]));
    assert.equal(statTotal(c.stats),budgetFor(c.level));
    assert(Object.isFrozen(c.stats));assert(Object.isFrozen(c.tendencies));
    const p=characterPreset(c.id);assert.equal(p.characterId,c.id);
    p.name='Custom';p.stats.power=1;p.tendencies.smash=2;p.visualTheme.accent='#ffffff';p.specialties.length=0;
    assert.notEqual(c.name,p.name);assert.notEqual(c.visualTheme.accent,p.visualTheme.accent);assert(c.specialties.length);
  }
});
test('assignment applies the whole preset and moves customized instances without duplication',()=>{
  const original=defaults();
  const assigned=assignCharacter(original,'men','ethan',1);
  assert.deepEqual(assigned[1],characterPreset('ethan'));assert.equal(original[1].name,'Curt');
  assigned[1].name='My Ethan';assigned[1].stats.power=3;
  const moved=assignCharacter(assigned,'men','ethan',3);
  assert.equal(moved[3].characterId,'ethan');assert.equal(moved[3].name,'My Ethan');assert.equal(moved[3].stats.power,3);
  assert.equal(new Set(moved.map(p=>p.characterId)).size,4);
});
test('mixed doubles rejects incompatible assignments and swaps; removal preserves four slots',()=>{
  const p=defaults('mixed');
  assert.throws(()=>assignCharacter(p,'mixed','aria',0));
  assert.throws(()=>moveTeamSlot(p,'mixed',0,1));
  const moved=moveTeamSlot(p,'mixed',1,3);assert.equal(moved[3].characterId,p[1].characterId);
  p[2]=emptySlot('mixed',2);
  const filled=assignCharacter(p,'mixed','ethan',2);assert.equal(filled.length,4);assert(!filled[2].vacant);
});
test('mode replacement preserves eligible customizations and excludes duplicate identities',()=>{
  let p=defaults('mixed');p[0].name='Custom Jay';p[0].level=11;
  const men=fitCharactersToMode(p,'men');assert.equal(men[0].name,'Custom Jay');assert.equal(men[0].level,11);
  for(const mode of ['women','mixed','men']){
    p=fitCharactersToMode(p,mode);
    assert(p.every((v,i)=>genderOf(v)===slotGender(mode,i)));
    assert.equal(new Set(p.map(v=>v.characterId)).size,4);
  }
  p[1]=structuredClone(p[0]);assert.equal(new Set(fitCharactersToMode(p,'men').map(v=>v.characterId)).size,4);
});
test('portrait hair and accessories keep identity when moved between teams',()=>{
  const p=characterPreset('brain');const moved=moveTeamSlot([p,...defaults().slice(1)],'men',0,3);
  assert.equal(moved[3].hairColor,p.hairColor);assert.deepEqual(moved[3].visualTheme,p.visualTheme);
  assert.equal(portrait(p,0,{faceOnly:true}),portrait(moved[3],3,{faceOnly:true}));
});
test('character preferences change same-style shot distribution without affecting odds',()=>{
  const state={...createMatch(),phase:'rally',nextActor:0,origin:{x:0,z:4.5},pressure:null,meter:[0,0,0,0]};
  const baseline=defaults(), altered=structuredClone(baseline);
  altered[0].tendencies={smash:0.5,jumpSmash:2};
  const counts=(p)=>{const rnd=seeded(82),out={};for(let i=0;i<8000;i++){const shot=choosePlan(state,p,rnd).shot;out[shot]=(out[shot]||0)+1;}return out;};
  const a=counts(baseline),b=counts(altered);assert(b.jumpSmash>a.jumpSmash*1.6);assert(b.smash<a.smash*.6);
  for(const shot of Object.keys(SHOTS).filter(k=>!['short','high','flick'].includes(k))){
    const plan={actor:0,shot,target:{x:0,z:-3.3}}, a=shotOdds(state,plan,baseline),b=shotOdds(state,plan,altered);
    assert.deepEqual(a,b);assert(a.error>=0&&a.win>=0&&a.error+a.win<=1);
  }
  assert.deepEqual(normalizeTendencies({smash:999,drive:-3,net:NaN,unknown:2}),{smash:2,drive:.5});
});
test('old sessions migrate identity while preserving customized gameplay and appearance',()=>{
  const old={...defaults()[0],name:'Jay',level:12,hair:'sweep',style:'defense',stats:{power:6,speed:7,net:5,defense:9,control:8},specialties:[]};
  delete old.characterId;delete old.hairColor;delete old.tendencies;delete old.visualTheme;
  const p=migrateProfile(old);assert.equal(p.characterId,'ze');assert.equal(p.level,12);assert.equal(p.style,'defense');assert.equal(p.hair,'sweep');assert.deepEqual(p.stats,old.stats);assert.deepEqual(p.specialties,[]);
  assert.deepEqual(migrateProfile(p),p);
  assert.equal(migrateProfile({...old,name:'Custom'}).characterId,null);
  assert.equal(migrateProfile({...old,characterId:'ze',gender:'女'}).characterId,null);
});
test('shared cards round-trip stable identities and preferences; legacy payloads remain readable',()=>{
  for(const c of ROSTER){const p=characterPreset(c.id), decoded=decodeCard(encodeCard(p));assert.equal(decoded.characterId,c.id);assert.equal(decoded.hairColor,c.hairColor);assert.deepEqual(decoded.tendencies,c.tendencies);}
  const p=defaults()[0];delete p.characterId;delete p.hairColor;delete p.visualTheme;delete p.tendencies;
  const decoded=decodeCard(encodeCard(p));assert.equal(decoded.characterId,'ze');assert.equal(decoded.level,p.level);
  const invalid=decodeCard(encodeCard({...p,characterId:'fake',hairColor:'url(bad)',tendencies:{smash:Infinity}}));assert.equal(invalid.characterId,null);assert.equal(invalid.hairColor,'#253b38');
});

test('CourtRenderer caches faces by character appearance and invalidates customized colors',()=>{
  const oldImage=globalThis.Image;
  globalThis.Image=class {};
  try {
    const renderer=Object.create(CourtRenderer.prototype);renderer.faces=new Map();
    const p=characterPreset('brain');
    const first=renderer.face(p,0,'ready');
    assert.equal(renderer.face(p,3,'ready'),first);
    assert.notEqual(renderer.face({...p,hairColor:'#ffffff'},0,'ready'),first);
    assert.notEqual(renderer.face({...p,visualTheme:{accent:'#ffffff'}},0,'ready'),first);
    assert.notEqual(renderer.face({...p,personality:'bold'},0,'ready'),first);
  } finally {globalThis.Image=oldImage;}
});

test('new hair silhouettes and visor survive sharing and affect the portrait',()=>{
  const base=characterPreset('brain'), images=new Set();
  for(const hair of ['buzz','crop','sweep','bob','pony','curls','bun','braid','mohawk']) {
    const p={...base,hair,accessory:'visor'}, decoded=decodeCard(encodeCard(p));
    assert(decoded);assert.equal(decoded.hair,hair);assert.equal(decoded.accessory,'visor');
    images.add(portrait(decoded,0,{faceOnly:true}));
  }
  assert.equal(images.size,9);
  assert.notEqual(portrait({...base,personality:'bold'},0),portrait({...base,personality:'patient'},0));
});

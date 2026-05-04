const fs=require('fs');
function sec(html,id){const start=html.indexOf(`<section id="${id}"`); const next=html.indexOf('\n        <section id=',start+1); const mainEnd=html.indexOf('\n    </main>',start+1); const end=next>=0?next:mainEnd; return html.slice(start,end).trimEnd();}
for(const file of ['finance/index.html','growth/index.html','retail-pos/index.html','index.html']){
 const s=fs.readFileSync(file,'utf8');
 console.log('\n--- '+file+' projects full ---');
 console.log(sec(s,'projects'));
}

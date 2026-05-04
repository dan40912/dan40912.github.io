const fs = require('fs');
function extract(file, id) {
  const s = fs.readFileSync(file, 'utf8');
  const start = s.indexOf(`<section id="${id}"`);
  const next = s.indexOf('\n        <section id=', start + 1);
  const mainEnd = s.indexOf('\n    </main>', start + 1);
  const end = next >= 0 ? next : mainEnd;
  console.log(`--- ${file} #${id} ---`);
  console.log(s.slice(start, end).slice(0, 4000));
}
extract('index.html','experience');
extract('retail-pos/index.html','experience');

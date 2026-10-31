/* ==========================================================================
   assets.js — 使用者上傳的圖片素材（最多 5 張）
   圖片只存在瀏覽器（IndexedDB），上傳時先縮到長邊 2000px。
   只有在使用 AI 代理時，才會把縮小後的圖片送去辨識。
   ========================================================================== */
(function () {
  'use strict';
  const P = window.Pitch;
  const MAX = 5;
  const DB = 'distill', STORE = 'assets';

  let items = []; // { id, blob, url, w, h, caption, role, hero }
  let dbp = null;
  const listeners = [];

  function openDB() {
    if (dbp) return dbp;
    dbp = new Promise((resolve) => {
      try {
        const r = indexedDB.open(DB, 1);
        r.onupgradeneeded = () => r.result.createObjectStore(STORE, { keyPath: 'id' });
        r.onsuccess = () => resolve(r.result);
        r.onerror = () => resolve(null);
      } catch (e) { resolve(null); } // 私密視窗等情況：只存在記憶體
    });
    return dbp;
  }

  async function tx(mode, fn) {
    const db = await openDB();
    if (!db) return null;
    return new Promise((resolve) => {
      try {
        const t = db.transaction(STORE, mode);
        const req = fn(t.objectStore(STORE));
        t.oncomplete = () => resolve(req && req.result);
        t.onerror = () => resolve(null);
      } catch (e) { resolve(null); }
    });
  }

  function record(a, order) {
    return { id: a.id, blob: a.blob, w: a.w, h: a.h, caption: a.caption, role: a.role, hero: a.hero, order };
  }
  function persist() {
    return Promise.all(items.map((a, i) => tx('readwrite', (s) => s.put(record(a, i)))));
  }
  function emit() { listeners.forEach((fn) => fn(items)); }

  /* 縮圖：長邊 maxSide，輸出 JPEG */
  async function downscale(blob, maxSide, quality) {
    let src;
    try { src = await createImageBitmap(blob); }
    catch (e) {
      src = await new Promise((res, rej) => {
        const img = new Image();
        img.onload = () => res(img);
        img.onerror = () => rej(new Error('無法讀取圖片'));
        img.src = URL.createObjectURL(blob);
      });
    }
    const w0 = src.width, h0 = src.height;
    const k = Math.min(1, maxSide / Math.max(w0, h0));
    const w = Math.round(w0 * k), h = Math.round(h0 * k);
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(src, 0, 0, w, h);
    const out = await new Promise((res) => c.toBlob(res, 'image/jpeg', quality));
    return { blob: out, w, h };
  }

  function blobToDataURL(blob) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = () => rej(r.error);
      r.readAsDataURL(blob);
    });
  }

  P.Assets = {
    MAX,
    get list() { return items.slice(); },
    get count() { return items.length; },
    onChange(fn) { listeners.push(fn); },

    async load() {
      const rows = (await tx('readonly', (s) => s.getAll())) || [];
      rows.sort((a, b) => a.order - b.order);
      items.forEach((a) => URL.revokeObjectURL(a.url));
      items = rows.map((r) => Object.assign({}, r, { url: URL.createObjectURL(r.blob) }));
      emit();
    },

    async add(files) {
      const list = Array.from(files || []).filter((f) => /^image\//.test(f.type));
      const room = MAX - items.length;
      const skipped = Math.max(0, list.length - room);
      for (const f of list.slice(0, Math.max(0, room))) {
        const { blob, w, h } = await downscale(f, 2000, 0.88);
        items.push({ id: 'a' + P.uid(), blob, url: URL.createObjectURL(blob), w, h, caption: '', role: '', hero: false });
      }
      await persist();
      emit();
      return { added: Math.min(list.length, room), skipped };
    },

    async remove(id) {
      const a = items.find((x) => x.id === id);
      if (!a) return;
      URL.revokeObjectURL(a.url);
      items = items.filter((x) => x.id !== id);
      await tx('readwrite', (s) => s.delete(id));
      await persist();
      emit();
    },

    async clear() {
      items.forEach((a) => URL.revokeObjectURL(a.url));
      items = [];
      await tx('readwrite', (s) => s.clear());
      emit();
    },

    update(id, patch) {
      const a = items.find((x) => x.id === id);
      if (!a) return;
      Object.assign(a, patch);
      tx('readwrite', (s) => s.put(record(a, items.indexOf(a))));
    },

    setHero(id) {
      items.forEach((a) => (a.hero = a.id === id ? !a.hero : false));
      persist();
      emit();
    },

    move(from, to) {
      if (from === to || to < 0 || to >= items.length) return;
      const [a] = items.splice(from, 1);
      items.splice(to, 0, a);
      persist();
      emit();
    },

    get(id) { return items.find((x) => x.id === id) || null; },
    url(id) { const a = this.get(id); return a ? a.url : ''; },
    /* 給 AI 與使用者看的編號：圖 1…圖 5 */
    label(id) { const i = items.findIndex((x) => x.id === id); return i < 0 ? '' : '圖 ' + (i + 1); },
    hero() { const a = items.find((x) => x.hero); return a ? a.id : ''; },

    /* 縮小後轉 base64（送 AI 用 1024px） */
    async dataURL(id, maxSide, quality) {
      const a = this.get(id);
      if (!a) return '';
      const blob = maxSide ? (await downscale(a.blob, maxSide, quality || 0.82)).blob : a.blob;
      return blobToDataURL(blob);
    },

    /* 匯出簡報檔時一起打包 */
    async exportAll() {
      return Promise.all(items.map(async (a) => ({
        id: a.id, w: a.w, h: a.h, caption: a.caption, role: a.role, hero: a.hero, data: await blobToDataURL(a.blob),
      })));
    },

    async importAll(list) {
      await this.clear();
      for (const r of (list || []).slice(0, MAX)) {
        if (!r || typeof r.data !== 'string' || !/^data:image\//.test(r.data)) continue;
        const blob = await (await fetch(r.data)).blob();
        items.push({ id: r.id || 'a' + P.uid(), blob, url: URL.createObjectURL(blob), w: r.w || 0, h: r.h || 0, caption: r.caption || '', role: r.role || '', hero: !!r.hero });
      }
      await persist();
      emit();
    },

    /* 直接放入已產生的 Blob（示範圖片用） */
    async replaceWith(blobs) {
      await this.clear();
      for (const b of blobs.slice(0, MAX)) {
        items.push({ id: b.id || 'a' + P.uid(), blob: b.blob, url: URL.createObjectURL(b.blob), w: b.w, h: b.h, caption: b.caption || '', role: b.role || '', hero: !!b.hero });
      }
      await persist();
      emit();
    },
  };
})();

// 把 domain 的位置物件({type,...})編碼進 DOM dataset,供拖放/點選交換讀取。

export function locationDataset(loc) {
  if (loc.type === "court") {
    return { locType: "court", courtId: loc.courtId, area: loc.area, slotIndex: String(loc.slotIndex) };
  }
  return { locType: loc.type, index: loc.index === undefined ? "" : String(loc.index) };
}

export function parseLocationFromElement(el) {
  const ds = el.dataset;
  if (!ds.locType) return null;
  if (ds.locType === "court") {
    return { type: "court", courtId: ds.courtId, area: ds.area, slotIndex: Number(ds.slotIndex) };
  }
  return { type: ds.locType, index: ds.index === "" ? undefined : Number(ds.index) };
}

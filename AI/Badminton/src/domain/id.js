let seq = 0;

export function genId(prefix) {
  seq += 1;
  if (typeof crypto !== "undefined" && crypto.randomUUID) return `${prefix}_${crypto.randomUUID()}`;
  return `${prefix}_${Date.now()}_${seq}`;
}

import { test } from "node:test";
import assert from "node:assert/strict";
import { parseRoster } from "../domain/parser.js";

test("PRD §6.2 範例格式全部正確解析", () => {
  const text = [
    "1. 王小明 8",
    "2、陳大華／11",
    "03 李安",
    "Amy, 6",
    "Peter-9",
    "Jay",
  ].join("\n");
  const { entries, counts } = parseRoster(text, 6);
  assert.equal(entries.length, 6);
  assert.equal(entries[0].name, "王小明");
  assert.equal(entries[0].level, 8);
  assert.equal(entries[1].name, "陳大華");
  assert.equal(entries[1].level, 11);
  assert.equal(entries[2].name, "李安");
  assert.equal(entries[2].level, 6);
  assert.equal(entries[2].usedDefaultLevel, true);
  assert.equal(entries[3].name, "Amy");
  assert.equal(entries[3].level, 6);
  assert.equal(entries[3].usedDefaultLevel, false);
  assert.equal(entries[4].name, "Peter");
  assert.equal(entries[4].level, 9);
  assert.equal(entries[5].name, "Jay");
  assert.equal(entries[5].level, 6);
  assert.equal(entries[5].usedDefaultLevel, true);
  assert.equal(counts.defaultLevel, 2); // 李安、Jay 使用預設等級
});

test("驗收標準 #1:14 位混合格式名單,3 人無等級套用預設 6", () => {
  const lines = [];
  for (let i = 1; i <= 11; i += 1) {
    lines.push(`${i}. 球員${i} ${(i % 15) + 1}`);
  }
  lines.push("無等級A");
  lines.push("無等級B");
  lines.push("無等級C");
  const { entries, counts } = parseRoster(lines.join("\n"), 6);
  assert.equal(entries.length, 14);
  assert.equal(counts.defaultLevel, 3);
  for (const e of entries.slice(11)) {
    assert.equal(e.level, 6);
    assert.equal(e.usedDefaultLevel, true);
  }
});

test("超出 1-15 範圍的行尾數字不自動套用,標記需確認", () => {
  const { entries } = parseRoster("怪怪的人 99", 6);
  assert.equal(entries[0].level, 6);
  assert.equal(entries[0].usedDefaultLevel, true);
  assert.equal(entries[0].needsConfirm, true);
  assert.equal(entries[0].invalidLevelToken, 99);
});

test("完全相同姓名標記疑似重複但保留為獨立項目", () => {
  const { entries, counts } = parseRoster("小明 5\n小明 7", 6);
  assert.equal(entries.length, 2);
  assert.notEqual(entries[0].id, entries[1].id);
  assert.equal(entries[0].duplicate, true);
  assert.equal(entries[1].duplicate, true);
  assert.equal(counts.duplicate, 2);
});

test("空白行忽略,無法辨識姓名標記錯誤", () => {
  const { entries, counts } = parseRoster("\n\n   \n8\n", 6);
  // "8" 整行只剩數字,移除行首序號後("8"不含分隔符不會被當成序號)仍會被 trailing level 規則吃掉,name 變空
  assert.equal(entries.length, 1);
  assert.equal(entries[0].error, true);
  assert.equal(counts.error, 1);
});

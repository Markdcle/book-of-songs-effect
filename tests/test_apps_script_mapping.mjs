import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(process.argv[2], "utf8");

function runPost({ header, existingUuid = null, payload }) {
  let appended = null;
  const rangeCalls = [];
  const sheet = {
    getLastColumn: () => header.length,
    getLastRow: () => existingUuid ? 2 : 1,
    getRange: (row, column, rows, columns) => {
      rangeCalls.push([row, column, rows, columns]);
      if (row === 1) return { getValues: () => [header] };
      return { getValues: () => [[existingUuid]] };
    },
    appendRow: row => { appended = row; },
  };
  const sandbox = {
    LockService: {
      getScriptLock: () => ({ waitLock: () => {}, releaseLock: () => {} }),
    },
    ContentService: {
      MimeType: { JSON: "json" },
      createTextOutput: text => ({
        text,
        setMimeType() { return this; },
      }),
    },
  };
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox);
  sandbox.getSheet_ = () => sheet;
  const result = sandbox.doPost({
    postData: { contents: JSON.stringify(payload) },
  });
  return { appended, rangeCalls, result };
}

const reorderedHeader = [
  "comparison_1_choice",
  "uuid",
  "timestamp",
  "rating_order",
  "opponent_group",
  "baseline_likert_semantic_fidelity",
];
const payload = {
  uuid: "participant-1",
  timestamp: "2026-07-26T00:00:00.000Z",
  comparison_1_choice: "narrative",
  rating_order: "baseline>narrative",
  baseline_likert_semantic_fidelity: 4,
};
const inserted = runPost({ header: reorderedHeader, payload });
assert.deepEqual(inserted.appended, [
  "narrative",
  "participant-1",
  "2026-07-26T00:00:00.000Z",
  "baseline>narrative",
  "",
  4,
]);

const duplicate = runPost({
  header: reorderedHeader,
  existingUuid: "participant-1",
  payload,
});
assert.equal(duplicate.appended, null);
assert.equal(JSON.parse(duplicate.result.text).dedup, true);
assert.ok(
  duplicate.rangeCalls.some(call =>
    call[0] === 2 && call[1] === reorderedHeader.indexOf("uuid") + 1
  ),
  "UUID lookup did not follow the reordered header",
);

console.log("ALL APPS SCRIPT HEADER-MAPPING CHECKS PASSED");

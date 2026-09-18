const assert = require("node:assert/strict");
const { describe, it } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");

const MAIN_JS = path.join(__dirname, "..", "src", "main.js");

describe("main ball physics wiring", () => {
  it("routes tick movement through the shared movement controller", () => {
    const source = fs.readFileSync(MAIN_JS, "utf8");
    assert.ok(
      source.includes("get roam() { return movementController || _roam; }"),
      "tick context should use movementController so physics themes get tick integration"
    );
  });

  it("keeps physics themes active regardless of the freeRoam preference", () => {
    const source = fs.readFileSync(MAIN_JS, "utf8");
    assert.ok(
      source.includes("const physicsActive = isPhysicsThemeActive();"),
      "physics themes should opt into their movement driver automatically"
    );
    assert.ok(
      !source.includes("const physicsActive = movementEnabled && isPhysicsThemeActive();"),
      "physics movement must not be gated by the legacy freeRoam toggle"
    );
  });
});

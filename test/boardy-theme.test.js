"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const themeLoader = require("../src/theme-loader");
const { collectRequiredAssetFiles } = require("../src/theme-schema");

themeLoader.init(path.join(__dirname, "..", "src"));

const THEME_DIR = path.join(__dirname, "..", "themes", "boardy");
const ASSETS_DIR = path.join(THEME_DIR, "assets");

function readAsset(filename) {
  return fs.readFileSync(path.join(ASSETS_DIR, filename), "utf8");
}

describe("built-in Boardy theme", () => {
  it("loads with the core states wired", () => {
    const theme = themeLoader.loadTheme("boardy", { strict: true });

    assert.strictEqual(theme.name, "Boardy");
    assert.strictEqual(theme._builtin, true);
    assert.strictEqual(theme.schemaVersion, 1);
    assert.deepStrictEqual(theme.states.idle, ["boardy-idle.svg"]);
    assert.deepStrictEqual(theme.states.thinking, ["boardy-thinking.svg"]);
    assert.deepStrictEqual(theme.states.working, ["boardy-working.svg"]);
    assert.deepStrictEqual(theme.states.attention, ["boardy-attention.svg"]);
    assert.deepStrictEqual(theme.states.juggling, ["boardy-juggling.svg"]);
    assert.deepStrictEqual(theme.states.error, ["boardy-error.svg"]);
    assert.deepStrictEqual(theme.states.notification, ["boardy-notification.svg"]);
  });

  it("ships every referenced production asset as sanitized SVG", () => {
    const theme = themeLoader.loadTheme("boardy", { strict: true });
    const referenced = collectRequiredAssetFiles(theme);

    for (const filename of referenced) {
      assert.ok(fs.existsSync(path.join(ASSETS_DIR, filename)), `${filename} should exist`);
      const asset = readAsset(filename);
      assert.match(asset, /<svg[\s>]/, `${filename} should be SVG`);
      assert.doesNotMatch(asset, /<script|javascript:|(?:href|src)=["']https?:/i, `${filename} should not embed scripts or remote refs`);
    }
  });

  it("keeps eye tracking wired for the idle state", () => {
    const theme = themeLoader.loadTheme("boardy", { strict: true });

    for (const stateName of theme.eyeTracking.states) {
      const files = theme.states[stateName] || (theme.miniMode && theme.miniMode.states && theme.miniMode.states[stateName]);
      assert.ok(files, `${stateName} should map to at least one file`);
      for (const filename of files) {
        const asset = readAsset(filename);
        assert.match(asset, /id="eyes-js"/, `${filename} should expose eyes-js`);
        assert.match(asset, /id="body-js"/, `${filename} should expose body-js`);
        assert.match(asset, /id="shadow-js"/, `${filename} should expose shadow-js`);
      }
    }
  });

  it("marks the wide states with a wide hitbox", () => {
    const theme = themeLoader.loadTheme("boardy", { strict: true });

    assert.ok(theme.hitBoxes.wide);
    assert.deepStrictEqual(theme.wideHitboxFiles, ["boardy-error.svg", "boardy-notification.svg"]);
  });

  it("has a full sleep sequence with a dedicated sleeping hitbox", () => {
    const theme = themeLoader.loadTheme("boardy", { strict: true });

    assert.strictEqual(theme.sleepSequence.mode, "full");
    assert.deepStrictEqual(theme.states.sleeping, ["boardy-sleeping.svg"]);
    assert.deepStrictEqual(theme.states.yawning, ["boardy-yawning.svg"]);
    assert.deepStrictEqual(theme.states.dozing, ["boardy-dozing.svg"]);
    assert.deepStrictEqual(theme.states.collapsing, ["boardy-collapsing.svg"]);
    assert.deepStrictEqual(theme.states.waking, ["boardy-waking.svg"]);
    assert.ok(theme.hitBoxes.sleeping);
    assert.deepStrictEqual(theme.sleepingHitboxFiles, ["boardy-sleeping.svg", "boardy-collapsing.svg"]);
    assert.ok(theme.eyeTracking.states.includes("dozing"));
  });

  it("has sweeping and carrying action states", () => {
    const theme = themeLoader.loadTheme("boardy", { strict: true });

    assert.deepStrictEqual(theme.states.sweeping, ["boardy-sweeping.svg"]);
    assert.deepStrictEqual(theme.states.carrying, ["boardy-carrying.svg"]);
  });

  it("has working and juggling tiers", () => {
    const theme = themeLoader.loadTheme("boardy", { strict: true });

    assert.deepStrictEqual(theme.workingTiers.map((tier) => tier.file), [
      "boardy-building.svg",
      "boardy-groove.svg",
      "boardy-working.svg",
    ]);
    assert.deepStrictEqual(theme.jugglingTiers.map((tier) => tier.file), [
      "boardy-dizzy.svg",
      "boardy-groove.svg",
    ]);
  });

  it("has idle animations and reactions", () => {
    const theme = themeLoader.loadTheme("boardy", { strict: true });

    assert.strictEqual(theme.idleAnimations.length, 2);
    assert.strictEqual(theme.reactions.drag.file, "boardy-react-drag.svg");
    assert.strictEqual(theme.reactions.clickLeft.file, "boardy-react-left.svg");
    assert.strictEqual(theme.reactions.clickRight.file, "boardy-react-right.svg");
    assert.strictEqual(theme.reactions.annoyed.file, "boardy-react-annoyed.svg");
    assert.deepStrictEqual(theme.reactions.double.files, ["boardy-react-double.svg"]);
  });

  it("supports mini mode with all required states", () => {
    const theme = themeLoader.loadTheme("boardy", { strict: true });

    assert.strictEqual(theme.miniMode.supported, true);
    assert.deepStrictEqual(theme.miniMode.states["mini-idle"], ["boardy-mini-idle.svg"]);
    assert.deepStrictEqual(theme.miniMode.states["mini-enter"], ["boardy-mini-enter.svg"]);
    assert.deepStrictEqual(theme.miniMode.states["mini-peek"], ["boardy-mini-peek.svg"]);
    assert.deepStrictEqual(theme.miniMode.states["mini-alert"], ["boardy-mini-alert.svg"]);
    assert.deepStrictEqual(theme.miniMode.states["mini-happy"], ["boardy-mini-happy.svg"]);
    assert.deepStrictEqual(theme.miniMode.states["mini-sleep"], ["boardy-mini-sleep.svg"]);
    assert.deepStrictEqual(theme.miniMode.states["mini-enter-sleep"], ["boardy-mini-enter-sleep.svg"]);
    assert.deepStrictEqual(theme.miniMode.states["mini-crabwalk"], ["boardy-mini-hop.svg"]);
    assert.deepStrictEqual(theme.miniMode.states["mini-working"], ["boardy-mini-working.svg"]);
    assert.ok(theme.eyeTracking.states.includes("mini-idle"));
  });
});

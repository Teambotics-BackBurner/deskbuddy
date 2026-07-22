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
});

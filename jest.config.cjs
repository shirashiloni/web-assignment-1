const { createDefaultPreset } = require("ts-jest");

const defaultPreset = createDefaultPreset({ useESM: true });

/** @type {import("jest").Config} **/
module.exports = {
  ...defaultPreset,
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    ...defaultPreset.transform,
  },
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
};
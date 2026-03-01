const path = require("path");
const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

module.exports = createJestConfig({
  testEnvironment: "jsdom",
  setupFilesAfterEnv: [path.join(__dirname, "jest.setup.js")],
});
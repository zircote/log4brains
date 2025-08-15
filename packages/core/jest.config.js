const { pathsToModuleNameMapper } = require("ts-jest");
const base = require("../../jest.config.base");
const { compilerOptions } = require("./tsconfig");
const packageJson = require("./package");

module.exports = {
  ...base,
  displayName: packageJson.name,
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: "<rootDir>/"
  }),
  setupFiles: ["<rootDir>/src/polyfills.ts"]
};

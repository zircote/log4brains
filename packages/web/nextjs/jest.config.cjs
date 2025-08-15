const base = require("../../../jest.config.base");
const packageJson = require("../package.json");

module.exports = {
  ...base,
  preset: "ts-jest",
  displayName: packageJson.name,
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        diagnostics: false,
        tsconfig: {
          jsx: "react-jsx",
          isolatedModules: true
        }
      }
    ]
  }
};

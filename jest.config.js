module.exports = {
  "clearMocks": true,
  "coverageDirectory": "../coverage",
  "resetMocks": true,
  "restoreMocks": true,
  "rootDir": "./src",
  "testEnvironment": "jsdom",
  "preset": "ts-jest",
  "coveragePathIgnorePatterns": ["Error.ts"],
  "testEnvironmentOptions": {
    "resources": "usable",
    "features": {
      "FetchExternalResources": ["script", "iframe"],
      "ProcessExternalResources": ["script", "iframe"],
    }
  }
}

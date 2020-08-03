module.exports = {
  "clearMocks": true,
  "coverageDirectory": "../coverage",
  // `resetMocks` resets reusable spies from __mocks__ to no-op implementation
  // see: https://stackoverflow.com/a/63191062/2650622 for more details
  "resetMocks": false,
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

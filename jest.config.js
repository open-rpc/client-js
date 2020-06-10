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
    "features": {
      "FetchExternalResources": ["script", "iframe"],
      "ProcessExternalResources": ["script", "iframe"],
    }
  }
}

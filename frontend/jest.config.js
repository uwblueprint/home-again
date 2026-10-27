// Pin the timezone so date handling is exercised the way our users experience it
// (Newfoundland, UTC-03:30) rather than on whatever the developer's machine is set
// to. Without this, off-by-one date bugs pass locally in UTC and fail in prod.
process.env.TZ = "America/St_Johns";

/** @type {import("jest").Config} **/
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.jest.json",
      },
    ],
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^@common/(.*)$": "<rootDir>/common/$1",
    "^next/image$": "<rootDir>/__mocks__/next/image.tsx",
  },
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
};

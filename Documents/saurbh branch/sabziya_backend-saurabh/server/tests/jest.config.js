module.exports = {
  testEnvironment: "node", 
  setupFilesAfterEnv: ["<rootDir>/setup.js"], 
  testMatch: ["**/tests/**/*.test.js"],
  forceExit: true, 
  clearMocks: true, 
  verbose: true, 
};

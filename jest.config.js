// @ts-check

/**
 * Jest configuration.
 *
 * The integration test loads the *built* JS bundle from `dist/` inside a jsdom
 * document, so it exercises the real webpack output rather than the source.
 * We therefore use the default `node` environment and construct jsdom manually
 * inside the test.
 */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
};

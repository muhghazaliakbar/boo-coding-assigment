'use strict';

module.exports = {
  env: {
    node: true,
    es2022: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'script',
  },
  overrides: [
    {
      files: ['test/**/*.js'],
      env: { jest: true },
      plugins: ['jest'],
      extends: ['plugin:jest/recommended'],
    },
  ],
  ignorePatterns: ['node_modules/', 'public/', 'views/'],
};

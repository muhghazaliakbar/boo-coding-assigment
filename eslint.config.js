'use strict';

const js = require('@eslint/js');
const globals = require('globals');
const jestPlugin = require('eslint-plugin-jest');

module.exports = [
  { ignores: ['node_modules/', 'public/', 'views/'] },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: { ...globals.node },
    },
  },
  {
    files: ['test/**/*.js'],
    languageOptions: {
      globals: { ...globals.node, ...globals.jest },
    },
    plugins: { jest: jestPlugin },
    rules: { ...jestPlugin.configs.recommended.rules },
  },
];

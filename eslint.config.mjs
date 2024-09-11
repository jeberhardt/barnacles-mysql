import globals from 'globals';
import pluginJs from '@eslint/js';
import mochaPlugin from 'eslint-plugin-mocha';

import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default [
  {
    files: ['**/*.js'],
    languageOptions: {sourceType: 'commonjs'},
  },
  {languageOptions: {globals: globals.node}},
  pluginJs.configs.recommended,
  mochaPlugin.configs.flat.recommended,
  eslintPluginPrettierRecommended,
];

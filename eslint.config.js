import base from '@cto.af/eslint-config';
import globals from '@cto.af/eslint-config/globals.js';
import jsdoc_ts from '@cto.af/eslint-config/jsdoc_ts.js';
import markdown from '@cto.af/eslint-config/markdown.js';
import mod from '@cto.af/eslint-config/module.js';
import ts from '@cto.af/eslint-config/ts.js';

export default [
  {
    ignores: [
      'lib/**',
      'calldds.js',
      'ddummy6.cjs',
    ],
  },
  {
    files: ['**/*.js', '**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
  ...base,
  ...mod,
  ...ts,
  ...jsdoc_ts,
  ...markdown,
];

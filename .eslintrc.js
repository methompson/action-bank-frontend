module.exports = {
  extends: [
    'react-app',
    'react-app/jest',
  ],
  rules: {
    'eqeqeq': [ 'error' ],
    'semi': 'off',
    'no-trailing-spaces': ['error', {}],
    'no-multi-spaces': 'error',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/require-await': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/semi': ['error'],
    '@typescript-eslint/ban-types': ['error'],
  }
};
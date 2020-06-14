module.exports = {
  env: {
    node: true,
    es6: true,
  },
  extends: ['airbnb', 'prettier', 'plugin:jest/recommended', 'jest-enzyme'],
  plugins: ['prettier'],
  globals: {
    fetch: true,
    window: true,
    document: true,
    history: true,
    localStorage: true,
  },
  parser: 'babel-eslint',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    'react/prop-types': 0,
    camelcase: 0,
    'import/extensions': 0,
    'import/no-unresolved': 0,
    'react/jsx-filename-extension': [
      1,
      {
        extensions: ['.js', '.jsx'],
      },
    ],
    'no-underscore-dangle': [0], // we use underscore dangling for some globals like __DEV__
    'arrow-parens': 'off', // incompatible with prettier
    'object-curly-newline': 'off', // incompatible with prettier
    'no-mixed-operators': 'off', // incompatible with prettier
    'function-paren-newline': 'off', // incompatible with prettier
    // 'react/destructuring-assignment': [1],
    // 'react-hooks/exhaustive-deps': [1],
  },
};

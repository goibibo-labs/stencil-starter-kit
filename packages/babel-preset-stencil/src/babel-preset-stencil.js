module.exports = () => ({
  presets: ['@babel/preset-typescript', '@babel/preset-react', '@babel/preset-env'],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-transform-runtime',
    [
      'babel-plugin-styled-components',
      {pure: true, minify: false, transpileTemplateLiterals: false, displayName: true},
    ],
    // 'babel-plugin-import',
    '@babel/plugin-proposal-optional-chaining',
  ],
});

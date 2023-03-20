module.exports = {
  extends: ['wesbos'],
  env: {
    es6: true,
    browser: true,
  },
  plugins: ['only-warn'],
  overrides: [
    {
      files: ['*.js', '*.ts'],
      extends: ['wesbos'],
    },
  ],
};

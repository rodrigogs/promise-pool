module.exports = {
  extends: 'airbnb-base',
  plugins: [
    'import',
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
  },
  globals: {
    expect: true,
    process: true,
    describe: true,
    before: true,
    after: true,
    beforeEach: true,
    suite: true,
    test: true,
    it: true,
  },
};

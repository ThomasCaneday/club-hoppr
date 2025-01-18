export default {
  root: true,
  env: {
    node: true,
    es2022: true,  // or es2021
  },
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    sourceType: 'module',  // now using ES modules
  },
  rules: {
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
  },  
};
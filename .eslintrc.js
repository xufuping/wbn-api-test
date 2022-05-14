module.exports = {
  root: true,
  env: {
    es6: true,
    browser: true
  },
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 6,
    ecmaFeatures: {
      legacyDecorators: true
    }
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  globals: {
    // jest variables
    jest: true,
    expect: true,
    describe: true,
    it: true
  },
  rules: {
    // import log from @mp/shared instead
    'no-console': 'error',
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': [
      'error',
      {
        functions: false,
        ignoreTypeReferences: true,
        variables: false
      }
    ],
    curly: 'error',
    'no-empty': ['error', { allowEmptyCatch: true }],
    'max-params': ['warn', 3],
    'prefer-template': 'error',
    'object-curly-spacing': ['error', 'always'],
    'no-unused-expressions': ['error', { allowShortCircuit: false }],
    'no-case-declarations': 'warn',
    'default-case': 'error',
    'no-invalid-this': 'off',
    '@typescript-eslint/no-explicit-any': ['error'],
    '@typescript-eslint/no-invalid-this': ['error'],
    '@typescript-eslint/ban-ts-comment': [
      'error',
      {
        'ts-nocheck': false,
        'ts-check': false,
        'ts-ignore': 'allow-with-description',
        'ts-expect-error': false
      }
    ]
  },
  overrides: [
    {
      files: ['*.vue'],
      parser: 'vue-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser'
      },
      extends: ['plugin:vue/vue3-essential'],
      rules: {
        'vue/no-reserved-keys': 'off'
      }
    },
    {
      files: ['packages/types/src/*'],
      rules: {
        'no-restricted-syntax': [
          'error',
          {
            selector: 'TSEnumDeclaration',
            message: "Don't declare enums, please move to @mp/runtime-shared"
          }
        ]
      }
    }
  ]
};

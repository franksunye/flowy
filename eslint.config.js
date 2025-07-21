import js from '@eslint/js';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  // Base configuration for all files
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        global: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        require: 'readonly',
        // jQuery
        $: 'readonly',
        jQuery: 'readonly',
        // Node.js globals
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        // Jest globals
        describe: 'readonly',
        test: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
        // Custom test globals
        cleanupTestEnvironment: 'readonly',
        createTestCanvas: 'readonly',
        createTestDragElement: 'readonly',
        setTimeout: 'readonly',
        flowy: 'readonly',
      },
    },
    plugins: {
      prettier,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...prettierConfig.rules,

      // Prettier integration
      'prettier/prettier': 'error',

      // Code quality rules (relaxed for existing codebase)
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-var': 'warn', // Changed to warn for gradual migration
      'prefer-const': 'warn', // Changed to warn for gradual migration
      'prefer-arrow-callback': 'off', // Disabled for existing code
      'prefer-template': 'off', // Disabled for existing code

      // Best practices (relaxed)
      eqeqeq: 'warn', // Changed to warn for gradual migration
      curly: ['error', 'all'],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-return-assign': 'error',
      'no-self-compare': 'error',
      'no-sequences': 'error',
      'no-throw-literal': 'error',
      'no-unmodified-loop-condition': 'error',
      'no-unused-expressions': 'error',
      'no-useless-call': 'error',
      'no-useless-concat': 'error',
      'no-useless-return': 'error',
      radix: 'warn', // Changed to warn for gradual migration
      yoda: 'error',

      // ES6+ features (relaxed for existing codebase)
      'arrow-body-style': 'off', // Disabled for existing code
      'no-duplicate-imports': 'error',
      'no-useless-constructor': 'error',
      'object-shorthand': 'warn', // Changed to warn for gradual migration
      'prefer-destructuring': 'warn', // Changed to warn for gradual migration
      'prefer-rest-params': 'warn', // Changed to warn for gradual migration
      'prefer-spread': 'warn', // Changed to warn for gradual migration
    },
  },

  // Specific rules for test files
  {
    files: ['tests/**/*.js'],
    rules: {
      'no-console': 'off', // Allow console in tests
    },
  },

  // Specific rules for config files
  {
    files: ['*.config.js', 'eslint.config.js'],
    rules: {
      'no-console': 'off', // Allow console in config files
    },
  },

  // Ignore patterns
  {
    ignores: [
      'node_modules/',
      'dist/',
      'coverage/',
      'docs/',
      '*.tmp',
      '*.temp',
    ],
  },
];

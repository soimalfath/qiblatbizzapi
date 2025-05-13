module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/naming-convention': [
      'error',
      {
        // Aturan penamaan untuk Interface
        selector: 'interface',
        format: ['PascalCase'],
        prefix: ['I'], // Menambahkan prefix 'I' untuk interface
      },
      {
        "selector": "default",
        "format": ["camelCase"]
      },
      {
        // Aturan penamaan untuk Enum
        selector: 'enum',
        format: ['PascalCase'],
        prefix: ['E'], // Menambahkan prefix 'E' untuk enum
      },
      {
        selector: "function",
        format: ["camelCase"] // Memaksa camelCase untuk fungsi
      },
      {
        selector: "variable",
        format: ["camelCase"], // camelCase untuk variabel, PascalCase untuk class, UPPER_CASE untuk konstanta
        leadingUnderscore: "allow" // Optional: izinkan _prefix untuk private variables
      },
      {
        selector: "parameter",
        format: ["camelCase"],
        leadingUnderscore: "allow"
      },
      // ✅ Private member (e.g. this._service) → camelCase dengan underscore
      {
        selector: "memberLike",
        modifiers: ["private"],
        format: ["camelCase"],
        leadingUnderscore: "require"
      },
      // ✅ Class, Interface, Type → PascalCase
      {
        selector: "typeLike",
        format: ["PascalCase"]
      },
      // ✅ Enum → PascalCase
      {
        selector: "enum",
        format: ["PascalCase"]
      },
      // ✅ Enum members → UPPER_CASE (optional)
      {
        selector: "enumMember",
        format: ["UPPER_CASE"]
      },
      // ✅ DTO properties (optional — allow snake_case for API contracts)
      {
        selector: "property",
        modifiers: ["public"],
        format: ["camelCase", "snake_case"]
      }
    ],
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
      },
    ],
  },
};

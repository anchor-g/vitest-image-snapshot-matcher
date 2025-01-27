import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import vitestPlugin from 'eslint-plugin-vitest';
import prettierConfig from 'eslint-config-prettier';
import prettierPluginRecommended from 'eslint-plugin-prettier/recommended';

export default [
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    prettierConfig,
    prettierPluginRecommended,
    {
        files: ['**/*.test.ts', '**/*.spec.ts'],
        plugins: {
            vitest: vitestPlugin,
        },
        rules: {
            ...vitestPlugin.configs.all.rules,
            'vitest/no-hooks': 'off',
            'vitest/no-focused-tests': ['error', { fixable: false }],
            'vitest/prefer-expect-assertions': 'off',
        },
    },
    {
        ignores: ['lib/*'],
        rules: {
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],
        },
    },
];

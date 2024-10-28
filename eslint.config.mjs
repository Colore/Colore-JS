import { configs } from '@tyisi/config-eslint'
import tsdoceslint from 'eslint-plugin-tsdoc'

export default [
    ...configs.ts,
    {
        files: ['**/*.ts'],

        rules: {
            '@typescript-eslint/strict-boolean-expressions': 'error',

            '@typescript-eslint/no-explicit-any': [
                'error',
                {
                    fixToUnknown: true
                }
            ],

            '@typescript-eslint/naming-convention': [
                'error',
                {
                    selector: 'default',
                    format: ['camelCase'],
                    leadingUnderscore: 'allowSingleOrDouble',
                    modifiers: ['unused']
                }
            ],

            'class-methods-use-this': 'off',
            '@typescript-eslint/class-methods-use-this': 'off',

            '@typescript-eslint/no-redundant-type-constituents': 'off',

            'import/no-dynamic-require': 'off',
            '@typescript-eslint/no-require-imports': 'off'
        },

        settings: {
            'import/parsers': {
                '@typescript-eslint/parser': ['.ts', '.tsx']
            },
            'import/resolver': {
                typescript: {
                    project: ['tsconfig.json', 'packages/colore-js/tsconfig.json']
                }
            }
        }
    },
    {
        files: ['**/*.js', '**/*.ts'],

        plugins: {
            tsdoc: tsdoceslint
        },

        rules: {
            'tsdoc/syntax': 'warn'
        }
    }
]

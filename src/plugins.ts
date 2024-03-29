import type { TSESLint } from '@typescript-eslint/utils'
import { version } from '../package.json'
import autoInsert from './rules/auto-insert'

export const plugin: TSESLint.Linter.Plugin = {
  meta: {
    name: 'unimport',
    version,
  },
  rules: {
    'auto-insert': autoInsert,
  },
}

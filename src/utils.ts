import { ESLintUtils } from '@typescript-eslint/utils'
import { relative } from 'pathe'

export const createRule = ESLintUtils.RuleCreator(() => 'https://github.com/antfu/eslint-plugin-unimport')

export function betterRelative(from: string, to: string) {
  const r = relative(from, to).replace(/\.[\w]+/g, '')
  if (r.startsWith('../'))
    return r
  return `./${r}`
}

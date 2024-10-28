import type { Linter } from 'eslint'
import type { Import } from 'unimport'
import { plugin } from '../plugins'

export interface UnimportAutoInsertOptions {
  /**
   * The imports registry.
   */
  imports: Import[]
  /**
   * Glob patterns to include
   *
   * @default ['**\/*.?([cm])[jt]s?(x)', '**\/*.vue']
   */
  include?: string[]
  /**
   * Glob patterns to exclude
   *
   * @default ['**\/*.md?(x)/**']
   */
  exclude?: string[]
}

/**
 * Create a flat config that will report missing imports from the unimport registry and auto insert them.
 */
export function createAutoInsert(options: UnimportAutoInsertOptions): Linter.FlatConfig {
  return {
    name: 'unimport:auto-insert',
    plugins: {
      unimport: plugin as any,
    },
    files: options.include ?? ['**/*.?([cm])[jt]s?(x)', '**/*.vue'],
    ignores: options.exclude ?? ['**/*.md?(x)/**'],
    rules: {
      'unimport/auto-insert': [
        'error',
        options.imports,
      ],
    },
  }
}

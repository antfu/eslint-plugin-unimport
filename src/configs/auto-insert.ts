import type { Import } from 'unimport'
import type { Linter } from 'eslint'
import { plugin } from '../plugins'

export interface UnimportAutoInsertOptions {
  /**
   * The imports registry.
   */
  imports: Import[]

  /**
   * Glob patterns to include
   */
  include?: string[]
  /**
   * Glob patterns to exclude
   */
  exclude?: string[]
}

/**
 * Create a flat config that will report missing imports from the unimport registry and auto insert them.
 */
export function createAutoInsert(options: UnimportAutoInsertOptions): Linter.FlatConfig {
  return {
    // @ts-expect-error Name is not yet in the types
    name: 'unimport:auto-insert',
    plugins: {
      unimport: plugin as any,
    },
    files: options.include ?? ['**/*.(m|c)?tsx?', '**/*.vue'],
    ignores: options.exclude ?? ['**/*.mdx?/**'],
    rules: {
      'unimport/auto-insert': [
        'error',
        options.imports,
      ],
    },
  }
}

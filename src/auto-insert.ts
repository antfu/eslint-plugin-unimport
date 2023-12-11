import { dirname, isAbsolute } from 'pathe'
import { createSimplePlugin } from 'eslint-factory'
import type { Import } from 'unimport'
import { betterRelative, createImportsListeners } from './utils'

export interface UnimportAutoInsertOptions {
  /**
   * Custom function to get imports registry.
   * This function will be called on every file and every time, the cache implementation is up to the user.
   *
   * @param filepath
   */
  getImports: (filepath: string) => Import[]

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
export function createAutoInsert(options: UnimportAutoInsertOptions) {
  return createSimplePlugin({
    name: 'unimport-auto-insert',
    include: options.include ?? ['**/*.(m|c)?tsx?', '**/*.vue'],
    exclude: options.exclude ?? ['**/*.mdx?/**'],
    severity: 'warn',
    create(context) {
      return createImportsListeners(
        context,
        options.getImports,
        (node, item) => {
          context.report({
            node,
            message: `Unimport entry '${node.name}' from '${item.from}' is not imported.`,
            fix(fixer) {
              const resolvedFrom = isAbsolute(item.from)
                ? betterRelative(dirname(context.physicalFilename), item.from)
                : item.from
              const body = context.sourceCode.ast.body
              const importName = item.name === '*'
                ? `* as ${item.as}`
                : item.name === 'default'
                  ? item.as
                  : (!item.as || item.name === item.as)
                      ? `{ ${item.name} }`
                      : `{ ${item.name} as ${item.as} }`
              return fixer.insertTextBefore(body[0], `import ${importName} from '${resolvedFrom}'\n`)
            },
          })
        },
      )
    },
  })
}

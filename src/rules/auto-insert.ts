import { dirname, isAbsolute } from 'pathe'
import { createImportsListeners } from '../listener'
import { betterRelative, createRule } from '../utils'

export default createRule({
  name: 'auto-insert',
  meta: {
    type: 'problem',
    docs: {
      description: 'Auto insert missing imports from unimport registry',
    },
    messages: {
      missingImport: `Unimport entry '{{name}}' from '{{from}}' is not imported.`,
    },
    schema: [
      { type: 'array', items: { type: 'any' } },
    ],
    fixable: 'code',
  },
  defaultOptions: [[]],
  create(context) {
    return createImportsListeners(
      context,
      context.options[0] || [],
      (node, item) => {
        context.report({
          node,
          messageId: 'missingImport',
          data: {
            name: item.name,
            from: item.from,
          },
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

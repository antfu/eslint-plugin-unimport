import { dirname, isAbsolute, relative } from 'pathe'
import type { Scope, ScopeManager } from '@typescript-eslint/scope-manager'
import { analyze } from '@typescript-eslint/scope-manager'
import type { TSESTree } from '@typescript-eslint/utils'
import { createSimplePlugin } from 'eslint-factory'
import type { Import } from 'unimport'
import type { RuleListener } from '@typescript-eslint/utils/ts-eslint'

export interface ESLintPluginUnimportOptions {
  getImports: (file: string) => Import[]

  /**
   * Whether to check vue component
   */
  vueComponent?: boolean

  /**
   * Glob patterns to include
   */
  include?: string[]
  /**
   * Glob patterns to exclude
   */
  exclude?: string[]
}

export function createUnimportConfig(options: ESLintPluginUnimportOptions) {
  return createSimplePlugin({
    name: 'unimport',
    include: options.include ?? ['**/*.(m|c)?tsx?', '**/*.vue'],
    exclude: options.exclude ?? ['**/*.mdx?/**'],
    severity: 'warn',
    create(context) {
      let _scopeManager: ScopeManager | undefined
      let _importsMap: Map<string, Import> | undefined
      const importedNames = new Set<string>()

      function getScopeManager() {
        if (!_scopeManager) {
          _scopeManager = analyze(context.sourceCode.ast as any, {
            sourceType: 'module',
          })

          _scopeManager.globalScope?.variables.forEach((node) => {
            importedNames.add(node.name)
          })
        }
        return _scopeManager
      }

      function getImportsMap() {
        if (!_importsMap) {
          _importsMap = new Map<string, Import>()

          options.getImports(context.filename)
            .forEach((i) => {
              _importsMap!.set(i.as || i.name, i)
            })
        }

        return _importsMap
      }

      function checkId(node: TSESTree.Identifier) {
        if (typeof node.name !== 'string')
          return
        // Already imported
        if (importedNames.has(node.name))
          return
        // We only care about the register unimport items
        const importsMap = getImportsMap()
        const item = importsMap.get(node.name)
        if (!item)
          return
        if (item.from === context.filename)
          return

        const scopeManager = getScopeManager()
        if (importedNames.has(node.name))
          return

        let parent: TSESTree.Node | undefined = node.parent
        let currentScope: Scope | null = null
        while (parent && !currentScope) {
          currentScope = scopeManager.acquire(parent)
          if (currentScope)
            break
          parent = parent.parent
        }
        if (!currentScope)
          currentScope = scopeManager.globalScope

        const visited = new Set()
        while (true) {
          if (!currentScope || visited.has(currentScope))
            break
          for (const ref of currentScope.variables) {
            if (ref.name === node.name)
              return
          }
          visited.add(currentScope)
          currentScope = currentScope.upper
        }

        importedNames.add(node.name)
        context.report({
          node,
          message: `Unimported auto-import entry '${node.name}'`,
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
      }

      const listener: RuleListener = {
        Identifier(node) {
          if (/Declaration|Specifier|Property/.test(node.parent.type))
            return
          // For member expression, we only check the first part
          if (node.parent.type === 'MemberExpression' && node.parent.object !== node)
            return
          checkId(node)
        },
        ImportDeclaration(node) {
          node.specifiers.forEach((s) => {
            importedNames.add(s.local.name)
          })
        },
        'Program:exit': function () {
          const vueTemplate = (context.sourceCode.ast as any).templateBody
          // Vue
          if (!vueTemplate)
            return

          function visit(node?: any) {
            if (!node)
              return
            const expressionNode = node as TSESTree.Expression
            switch (expressionNode.type) {
              case 'Identifier':
                checkId(expressionNode)
                return
              case 'MemberExpression':
                visit(expressionNode.object)
                return
              case 'CallExpression':
                visit(expressionNode.callee)
                for (const arg of expressionNode.arguments)
                  visit(arg)
                return
              case 'ConditionalExpression':
                visit(expressionNode.test)
                visit(expressionNode.consequent)
                visit(expressionNode.alternate)
                return
              case 'LogicalExpression':
              case 'BinaryExpression':
                visit(expressionNode.left)
                visit(expressionNode.right)
                return
            }

            switch (node.type) {
              case 'VText':
                return
              case 'VExpressionContainer':
                return visit(node.expression)
              case 'VElement':
                for (const attr of node.startTag.attributes)
                  visit(attr)
                for (const child of node.children)
                  visit(child)
                return
              case 'VAttribute':
                visit(node.value)
                return
            }

            if ('children' in node) {
              for (const child of node.children)
                visit(child)
            }

            {
              // eslint-disable-next-line unused-imports/no-unused-vars
              const { tokens, parent, range, loc, ...rest } = node
              console.warn('Unknown VNode', rest)
            }
          }

          visit(vueTemplate)
        },
      }

      return listener
    },
  })
}

function betterRelative(from: string, to: string) {
  const r = relative(from, to).replace(/\.[\w]+/g, '')
  if (r.startsWith('../'))
    return r
  return `./${r}`
}

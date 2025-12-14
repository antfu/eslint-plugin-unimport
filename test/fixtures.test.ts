import type { Linter } from 'eslint'
import type { UnimportAutoInsertOptions } from '../src'
import { join, resolve } from 'node:path'
import { execa } from 'execa'
import fg from 'fast-glob'
import fs from 'fs-extra'
import { createUnimport } from 'unimport'
import { afterAll, beforeAll, it } from 'vitest'

beforeAll(async () => {
  await fs.rm('_fixtures', { recursive: true, force: true })
})
afterAll(async () => {
  await fs.rm('_fixtures', { recursive: true, force: true })
})

runWithConfig('basic', {
})

function runWithConfig(name: string, configs: Partial<UnimportAutoInsertOptions>, ...items: Linter.FlatConfig[]) {
  it.concurrent(name, async ({ expect }) => {
    const from = resolve(__dirname, 'fixtures/input')
    const output = resolve(__dirname, 'fixtures/output', name)
    const target = resolve('_fixtures', name)

    await fs.copy(from, target, {
      filter: (src) => {
        return !src.includes('node_modules')
      },
    })

    const ctx = createUnimport({
      dirs: [
        target,
      ],
      presets: [
        'vue',
        'vue-router',
      ],
    })

    await ctx.init()

    await fs.writeFile(join(target, 'eslint.config.js'), `
// @eslint-disable
import { vue, combine } from '@antfu/eslint-config'
import { createAutoInsert } from 'eslint-plugin-unimport'
import pluginImport from 'eslint-plugin-import-x'
import pluginUnusedImports from 'eslint-plugin-unused-imports'

export default combine(
  vue(),
  createAutoInsert({
    ...${JSON.stringify(configs)},
    imports: ${JSON.stringify(await ctx.getImports() ?? [])}
  }),
  {
    plugins: {
      'unused-imports': pluginUnusedImports,
      'import': pluginImport,
    },
    rules: {
      'unused-imports/no-unused-imports': 'error',
      'import/no-duplicates': 'error',
    },
  },
  ...${JSON.stringify(items || [])},
)
  `)

    await execa('npx', ['eslint', '.', '--fix'], {
      cwd: target,
      stdio: 'inherit',
    })

    const files = await fg('**/*', {
      ignore: [
        'node_modules',
        'eslint.config.js',
      ],
      cwd: target,
    })

    await Promise.all(files.map(async (file) => {
      const content = await fs.readFile(join(target, file), 'utf-8')
      // const source = await fs.readFile(join(from, file), 'utf-8')
      const outputPath = join(output, file)
      // if (content === source) {
      //   if (fs.existsSync(outputPath))
      //     fs.remove(outputPath)
      //   return
      // }
      await expect.soft(content).toMatchFileSnapshot(outputPath)
    }))
  }, 30_000)
}

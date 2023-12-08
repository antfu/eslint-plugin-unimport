// @ts-check
import antfu from '@antfu/eslint-config'
import { createUnimport } from 'unimport'
import { createUnimportConfig } from 'eslint-plugin-unimport'

const unimport = createUnimport({
  presets: [
    'vue',
    'vue-router',
  ],
})

await unimport.init()
const imports = await unimport.getImports()

export default antfu(
  {
    ignores: ['**/fixtures/**'],
    vue: true,
  },
  createUnimportConfig({
    getImports: () => imports,
  }),
)

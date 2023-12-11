// @ts-check
import antfu from '@antfu/eslint-config'
import { createUnimport } from 'unimport'
import { createAutoInsert } from './src'

export default (async () => {
  const unimport = createUnimport({
    presets: [
      'vue',
      'vue-router',
    ],
  })

  await unimport.init()
  const imports = await unimport.getImports()

  return antfu(
    {
      ignores: ['**/fixtures/**'],
      vue: true,
    },
    createAutoInsert({
      getImports: () => imports,
    }),
  )
})()

# eslint-plugin-unimport

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

Insert imports automatically from Unimport in ESLint.

## Usages

### With Nuxt

You can use the [`nuxt-eslint-auto-explicit-import`](https://github.com/antfu/nuxt-eslint-auto-explicit-import) module directly, which integrates this plugin.

### With `unplugin-auto-import`

In your `vite.config.ts`:

```ts
import AutoImport from 'unplugin-auto-import/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    AutoImport({
      // other options...
      dumpUnimportItems: true // <---
    })
  ]
})
```

And in your `eslint.config.js`:

```js
import fs from 'node:fs'
import { createAutoInsert } from 'eslint-plugin-unimport'

export default [
  // your other configs...
  createAutoInsert({
    imports: JSON.parse(fs.readFileSync('.unimport-items.json', 'utf-8'))
  }),
]
```

### Setup Manually

Refer to [this file](./eslint.config.ts), where you can create your temporary unimport instance and use it to insert imports.

## Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg'/>
  </a>
</p>

## License

[MIT](./LICENSE) License © 2023-PRESENT [Anthony Fu](https://github.com/antfu)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/eslint-plugin-unimport?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/eslint-plugin-unimport
[npm-downloads-src]: https://img.shields.io/npm/dm/eslint-plugin-unimport?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/eslint-plugin-unimport
[bundle-src]: https://img.shields.io/bundlephobia/minzip/eslint-plugin-unimport?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=eslint-plugin-unimport
[license-src]: https://img.shields.io/github/license/antfu/eslint-plugin-unimport.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/antfu/eslint-plugin-unimport/blob/main/LICENSE
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669
[jsdocs-href]: https://www.jsdocs.io/package/eslint-plugin-unimport

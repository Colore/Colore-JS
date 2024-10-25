import { defineConfig, type Options } from 'tsup'

const getExt: Options['outExtension'] = ({ format }) => {
    let ext = 'js'

    if (format === 'cjs') ext = 'cjs'
    if (format === 'esm') ext = 'mjs'

    return { js: `.${ext}` }
}

const options: Options = {
    entry: ['src/**/*.ts'],
    splitting: false,
    sourcemap: false,
    clean: false,
    dts: false,
    outExtension: getExt,
    shims: true,
}

export default defineConfig(options)

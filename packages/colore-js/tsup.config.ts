import { defineConfig, type Options } from 'tsup'

const buildEnv = process.env.NODE_ENV ?? 'development'

const getExt: Options['outExtension'] = ({ format }) => {
    let ext = 'js'

    if (format === 'cjs') ext = 'cjs'
    if (format === 'esm') ext = 'mjs'

    return { js: `.${ext}` }
}

const options: Options = {
    entry: ['src/**/*.ts'],
    outDir: './dist',
    splitting: false,
    sourcemap: false,
    clean: false,
    dts: false,
    outExtension: getExt,
    shims: true,
    minify: buildEnv === 'production',
    bundle: buildEnv === 'production'
}

export default defineConfig(options)

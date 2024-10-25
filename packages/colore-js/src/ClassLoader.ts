import fs from 'node:fs'
import path from 'node:path'
import { inspect } from 'node:util'
import { type IRequestAdapter } from './Interfaces'
import Logger from './Logger'

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ClassLoader {
    protected static loadingPaths: Record<string, string> = { Colore: path.dirname(path.resolve(__filename)) }
    protected static loadingPathsNameCache: string[] = ['Colore']
    // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
    protected static importCache: { [x: string]: Record<string, (requestObject: IRequestAdapter) => void> } = {}
    protected static settled: boolean = false
    // @ts-expect-error nonexist
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    protected static useImport: boolean = process.moduleLoadList.includes('NativeModule internal/modules/esm/loader')

    protected static async importClassFile(loadPath: string): Promise<Record<string, object>> {
        Logger.trace('importing from %s', loadPath)

        if (ClassLoader.importCache[loadPath] == null) {
            const loadPathFiles = [`${loadPath}.mjs`, `${loadPath}.js`, `${loadPath}.ts`]

            Logger.trace(`loadPathFiles: %s`, JSON.stringify(loadPathFiles))

            for (const loadPathFile of loadPathFiles) {
                Logger.notice(`Considering file: %s`, loadPathFile)
                if (fs.existsSync(loadPathFile)) {
                    Logger.notice(`Trying file: %s`, loadPathFile)
                    ClassLoader.importCache[loadPath] = await import(loadPathFile)
                }
            }
        }

        Logger.notice(`ClassLoader.importCache[loadPath]: %s`, JSON.stringify(ClassLoader.importCache[loadPath]))

        if (ClassLoader.importCache[loadPath] == null) throw new Error(`Unknown error importing ${loadPath}`)

        return ClassLoader.importCache[loadPath] as Record<string, object>
    }

    protected static async requireClassFile(loadPath: string, classChunk: string): Promise<Record<string, object>> {
        return await new Promise((resolve, reject) => {
            Logger.trace('requiring from %s', loadPath)

            if (ClassLoader.importCache[loadPath] == null) {
                const loadPathFiles = [`${loadPath}.cjs`, `${loadPath}.js`]

                Logger.trace(`loadPathFiles: %s:`, JSON.stringify(loadPathFiles))

                for (const loadPathFile of loadPathFiles) {
                    Logger.notice(`Considering file: %s`, loadPathFile)
                    if (fs.existsSync(loadPathFile)) {
                        Logger.notice(`Trying file: %s`, loadPathFile)
                        ClassLoader.importCache[loadPath] = require(loadPathFile)
                    }
                }
            }

            Logger.notice(`ClassLoader.importCache[loadPath]: %s`, inspect(ClassLoader.importCache[loadPath]))

            if (
                ClassLoader.importCache[loadPath] == null ||
                typeof ClassLoader.importCache[loadPath] !== 'object' ||
                !Object.getOwnPropertyNames(ClassLoader.importCache[loadPath]).includes(classChunk)
            )
                reject(new Error(`Unknown error importing ${loadPath}`))

            Logger.trace('final ClassLoader.importCache[loadPath]: %s', inspect(ClassLoader.importCache[loadPath]))

            resolve(ClassLoader.importCache[loadPath] as Record<string, object>)
        })
    }

    public static addBasePath(namespace: string, sourcePath: string): void {
        if (ClassLoader.loadingPaths[namespace] != null) throw new Error('Namespace already set')

        // Expect fully resolved paths here
        ClassLoader.loadingPaths[namespace] = path.resolve(sourcePath)

        ClassLoader.loadingPathsNameCache = Object.keys(ClassLoader.loadingPaths).sort((a, b) => b.length - a.length)
    }

    public static async loadClass(classPath: string): Promise<object> {
        const loadingPathKey = ClassLoader.loadingPathsNameCache.find((e) => classPath.startsWith(e))

        if (loadingPathKey == null) throw new Error(`Couldn't find loading path key for ${classPath}`)

        if (ClassLoader.loadingPaths[loadingPathKey] == null) throw new Error(`Couldn't find autoload path`)

        const sourcePath = ClassLoader.loadingPaths[loadingPathKey]

        Logger.trace(`sourcePath: ${sourcePath}`)

        const endPath = classPath.replace(loadingPathKey + '.', '')

        Logger.trace(`endPath: ${endPath}`)

        const pathChunks = endPath.split('.')

        Logger.trace(`pathChunks: ${pathChunks.join(',')}`)

        const classChunk = pathChunks.slice(pathChunks.length - 1, pathChunks.length)[0]

        Logger.trace(`classChunk: ${classChunk}`)

        const loadPath = [sourcePath, ...pathChunks].join(path.sep)

        Logger.trace(`loading from ${loadPath}`)

        let classImport: Record<string, object>

        if (ClassLoader.useImport) {
            Logger.trace(`importing from ${loadPath}`)
            classImport = await ClassLoader.importClassFile(loadPath)
        } else {
            Logger.trace(`requiring from ${loadPath}`)
            classImport = await ClassLoader.requireClassFile(loadPath, classChunk)
        }

        Logger.trace(`returning classImport[%s]: %s`, classChunk, inspect(classImport))

        return classImport[classChunk]
    }
}

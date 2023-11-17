import path from 'node:path'
import Logger from './Logger'

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ClassLoader {
    protected static loadingPaths: Record<string, string> = {}
    protected static loadingPathsNameCache: string[] = []
    protected static importCache: Record<string, unknown> = {}
    protected static classCache: Record<string, unknown> = {}

    protected static async importClassFile(loadPath: string): Promise<Record<string, object>> {
        Logger.trace('importing from %s', loadPath)

        if (ClassLoader.importCache[loadPath] == null) {
            const importResult = (ClassLoader.importCache[loadPath] = await import(loadPath))

            if (importResult == null) throw new Error(`Unknown error importing ${loadPath}`)

            ClassLoader.importCache[loadPath] = importResult
        }

        return ClassLoader.importCache[loadPath] as Record<string, object>
    }

    public static addBasePath(namespace: string, sourcePath: string): void {
        if (ClassLoader.loadingPaths[namespace] != null) throw new Error('Namespace already set')

        // Expect fully resolved paths here
        ClassLoader.loadingPaths[namespace] = sourcePath

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

        const classImport: Record<string, object> = await ClassLoader.importClassFile(loadPath)

        return classImport[classChunk]
    }
}

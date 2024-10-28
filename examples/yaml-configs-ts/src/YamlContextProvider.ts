import type { IContext, IContextProvider } from '@colore/colore-js'
import deepmerge from 'deepmerge'
import fs from 'node:fs'
import path from 'node:path'
import { inspect } from 'node:util'
import { parse } from 'yaml'

type Contexts = Record<string, IContext>

export interface Config {
    contexts: Contexts
}

export class YamlContextProvider implements IContextProvider {
    config: Config

    constructor({ configFile }: { configFile: string }) {
        console.log(`Loading ${inspect(configFile)}`)
        const content = fs.readFileSync(path.resolve(configFile), 'utf8')

        const parsedData = parse(content) as Config

        this.config = parsedData

        if (!('error' in this.config.contexts)) throw new Error('Missing error context')
    }

    resolveContext(requestedContext: string | Record<string, unknown>): IContext {
        if (typeof requestedContext !== 'string') throw new Error('Unsupported requested context type')

        if (requestedContext === '') return this.config.contexts.default

        const matchingContext = Object.keys(this.config.contexts)
            .sort((a, b) => b.length - a.length)
            .find((context) => requestedContext.startsWith(context))

        if (matchingContext == null || matchingContext === '' || !(matchingContext in this.config.contexts)) return this.config.contexts.error

        return deepmerge({}, this.config.contexts[matchingContext])
    }
}

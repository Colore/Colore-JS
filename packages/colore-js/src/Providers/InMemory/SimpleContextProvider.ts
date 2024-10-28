import deepmerge from 'deepmerge'
import type { IContext } from '../../Interfaces/Core/IContext.js'
import type { IContextProvider } from '../../Interfaces/Providers/IContextProvider.js'

interface Config {
    contexts: Record<string, IContext>
}

/**
 * Example simple context provider
 *
 * @public
 */
export class SimpleContextProvider implements IContextProvider {
    config: Config

    constructor(config: Config) {
        this.config = config
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

import deepmerge from 'deepmerge'
import { type IContext } from '../../Interfaces/Core/IContext'
import { type IContextProvider } from '../../Interfaces/Providers/IContextProvider'

interface Config {
    contexts: Record<string, IContext>
}

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

        if (matchingContext == null || matchingContext === '' || this.config.contexts[matchingContext] == null) return this.config.contexts.error

        return deepmerge({}, this.config.contexts[matchingContext])
    }
}

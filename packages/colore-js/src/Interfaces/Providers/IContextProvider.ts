import type { IContext } from '../Core/IContext.js'

export interface IContextProvider {
    resolveContext: (contextKey: string | Record<string, unknown>) => IContext
}

/**
 * @namespace Colore\Interfaces\Providers
 */

import { type IContext } from '../Core/IContext'

export interface IContextProvider {
    resolveContext: (contextKey: string | Record<string, unknown>) => IContext
}

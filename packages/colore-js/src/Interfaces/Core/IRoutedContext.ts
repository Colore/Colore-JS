import type { IContext } from './IContext.js'

export interface DRoutedContext extends IContext {
    constraints: Record<string, unknown>
}

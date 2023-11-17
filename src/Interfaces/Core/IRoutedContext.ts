import { type IContext } from './IContext'

export interface DRoutedContext extends IContext {
    constraints: Record<string, unknown>
}

import type { IContext } from './IContext.js'
import type { ILogicSet } from './ILogic.js'

export interface IAdapterContext extends IContext {
    key: string
    preempt_logic?: ILogicSet
}

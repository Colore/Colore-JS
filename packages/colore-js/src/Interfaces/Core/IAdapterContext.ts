import { type IContext } from './IContext'
import { type ILogicSet } from './ILogic'

export interface IAdapterContext extends IContext {
    key: string
    preempt_logic?: ILogicSet
}

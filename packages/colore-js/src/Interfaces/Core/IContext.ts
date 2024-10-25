import { type IContextRender } from './IContextRender'
import { type ILogic } from './ILogic'

export interface IContext {
    key?: string | object
    arguments: Record<string, unknown>
    properties: Record<string, unknown>
    logic: ILogic[]
    render: IContextRender
}

import type { IContextRender } from './IContextRender.js'
import type { ILogic } from './ILogic.js'

export interface IContext {
    key: string
    arguments: Record<string, unknown>
    properties: Record<string, unknown>
    logic: ILogic[]
    render: IContextRender
}

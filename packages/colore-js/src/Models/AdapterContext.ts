import type { IAdapterContext } from '../Interfaces/Core/IAdapterContext.js'
import type { IContext } from '../Interfaces/Core/IContext.js'
import type { ILogic } from '../Interfaces/Core/ILogic.js'

export class AdapterContext implements IContext {
    public key = ''
    public arguments: IContext['arguments'] = {}
    public properties: IContext['properties'] = {}
    public logic: IContext['logic'] = []
    public render: IContext['render'] = {
        engine: '',
        path: '',
        arguments: {},
        properties: {}
    }
    public preempt_logic: ILogic[] = []

    hydrate(contextData: IAdapterContext | unknown): void {
        if (!this.validate(contextData)) throw new Error('Invalid contextData')

        this.arguments = contextData.arguments
        this.properties = contextData.properties
        this.logic = contextData.logic
        this.render = contextData.render
    }

    validate(contextData: unknown): contextData is IAdapterContext {
        if (contextData == null) return false

        if (typeof contextData !== 'object' || Array.isArray(contextData)) return false

        if ('arguments' in contextData && typeof contextData.arguments !== 'object') return false

        if ('properties' in contextData && typeof contextData.properties !== 'object') return false

        if (
            'logic' in contextData &&
            !Array.isArray(contextData) &&
            Array.isArray(contextData.logic) &&
            contextData.logic.filter((e) => e != null && typeof e === 'object' && 'class' in e && 'method' in e).length === 0
        )
            return false

        if (!('render' in contextData) || contextData.render == null || typeof contextData.render !== 'object') return false

        if (!('engine' in contextData.render) || contextData.render.engine == null || typeof contextData.render.engine !== 'string') return false

        if (!('path' in contextData.render) || contextData.render.path == null || typeof contextData.render.path !== 'string') return false

        if ('arguments' in contextData.render && contextData.render.arguments == null && typeof contextData.render.arguments !== 'object') return false

        if ('properties' in contextData.render && contextData.render.properties == null && typeof contextData.render.properties !== 'object') return false

        return true
    }
}

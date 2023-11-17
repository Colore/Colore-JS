import { type IAdapterContext } from '../Interfaces/Core/IAdapterContext'
import { type IContext } from '../Interfaces/Core/IContext'
import { type IContextRender } from '../Interfaces/Core/IContextRender'
import { type ILogic } from '../Interfaces/Core/ILogic'

export class AdapterContext implements IContext {
    key: string = ''
    arguments: Record<string, unknown> = {}
    properties: Record<string, unknown> = {}
    logic: ILogic[] = []
    render: IContextRender = {
        engine: '',
        path: '',
        arguments: {},
        properties: {},
    }

    preempt_logic: ILogic[] = []

    hydrate(contextData: unknown): void {
        if (this.validate(contextData)) {
            this.arguments = (contextData as IAdapterContext).arguments
            this.properties = (contextData as IAdapterContext).properties
            this.logic = (contextData as IAdapterContext).logic
            this.render = (contextData as IAdapterContext).render
        }
    }

    validate(contextData: unknown): boolean {
        if (contextData == null) return false

        if (typeof contextData !== 'object') return false

        if ((contextData as IAdapterContext).arguments != null && typeof (contextData as IAdapterContext).arguments !== 'object') return false

        if ((contextData as IAdapterContext).properties != null && typeof (contextData as IAdapterContext).properties !== 'object') return false

        if (
            (contextData as IAdapterContext).logic != null &&
            !Array.isArray(contextData as IAdapterContext) &&
            (contextData as IAdapterContext).logic.filter((e) => e.class == null || e.method == null).length > 0
        )
            return false

        if ((contextData as IAdapterContext).render == null) return false

        if ((contextData as IAdapterContext).render != null && (contextData as IAdapterContext).render.engine == null) return false

        if ((contextData as IAdapterContext).render.arguments != null && typeof (contextData as IAdapterContext).render.arguments !== 'object') return false

        if ((contextData as IAdapterContext).render.properties != null && typeof (contextData as IAdapterContext).render.properties !== 'object') return false

        if (
            (contextData as IAdapterContext).render != null &&
            (contextData as IAdapterContext).render.path == null &&
            (contextData as IAdapterContext).render.arguments.path == null
        )
            return false

        return true
    }
}

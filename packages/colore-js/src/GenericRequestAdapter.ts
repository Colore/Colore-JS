import type { IRequestAdapter } from './Interfaces/Adapters/IRequestAdapter.js'
import type { IAdapterContext } from './Interfaces/Core/IAdapterContext.js'
import type { ILogicSet, ILogic } from './Interfaces/Core/ILogic.js'
import type { ILogicDone } from './Interfaces/Core/ILogicDone.js'
import type { ILogicError } from './Interfaces/Core/ILogicError.js'
import { Logger } from './Logger.js'
import { AdapterContext } from './Models/AdapterContext.js'

/**
 * Abstract generic request adapter
 *
 * @public
 */
export abstract class GenericRequestAdapter implements IRequestAdapter {
    protected contextKey = ''
    protected context: AdapterContext = new AdapterContext()
    protected exceptionState = false
    protected requestVariables: Record<string, unknown> = {}
    protected renderProperties: Record<string, unknown> = {}
    protected requestArguments: Record<string, unknown> = {}
    protected requestProperties: Record<string, unknown> = {}
    protected sessionProperties: Record<string, unknown> = {}

    /**
     * Get the key of the current context
     *
     * @returns Returns the current context key
     */
    getRequestContext(): string {
        return this.contextKey
    }

    /**
     * @param array - contextData
     *
     * @returns void
     */
    loadContext(contextData: IAdapterContext): void {
        // Save context key
        this.contextKey = contextData.key

        // Load context information
        this.context.hydrate(contextData)

        if ('arguments' in this.context && typeof this.context.arguments !== 'undefined') {
            this.requestArguments = this.context.arguments
        }

        if (!('arguments' in this.context.render)) {
            // @ts-expect-error never
            this.context.render.arguments = {}
        }

        this.exceptionState = false

        if ('properties' in this.context.render && typeof this.context.render.properties === 'object' && Object.keys(this.context.render.properties).length > 0) {
            Logger.debug('We have render arguments')

            for (const renderProperty in this.context.render.properties) {
                const renderValue = this.context.render.properties[renderProperty]

                Logger.debug('Set [%s] to [%s]', renderProperty, renderValue)

                this.setRenderProperty(renderProperty, renderValue)
            }
        } else {
            Logger.debug('No render arguments')
        }
    }

    /**
     * Check if the request is in an exception state
     *
     * @returns boolean
     */
    hasException(): boolean {
        return this.exceptionState
    }

    /**
     * Set the request in an exception state
     *
     * @returns void
     */
    doException(): void {
        this.exceptionState = true
    }

    /**
     * Get all the logic for the request.
     *
     * @returns array Returns an array
     */
    getLogic(): ILogicSet {
        if (!('logic' in this.context) || !Array.isArray(this.context.logic)) {
            return []
        }

        return this.context.logic
    }

    /**
     * Gets the next Logic element from the stack.
     *
     * @returns mixed Logic element
     */
    getNextLogic(): ILogic | ILogicDone | ILogicError {
        // If we have a non-empty preempt_logic list, merge it into the logic list
        if ('preempt_logic' in this.context && this.context.preempt_logic.length > 0) {
            while (this.context.preempt_logic.length > 0) {
                const nextPreemptLogic = this.context.preempt_logic.pop()
                if (nextPreemptLogic != null) this.context.logic.unshift(nextPreemptLogic)
            }
        }

        // Return the next logic call from the stack
        if (this.context.logic.length > 0) {
            return this.context.logic.shift() ?? { result: 'DONE' }
        }

        return { result: 'ERROR' }
    }

    /** Check if there is logic
     *
     * @returns boolean
     */
    hasLogic(): boolean {
        return 'logic' in this.context && Array.isArray(this.context.logic)
    }

    /**
     * Append logic to the worklist
     *
     * @param array - Logic
     *
     * @returns void
     */
    appendLogic(logic: ILogic | ILogicSet): void {
        if (Array.isArray(logic)) {
            this.context.logic = [...this.context.logic, ...logic]
        } else {
            this.context.logic.push(logic)
        }
    }

    /**
     * Insert logic to the worklist
     *
     * @param array - Logic
     *
     * @returns void
     */
    insertLogic(logic: ILogic | ILogicSet): void {
        // Check for preempt list
        this.context.preempt_logic = 'preempt_logic' in this.context ? this.context.preempt_logic : []

        // Add logic to preempt list
        if (Array.isArray(logic) && logic.every((l) => typeof l === 'object' && 'class' in l && 'method' in l)) {
            this.context.preempt_logic = [...this.context.preempt_logic, ...logic]
        } else if (!Array.isArray(logic) && typeof logic === 'object' && 'class' in logic && 'method' in logic) {
            this.context.preempt_logic.push(logic)
        }
    }

    /**
     * Magic overload getter. Returns the requestVariable value or null.
     *
     * @param string - requestVariable
     *
     * @returns mixed
     */
    __get(requestVariable: string): unknown {
        if (this.requestVariables[requestVariable] != null) {
            return this.requestVariables[requestVariable]
        }

        return null
    }

    /**
     * Magic overload setter
     *
     * @param string - requestVariable
     * @param string - requestValue
     *
     * @returns void
     */
    __set(requestVariable: string, requestValue: unknown): void {
        this.requestVariables[requestVariable] = requestValue
    }

    /**
     * Magic overload checker to determine if the variable is set.
     * @param unknown - requestVariable
     * @returns boolean
     */
    __isset(requestVariable: string): boolean {
        return this.requestVariables[requestVariable] != null
    }

    /**
     * Magical unsetter for request variables.
     * @param unknown - requestVariable
     */
    __unset(requestVariable: string): void {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete this.requestVariables[requestVariable]
    }

    /**
     * Get the render arguments. These are settings for the renderer.
     *
     * @returns mixed
     */
    getRenderArguments(): Record<string, unknown> {
        return this.context.render.arguments
    }

    /**
     * Get a specific render argument.
     *
     * @param string - renderArgumentName
     *
     * @returns mixed
     */
    getRenderArgument(renderArgumentName: string): unknown {
        return this.context.render.arguments[renderArgumentName]
    }

    /**
     * Set the render arguments. These are settings for the renderer.
     *
     * @param string - renderPath
     *
     * @returns void
     */
    setRenderArgument(renderArgumentName: string, renderArgumentValue: unknown): void {
        this.context.render.arguments[renderArgumentName] = renderArgumentValue
    }

    /**
     * Get the context's rendering properties.
     *
     * @returns object Returns an array with all the rendering properties.
     */
    getContextRenderProperties(): Record<string, unknown> {
        return this.context.render.properties
    }

    /**
     * Gets an array containing all of the rendering properties.
     * @returns array
     */
    getRenderProperties(): Record<string, unknown> {
        return this.renderProperties
    }

    /**
     * Get a (named) render property. Returns null or the render property if it exists.
     * @param string - renderProperty
     * @returns multitype:|NULL
     */
    getRenderProperty(renderProperty: string): unknown {
        return this.renderProperties[renderProperty]
    }

    /**
     * Set a render property
     *
     * @param string - renderProperty
     * @param mixed - renderValue
     *
     * @returns void
     */
    setRenderProperty(renderProperty: string, renderValue: unknown): void {
        Logger.debug('Set [%s] to [%s]', renderProperty, renderValue)

        this.renderProperties[renderProperty] = renderValue
    }

    /**
     * Get the rendering engine for the current request.
     *
     * @returns string Returns a string with the currently set rendering engine.
     */
    getRenderEngine(): string {
        return this.context.render.engine
    }

    /**
     * Set the rendering engine for the current request.
     * @param string - renderEngine
     */
    setRenderEngine(renderEngine: string): void {
        this.context.render.engine = renderEngine
    }

    /**
     * Get rendering path.
     * @returns string Returns the render path if set, else returns false.
     */
    getRenderPath(): string | false {
        return this.context.render.arguments.path as string
    }

    /**
     * Sets the render path
     * @param string - renderPath
     */
    setRenderPath(renderPath: string): void {
        this.context.render.arguments.path = renderPath
    }

    /**
     * Output
     *
     * @param mixed - Output variable
     */
    abstract output(content: unknown, metadata: Record<string, string>, status: number): unknown

    /**
     * Returns an array containing all of the request arguments.
     * @returns array
     */
    getRequestArguments(): Record<string, unknown> {
        return this.requestArguments
    }

    /**
     * Get a specific request argument. Returns null if the specified request argument does not exist.
     * @param string - requestArgumentName
     * @returns multitype:|NULL
     */
    getRequestArgument(requestArgumentName: string): unknown {
        return this.requestArguments[requestArgumentName]
    }

    /**
     * Sets a request argument.
     *
     * @param string - requestArgument
     * @param mixed - requestArgumentValue
     *
     * @returns void
     */
    setRequestArgument(requestArgument: string, requestArgumentValue: unknown): void {
        this.requestArguments[requestArgument] = requestArgumentValue
    }

    /**
     * Returns an array containing all of the request properties.
     * @returns array
     */
    getRequestProperties(): Record<string, unknown> {
        return this.requestProperties
    }

    /**
     * Get a specific request property. Returns null if the specified request property does not exist.
     *
     * @param string - requestProperty
     *
     * @returns multitype:|NULL
     */
    getRequestProperty(requestProperty: string): unknown {
        if (this.requestProperties[requestProperty] != null) {
            return this.requestProperties[requestProperty]
        }

        return null
    }

    /**
     * Sets a request property.
     *
     * @param string - requestProperty
     * @param string - requestValue
     *
     * @returns void
     */
    setRequestProperty(requestProperty: string, requestValue: unknown): void {
        this.requestProperties[requestProperty] = requestValue
    }

    /**
     * Returns an array containing all of the session properties.
     * @returns array
     */
    getSessionProperties(): Record<string, unknown> {
        return this.sessionProperties
    }

    /**
     * Get a (named) session property. Returns null or the session property if it exists.
     * @param unknown - sessionProperty
     * @returns multitype:|NULL
     */
    getSessionProperty(sessionProperty: string): unknown {
        return this.sessionProperties[sessionProperty]
    }

    abstract setSessionLifetime(sessionLifetime: number): void

    /**
     * Sets a session property.
     *
     * @param string - sessionProperty
     * @param mixed - sessionValue
     *
     * @returns void
     */
    setSessionProperty(sessionProperty: string, sessionValue: unknown): void {
        this.sessionProperties[sessionProperty] = sessionValue
    }

    /**
     * Sets a session property.
     *
     * @param string - sessionProperty
     *
     * @returns void
     */
    unsetSessionProperty(sessionProperty: string): void {
        if (sessionProperty in this.sessionProperties) {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete this.sessionProperties[sessionProperty]
        }
    }
}

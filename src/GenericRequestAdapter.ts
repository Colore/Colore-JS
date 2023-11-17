/**
 * @namespace Colore
 *
 * @use Colore\Interfaces\Adapters\IRequestAdapter
 */

import { type IAdapterContext } from './Interfaces/Core/IAdapterContext'
import { type IRequestAdapter } from './Interfaces/Adapters/IRequestAdapter'
import { AdapterContext } from './Models/AdapterContext'
import { Logger } from './Logger'
import { type ILogicSet, type ILogic } from './Interfaces/Core/ILogic'

export abstract class GenericRequestAdapter implements IRequestAdapter {
    protected contextKey: string = ''
    protected context: AdapterContext = new AdapterContext()
    protected exceptionState: boolean = false
    protected requestVariables: Record<string, unknown> = {}
    protected renderProperties: Record<string, unknown> = {}
    protected requestArguments: Record<string, unknown> = {}
    protected requestProperties: Record<string, unknown> = {}
    protected sessionProperties: Record<string, unknown> = {}

    /**
     * Get the key of the current context
     *
     * @return Returns the current context key
     */
    getRequestContext(): string {
        return this.contextKey
    }

    /**
     * @param array contextData
     *
     * @return void
     */
    loadContext(contextData: IAdapterContext): void {
        // Save context key
        this.contextKey = contextData.key

        // Load context information
        this.context.hydrate(contextData)

        if (this.context.arguments != null) {
            this.requestArguments = this.context.arguments
        }

        if (this.context.render?.arguments == null) {
            this.context.render = {
                ...this.context.render,
                arguments: {},
            }
        }

        this.exceptionState = false

        if (this.context.render.properties != null && typeof this.context.render.properties === 'object' && Object.keys(this.context.render.properties).length > 0) {
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
     * @return void
     */
    doException(): void {
        this.exceptionState = true
    }

    /**
     * Get all the logic for the request.
     *
     * @return array Returns an array
     */
    getLogic(): ILogicSet {
        if (this.context.logic == null || !Array.isArray(this.context.logic)) {
            return []
        }

        return this.context.logic
    }

    /**
     * Gets the next Logic element from the stack.
     *
     * @return mixed Logic element
     */
    getNextLogic(): ILogic | false {
        // If we have a non-empty preempt_logic list, merge it into the logic list
        if (this.context.preempt_logic != null && this.context.preempt_logic.length > 0) {
            while (this.context.preempt_logic.length > 0) {
                const nextPreemptLogic = this.context.preempt_logic.pop()
                if (nextPreemptLogic != null) this.context.logic.unshift(nextPreemptLogic)
            }
        }

        // Return the next logic call from the stack
        if (this.context.logic.length > 0) {
            return this.context.logic.shift() ?? false
        }

        return false
    }

    /** Check if there is logic
     *
     * @return boolean
     */
    hasLogic(): boolean {
        return this.context.logic != null && Array.isArray(this.context.logic)
    }

    /**
     * Append logic to the worklist
     *
     * @param array Logic
     *
     * @return void
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
     * @param array Logic
     *
     * @return void
     */
    insertLogic(logic: ILogic | ILogicSet): void {
        // Check for preempt list
        if (this.context.preempt_logic == null) {
            this.context.preempt_logic = []
        }

        // Add logic to preempt list
        if (Array.isArray(logic) && logic.every((l) => l.class != null && l.method != null)) {
            this.context.preempt_logic = [...this.context.preempt_logic, ...logic]
        } else if (!Array.isArray(logic) && logic.class != null && logic.method != null) {
            this.context.preempt_logic.push(logic)
        }
    }

    /**
     * Magic overload getter. Returns the requestVariable value or null.
     *
     * @param string requestVariable
     *
     * @return mixed
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
     * @param string requestVariable
     * @param string requestValue
     *
     * @return void
     */
    __set(requestVariable: string, requestValue: string): void {
        this.requestVariables[requestVariable] = requestValue
    }

    /**
     * Magic overload checker to determine if the variable is set.
     * @param unknown requestVariable
     * @return boolean
     */
    __isset(requestVariable: string): boolean {
        return this.requestVariables[requestVariable] != null
    }

    /**
     * Magical unsetter for request variables.
     * @param unknown requestVariable
     */
    __unset(requestVariable: string): void {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete this.requestVariables[requestVariable]
    }

    /**
     * Get the render arguments. These are settings for the renderer.
     *
     * @return mixed
     */
    getRenderArguments(): Record<string, unknown> {
        return this.context.render.arguments
    }

    /**
     * Get a specific render argument.
     *
     * @param string renderArgumentName
     *
     * @return mixed
     */
    getRenderArgument(renderArgumentName: string): unknown {
        if (this.context.render.arguments[renderArgumentName] != null) {
            return this.context.render.arguments[renderArgumentName]
        }

        return null
    }

    /**
     * Set the render arguments. These are settings for the renderer.
     *
     * @param string renderPath
     *
     * @return void
     */
    setRenderArgument(renderArgumentName: string, renderArgumentValue: unknown): void {
        this.context.render.arguments[renderArgumentName] = renderArgumentValue
    }

    /**
     * Get the context's rendering properties.
     *
     * @return object Returns an array with all the rendering properties.
     */
    getContextRenderProperties(): Record<string, unknown> {
        return this.context.render.properties
    }

    /**
     * Gets an array containing all of the rendering properties.
     * @return array
     */
    getRenderProperties(): Record<string, unknown> {
        return this.renderProperties
    }

    /**
     * Get a (named) render property. Returns null or the render property if it exists.
     * @param string renderProperty
     * @return multitype:|NULL
     */
    getRenderProperty(renderProperty: string): unknown {
        if (this.renderProperties[renderProperty] != null) {
            return this.renderProperties[renderProperty]
        }

        return null
    }

    /**
     * Set a render property
     *
     * @param string renderProperty
     * @param mixed renderValue
     *
     * @return void
     */
    setRenderProperty(renderProperty: string, renderValue: unknown): void {
        Logger.debug('Set [%s] to [%s]', renderProperty, renderValue)

        this.renderProperties[renderProperty] = renderValue
    }

    /**
     * Get the rendering engine for the current request.
     *
     * @return string Returns a string with the currently set rendering engine.
     */
    getRenderEngine(): string {
        return this.context.render.engine
    }

    /**
     * Set the rendering engine for the current request.
     * @param string renderEngine
     */
    setRenderEngine(renderEngine: string): void {
        this.context.render.engine = renderEngine
    }

    /**
     * Get rendering path.
     * @return string Returns the render path if set, else returns false.
     */
    getRenderPath(): string | false {
        if (this.context.render.arguments.path != null) {
            return this.context.render.arguments.path as string
        }

        return false
    }

    /**
     * Sets the render path
     * @param string renderPath
     */
    setRenderPath(renderPath: string): void {
        this.context.render.arguments.path = renderPath
    }

    /**
     * Output
     *
     * @param mixed Output variable
     */
    abstract output(content: unknown, metadata: Record<string, string>, status: number): unknown

    /**
     * Returns an array containing all of the request arguments.
     * @return array
     */
    getRequestArguments(): Record<string, unknown> {
        return this.requestArguments
    }

    /**
     * Get a specific request argument. Returns null if the specified request argument does not exist.
     * @param string requestArgumentName
     * @return multitype:|NULL
     */
    getRequestArgument(requestArgumentName: string): unknown {
        if (this.requestArguments[requestArgumentName] != null) {
            return this.requestArguments[requestArgumentName]
        }

        return null
    }

    /**
     * Sets a request argument.
     *
     * @param string requestArgument
     * @param mixed requestArgumentValue
     *
     * @return void
     */
    setRequestArgument(requestArgument: string, requestArgumentValue: unknown): void {
        this.requestArguments[requestArgument] = requestArgumentValue
    }

    /**
     * Returns an array containing all of the request properties.
     * @return array
     */
    getRequestProperties(): Record<string, unknown> {
        return this.requestProperties
    }

    /**
     * Get a specific request property. Returns null if the specified request property does not exist.
     *
     * @param string requestProperty
     *
     * @return multitype:|NULL
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
     * @param string requestProperty
     * @param string requestValue
     *
     * @return void
     */
    setRequestProperty(requestProperty: string, requestValue: unknown): void {
        this.requestProperties[requestProperty] = requestValue
    }

    /**
     * Returns an array containing all of the session properties.
     * @return array
     */
    getSessionProperties(): Record<string, unknown> {
        return this.sessionProperties
    }

    /**
     * Get a (named) session property. Returns null or the session property if it exists.
     * @param unknown sessionProperty
     * @return multitype:|NULL
     */
    getSessionProperty(sessionProperty: string): unknown {
        if (this.sessionProperties[sessionProperty] != null) {
            return this.sessionProperties[sessionProperty]
        }

        return null
    }

    abstract setSessionLifetime(sessionLifetime: number): void

    /**
     * Sets a session property.
     *
     * @param string sessionProperty
     * @param mixed sessionValue
     *
     * @return void
     */
    setSessionProperty(sessionProperty: string, sessionValue: unknown): void {
        this.sessionProperties[sessionProperty] = sessionValue
    }

    /**
     * Sets a session property.
     *
     * @param string sessionProperty
     *
     * @return void
     */
    unsetSessionProperty(sessionProperty: string): void {
        if (this.sessionProperties[sessionProperty] != null) {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete this.sessionProperties[sessionProperty]
        }
    }
}

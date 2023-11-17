/**
 * @namespace Colore\Interfaces\Adapters
 */

import { type ILogicSet, type ILogic } from '../Core/ILogic'

export interface IRequestAdapter {
    getRequestContext: () => string

    loadContext: (contextData: unknown) => void

    hasException: () => boolean

    doException: () => void

    appendLogic: (logic: ILogic) => void

    insertLogic: (logic: ILogic) => void

    getLogic: () => ILogicSet

    getNextLogic: () => ILogic | false

    hasLogic: () => boolean

    __get: (requestVariable: string) => unknown

    __set: (requestVariable: string, requestValue: unknown) => void

    __isset: (requestVariable: string) => boolean

    __unset: (requestVariable: string) => void

    /**
     * Get all render arguments.
     *
     * @return mixed
     */
    getRenderArguments: () => Record<string, unknown>

    /**
     * Get a specific render argument.
     *
     * @param string renderArgumentName
     *
     * @return mixed
     */
    getRenderArgument: (renderArgumentName: string) => unknown

    /**
     * Set a specific render argument.
     *
     * @param string renderArgumentName
     * @param mixed renderArgumentValue
     *
     * @return void
     */
    setRenderArgument: (renderArgumentName: string, renderArgumentValue: unknown) => void

    /**
     * Get all render properties.
     *
     * @return mixed
     */
    getRenderProperties: () => Record<string, unknown>

    /**
     * Get a specific render property.
     *
     * @param string renderProperty
     *
     * @return mixed
     */
    getRenderProperty: (renderProperty: string) => unknown

    /**
     * Set a specific render property.
     *
     * @param string renderProperty
     * @param mixed renderValue
     *
     * @return void
     */
    setRenderProperty: (renderProperty: string, renderValue: string) => void

    /**
     * Get the rendering engine for the current request.
     *
     * @return string Returns a string with the currently set rendering engine.
     */
    getRenderEngine: () => string

    /**
     * Set the render engine for the current request.
     *
     * @param string renderEngine
     *
     * @return void
     */
    setRenderEngine: (renderEngine: string) => void

    /**
     * Get the render path. This is the identifier for the template the renderer uses to render the request.
     *
     * @return string
     */
    getRenderPath: () => string | false

    /**
     * Set render (template) path
     *
     * @param [type] renderPath
     * @return void
     */
    setRenderPath: (renderPath: string) => void

    /**
     * Output
     *
     * @param mixed Output variable
     */
    output: (content: unknown, metadata: Record<string, string>, status: number) => void

    getRequestArguments: () => Record<string, unknown>
    getRequestArgument: (requestArgumentName: string) => unknown
    setRequestArgument: (requestArgumentName: string, requestArgumentValue: unknown) => void

    getContextRenderProperties: () => Record<string, unknown>

    getRequestProperties: () => Record<string, unknown>
    getRequestProperty: (requestPropertyName: string) => unknown
    setRequestProperty: (requestPropertyName: string, requestPropertyValue: unknown) => void

    /**
     * Returns an array containing all of the session properties.
     *
     * @return array
     */
    getSessionProperties: () => Record<string, unknown>

    /**
     * Get a (named) session property. Returns null or the session property if it exists.
     *
     * @param unknown sessionProperty
     *
     * @return multitype:|NULL
     */
    getSessionProperty: (sessionProperty: string) => unknown

    /**
     * Sets a session property.
     *
     * @param string sessionProperty
     * @param mixed sessionValue
     *
     * @return void
     */
    setSessionProperty: (sessionProperty: string, sessionValue: unknown) => void

    /**
     * Sets a session property.
     *
     * @param string sessionProperty
     *
     * @return void
     */
    unsetSessionProperty: (sessionProperty: string) => void

    setSessionLifetime: (sessionLifetime: number) => void
}

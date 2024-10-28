import { inspect } from 'node:util'
import { ClassLoader } from './ClassLoader.js'
import { Logger } from './Logger.js'
import type { IRequestAdapter } from './Interfaces/Adapters/IRequestAdapter.js'
import type { IConfig } from './Interfaces/Core/IConfig.js'
import type { IConstructable } from './Interfaces/Core/IConstructable.js'
import type { ILogicClass } from './Interfaces/Core/ILogicClass.js'
import type { IContextProvider } from './Interfaces/Providers/IContextProvider.js'
import type { IRenderProvider } from './Interfaces/Providers/IRenderProvider.js'

/**
 * Colore Engine
 *
 * @public
 */
export class Engine {
    private readonly config: IConfig
    private readonly objectCache: Record<string, unknown> = {}
    private readonly helpers: Partial<{ context: IContextProvider }> = {}

    constructor(config: IConfig) {
        if (typeof config !== 'object' || Array.isArray(config)) Logger.fatal('Error initializing Colore configuration')

        this.config = config
    }

    async loadContextProvider(): Promise<void> {
        if (this.helpers.context != null) return

        const contextHelperConfig = this.config.helpers.context

        // eslint-disable-next-line @typescript-eslint/init-declarations
        let contextHelper: IContextProvider

        if (typeof contextHelperConfig === 'string') {
            Logger.info('Initializing context provider')

            contextHelper = await this.factory<IContextProvider>(contextHelperConfig)
        } else if (typeof contextHelperConfig === 'object' && !Array.isArray(contextHelperConfig) && 'name' in contextHelperConfig && 'args' in contextHelperConfig) {
            const { name, args } = contextHelperConfig

            Logger.info('Initializing context provider with arguments')

            contextHelper = await this.factory<IContextProvider>(name, args)
        } else {
            throw new Error('Failed to acquire context helper')
        }

        this.helpers.context = contextHelper
    }

    async factory<T>(className: string, ...args: unknown[]): Promise<T> {
        Logger.debug('making %s', className)

        const FactoryClass = await ClassLoader.loadClass<IConstructable<T>>(className)

        /**
         * Create a new instance of the specified class name.
         */
        return new FactoryClass(...args)
    }

    /**
     * Returns a cached instance of the class name type.
     * If it does not exist, it creates an instance of the class name and saves it into the private objectCache array.
     *
     * @param string - className
     *
     * @returns object
     */
    public async getCachedObject<T>(className: string): Promise<T> {
        Logger.debug('getCachedObject: [%s]', className)

        /**
         * If the object is not cached, load the class, create the object and save it in the cache.
         */
        if (!(className in this.objectCache)) {
            const FactoryClass = await ClassLoader.loadClass<IConstructable<T>>(className)

            Logger.trace('getCachedObject', 'FactoryClass:', typeof FactoryClass, inspect(FactoryClass))

            this.objectCache[className] = new FactoryClass()
        }

        /**
         * Return the object from the cache.
         */
        return this.objectCache[className] as T
    }

    async service(...args: unknown[]): Promise<void> {
        await this.loadContextProvider()

        const contextConfig = this.config.helpers.request

        if (typeof contextConfig !== 'string') throw new Error('Invalid context helper argument')

        const requestObject: IRequestAdapter = await this.factory<IRequestAdapter>(contextConfig, ...args)

        Object.entries(this.config.defaults.render.properties).forEach(([propName, propVal]) => {
            requestObject.setRenderProperty(propName, propVal)
        })

        await this.dispatch(requestObject)

        await this.render(requestObject)
    }

    async dispatch(requestObject: IRequestAdapter): Promise<void> {
        Logger.debug('Dispatching')

        Logger.debug('Issuing context helpers')

        /**
         * Get Request Context
         */
        const contextKey = requestObject.getRequestContext()

        Logger.debug('Resolving context: [%s]', contextKey)

        if (this.helpers.context == null) throw new Error('Missing context provider')

        const contextData = this.helpers.context.resolveContext(contextKey)
        contextData.key = contextKey

        Logger.debug('Loading context into Request object...')

        /**
         * Load the Context into the Request object
         */
        requestObject.loadContext(contextData)

        Logger.debug('Get Logic calls from the Request object...')

        /**
         * If requestObject has no valid logic, give a fatal error
         */
        if (!requestObject.hasLogic()) {
            Logger.fatal('Dispatch/Error in getLogic result')
        }

        Logger.debug('Executing Logic calls from the Request object [%d]...', requestObject.getLogic().length)

        let nextCall = requestObject.getNextLogic()

        /**
         * Iterate over request logic.
         */
        while (!('result' in nextCall)) {
            /**
             * Check if we're still clear to run
             */
            if (requestObject.hasException()) {
                break
            }

            Logger.debug('Executing Logic call: [%s.%s]', nextCall.class, nextCall.method)

            /**
             * Get a (cached) instance of the defined logic class.
             */
            const logicObject = await this.getCachedObject<ILogicClass>(nextCall.class)
            const logicMethod = nextCall.method

            Logger.trace('logicObject: %s', inspect(logicObject))

            /**
             * If the method does not exist, then bail, else execute the class method.
             * If the class method returns false, then stop further execution (of logic).
             */

            const logicResult = await new Promise((resolve) => {
                const callResult = logicObject[logicMethod](requestObject)

                resolve(callResult)
            })

            if (logicResult === false) {
                requestObject.doException()
            }

            Logger.debug('Logic Call [%s.%s] returned: [%s]', nextCall.class, nextCall.method, logicResult as string)

            nextCall = requestObject.getNextLogic()
        }

        Logger.debug('Done executing Logic calls')
    }

    async render(requestObject: IRequestAdapter): Promise<void> {
        // Get the render engine as set in the request.
        const renderEngine = requestObject.getRenderEngine()

        Logger.debug('Render with: [%s]', renderEngine)

        // Get a (cached) instance of the render engine.
        const renderInstance = await this.getCachedObject<IRenderProvider>(renderEngine)

        Logger.debug('Rendering...')

        // Dispatch the render request to the rendering engine.
        renderInstance.dispatch(requestObject)
    }
}

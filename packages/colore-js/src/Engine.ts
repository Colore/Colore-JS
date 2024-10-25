import { inspect } from 'node:util'
import { ClassLoader } from './ClassLoader'
import { type IRequestAdapter } from './Interfaces/Adapters/IRequestAdapter'
import { type IConfig } from './Interfaces/Core/IConfig'
import { type ILogicCall } from './Interfaces/Core/ILogicCall'
import { type IContextProvider } from './Interfaces/Providers/IContextProvider'
import { type IRenderProvider } from './Interfaces/Providers/IRenderProvider'
import Logger from './Logger'

export class Engine {
    private readonly config: IConfig
    private readonly objectCache: Record<string, object> = {}
    private readonly helpers: Partial<{ context: IContextProvider }> = {}

    constructor(config: IConfig) {
        if (config == null || Object.keys(config).length === 0) Logger.fatal('Error initializing Colore configuration')

        this.config = config
    }

    async loadContextProvider(): Promise<void> {
        if (this.helpers.context != null) return

        const contextHelperConfig = this.config.helpers.context

        let contextHelper: IContextProvider

        if (typeof contextHelperConfig === 'string') {
            Logger.info('Initializing context provider')

            contextHelper = await this.factory<IContextProvider>(contextHelperConfig)
        } else if (typeof contextHelperConfig === 'object' && !Array.isArray(contextHelperConfig) && contextHelperConfig.name != null && contextHelperConfig.args != null) {
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

        const factoryClass = await ClassLoader.loadClass(className)

        // TODO remove intermediate step
        const FactoryClass = Object.assign(factoryClass)

        /**
         * Create a new instance of the specified class name.
         */
        return new FactoryClass(...args)
    }

    /**
     * Returns a cached instance of the class name type.
     * If it does not exist, it creates an instance of the class name and saves it into the private objectCache array.
     *
     * @param string className
     *
     * @return object
     */
    public async getCachedObject(className: string): Promise<object> {
        Logger.debug('getCachedObject: [%s]', className)

        const factoryClass = await ClassLoader.loadClass(className)

        Logger.trace('getCachedObject', 'factoryClass:', typeof factoryClass, inspect(factoryClass))

        // TODO remove intermediate step
        const FactoryClass = Object.assign(factoryClass)

        Logger.trace('getCachedObject', 'FactoryClass:', typeof FactoryClass, inspect(FactoryClass))

        /**
         * If the object is not cached, create the object and save it in the cache.
         */
        if (this.objectCache[className] == null) {
            this.objectCache[className] = new FactoryClass()
        }

        /**
         * Check if the cached object matched the specified class name. Bail on failure.
         */
        // // @ts-expect-error missing prototype
        // if ((this.objectCache[className].prototype.constructor.name as string) === className) {
        //     Logger.fatal('getCachedObject/Could not instantiate class: [%s]', className)
        // }

        /**
         * Return the object from the cache.
         */
        return this.objectCache[className]
    }

    async service(...args: unknown[]): Promise<void> {
        await this.loadContextProvider()

        const contextConfig = this.config.helpers.request

        let requestObject: IRequestAdapter

        if (typeof contextConfig === 'string') {
            requestObject = await this.factory<IRequestAdapter>(contextConfig, ...args)
        } else {
            throw new Error('Failed to acquire context helper')
        }

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
        while (nextCall !== false) {
            /**
             * Check if we're still clear to run
             */
            if (requestObject.hasException()) {
                break
            }

            /**
             * If getNextLogic generated an error, then bail.
             */
            if (nextCall.class == null || nextCall.method == null) {
                Logger.fatal('Missing class or method in logic definition')
                break
            }

            Logger.debug('Executing Logic call: [%s.%s]', nextCall.class, nextCall.method)

            /**
             * Get a (cached) instance of the defined logic class.
             */
            const logicObject = (await this.getCachedObject(nextCall.class)) as ILogicCall

            Logger.trace('logicObject: %s', inspect(logicObject))
            Logger.trace('nextCall: %s', inspect(nextCall))

            /**
             * If the method does not exist, then bail, else execute the class method.
             * If the class method returns false, then stop further execution (of logic).
             */

            if (logicObject[nextCall.method] == null) {
                requestObject.doException()
                Logger.fatal('Fatal Error In Request: %s->%s := %s', nextCall.class, nextCall.method, logicObject[nextCall.method])
            } else {
                const logicResult = await new Promise((resolve, reject) => {
                    if (nextCall !== false) {
                        const callResult = logicObject[nextCall.method](requestObject)

                        resolve(callResult)
                    } else {
                        resolve(nextCall)
                    }
                })

                if (logicResult === false) {
                    requestObject.doException()
                }

                Logger.debug('Logic Call [%s.%s] returned: [%s]', nextCall.class, nextCall.method, logicResult as string)
            }

            nextCall = requestObject.getNextLogic()
        }

        Logger.debug('Done executing Logic calls')
    }

    async render(requestObject: IRequestAdapter): Promise<void> {
        // Get the render engine as set in the request.
        const renderEngine = requestObject.getRenderEngine()

        Logger.debug('Render with: [%s]', renderEngine)

        // Get a (cached) instance of the render engine.
        const renderInstance = (await this.getCachedObject(renderEngine)) as IRenderProvider

        Logger.debug('Rendering...')

        // Dispatch the render request to the rendering engine.
        renderInstance.dispatch(requestObject)
    }
}

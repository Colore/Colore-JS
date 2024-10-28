// eslint-disable-next-line import/no-named-as-default
import sprintf from 'sprintf'

/**
 * @public
 */
export const LOG_EMERG = 0

/**
 * @public
 */
export const LOG_ALERT = 1

/**
 * @public
 */
export const LOG_CRIT = 2

/**
 * @public
 */
export const LOG_ERR = 3

/**
 * @public
 */
export const LOG_WARNING = 4

/**
 * @public
 */
export const LOG_NOTICE = 5

/**
 * @public
 */
export const LOG_INFO = 6

/**
 * @public
 */
export const LOG_DEBUG = 7

/**
 * @public
 */
export const LOG_TRACE = 8

/**
 * @public
 */
export const LOG_VERBOSE = 9

/**
 * Colore Logger
 *
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Logger {
    protected static basePath = ''
    protected static logLevel = LOG_NOTICE

    public static getBasePath(): string {
        return Logger.basePath
    }

    public static setBasePath(basePath: string): void {
        Logger.basePath = basePath
    }

    public static getLogLevel(): number {
        return Logger.logLevel
    }

    public static setLogLevel(logLevel: number): void {
        Logger.logLevel = logLevel
    }

    public static shouldDebug(): boolean {
        return Logger.shouldProcess(LOG_DEBUG)
    }

    protected static shouldProcess(logLevel: number): boolean {
        return logLevel <= Logger.logLevel
    }

    public static emerg(...args: unknown[]): void {
        Logger.log(LOG_EMERG, ...args)
    }

    public static alert(...args: unknown[]): void {
        Logger.log(LOG_ALERT, ...args)
    }

    public static crit(...args: unknown[]): void {
        Logger.log(LOG_CRIT, ...args)
    }

    public static err(...args: unknown[]): void {
        Logger.log(LOG_ERR, ...args)
    }

    public static warning(...args: unknown[]): void {
        Logger.log(LOG_WARNING, ...args)
    }

    public static notice(...args: unknown[]): void {
        Logger.log(LOG_NOTICE, ...args)
    }

    public static info(...args: unknown[]): void {
        Logger.log(LOG_INFO, ...args)
    }

    public static debug(...args: unknown[]): void {
        Logger.log(LOG_DEBUG, ...args)
    }

    public static trace(...args: unknown[]): void {
        Logger.log(LOG_TRACE, ...args)
    }

    public static verbose(...args: unknown[]): void {
        Logger.log(LOG_VERBOSE, ...args)
    }

    protected static log(logLevel: number, ...message: unknown[]): void {
        if (this.shouldProcess(logLevel)) {
            const stack = new Error().stack?.split('\n')

            if (stack == null) throw new Error('Unexpected broken stack')

            const caller = stack[3].split(' ')[5].replace('Function.', '')
            const logger = stack[2].split(' ')[5].replace(/(Function.|_LOGGER)/, '')

            // @ts-expect-error A spread argument must either have a tuple type or be passed to a rest parameter. ts(2556)
            console.log(logger.toUpperCase(), caller, sprintf(...message))
        }
    }

    public static fatal(...args: unknown[]): void {
        Logger.log(LOG_EMERG, ...args)

        process.exit(255)
    }
}

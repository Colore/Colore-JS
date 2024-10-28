import type { IncomingMessage, ServerResponse } from 'node:http'

import { parse } from 'node:querystring'
import { GenericRequestAdapter } from '../../GenericRequestAdapter.js'
import type { IRequestAdapter } from '../../Interfaces/Adapters/IRequestAdapter.js'

/**
 * Default RequestAdapter for the NodeJS HTTP server API
 *
 * @public
 */
export class RequestAdapter extends GenericRequestAdapter implements IRequestAdapter {
    protected request_properties: Record<string, unknown> = {}
    protected request: IncomingMessage
    protected response: ServerResponse

    constructor(request: IncomingMessage, response: ServerResponse) {
        super()

        this.request = request
        this.response = response

        if (typeof this.request.url === 'string' && this.request.url.includes('?')) {
            this.requestArguments = parse(this.request.url.substring(this.request.url.indexOf('?') + 1))
        }

        if (this.request.method === 'POST') {
            this.catchContent()
        }
    }

    protected catchContent(): void {
        let requestBody = ''

        this.request.on('data', (chunk) => {
            requestBody += chunk
        })
        this.request.on('end', () => {
            if (this.request.headers['content-type'] === 'application/json') {
                this.requestProperties = JSON.parse(requestBody) as Record<string, unknown>
            } else {
                this.requestProperties = parse(requestBody)
            }
        })
    }

    getRequestContext(): string {
        if (this.request.url == null) throw new Error('Missing URL')

        return this.request.url.length > 1 ? this.request.url : ''
    }

    /**
     * Returns an array containing all of the request arguments.
     *
     * @returns array
     */
    getRequestArguments(): Record<string, unknown> {
        return this.requestArguments
    }

    /**
     * Get a specific request argument. Returns null if the specified request argument does not exist.
     *
     * @param string - requestArgumentName
     *
     * @returns Request argument
     */
    getRequestArgument(requestArgumentName: string): unknown {
        return requestArgumentName in this.requestArguments ? this.requestArguments[requestArgumentName] : null
    }

    /**
     * Sets a request argument.
     *
     * @param string - requestArgument
     * @param mixed - requestArgumentValue
     *
     * @returns void
     */
    setRequestArgument(_requestArgument: string, _requestArgumentValue: unknown): void {
        /**
         * We don't want to inject data into the this.requestArguments variable.
         */
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
     * @returns (array|string)[]|null|string
     *
     * @returns Request property
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
     * @param mixed - requestValue
     *
     * @returns void
     */
    setRequestProperty(_requestProperty: string, _requestValue: unknown): void {
        /**
         * We don't want to inject data into the this.requestProperties variable.
         */
    }

    /**
     * Returns an array containing all of the session properties.
     *
     * @returns Session properties object
     */
    getSessionProperties(): Record<string, unknown> {
        return this.sessionProperties
    }

    /**
     * Sets a session lifetime.
     *
     * @param integer - sessionLifetime
     */
    setSessionLifetime(_sessionLifetime = 1800): void {
        // TODO cookie management
    }

    /**
     * Get a (named) session property. Returns null or the session property if it exists.
     * @param unknown - sessionProperty
     * @returns multitype:|NULL
     */
    getSessionProperty(sessionProperty: string): unknown {
        if (this.sessionProperties[sessionProperty] != null) {
            return this.sessionProperties[sessionProperty]
        }

        return null
    }

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
        if (this.sessionProperties[sessionProperty] != null) {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete this.sessionProperties[sessionProperty]
        }
    }

    /**
     * Output
     *
     * @param mixed - Output variable
     *
     * @returns void
     */
    output(content: unknown, metadata: Record<string, string> = {}, status = 200): void {
        this.response.statusCode = status

        Object.entries(metadata).forEach(([headerName, headerValue]) => this.response.setHeader(headerName, headerValue))

        this.response.write(content)
        this.response.end()
    }
}

import { type IncomingMessage, type ServerResponse } from 'node:http'
import { GenericRequestAdapter } from '../../GenericRequestAdapter'
import { type IRequestAdapter } from '../../Interfaces/Adapters/IRequestAdapter'

import { parse } from 'node:querystring'

export class RequestAdapter extends GenericRequestAdapter implements IRequestAdapter {
    protected request_properties: Record<string, unknown> = {}
    protected request: IncomingMessage
    protected response: ServerResponse

    constructor(request: IncomingMessage, response: ServerResponse) {
        super()

        this.request = request
        this.response = response

        if (typeof this.request.url === 'string' && this.request.url.includes('?')) {
            this.requestArguments = parse(this.request.url?.substring(this.request.url?.indexOf('?') + 1))
        }

        if (this.request.method === 'POST') {
            this.catchContent()
        }
    }

    protected catchContent(): void {
        let requestBody: string = ''

        this.request.on('data', (chunk) => {
            requestBody += chunk
        })
        this.request.on('end', () => {
            if (this.request.headers['content-type'] === 'application/json') {
                this.requestProperties = JSON.parse(requestBody)
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
     * @return array
     */
    getRequestArguments(): Record<string, unknown> {
        return this.requestArguments
    }

    /**
     * Get a specific request argument. Returns null if the specified request argument does not exist.
     *
     * @param string requestArgumentName
     *
     * @return (array|string)[]|null|string
     *
     * @psalm-return array<int|string, array<int|string, mixed>|string>|null|string
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
        /**
         * We don't want to inject data into the this.requestArguments variable.
         */
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
     * @return (array|string)[]|null|string
     *
     * @psalm-return array<int|string, array<int|string, mixed>|string>|null|string
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
     * @param mixed requestValue
     *
     * @return void
     */
    setRequestProperty(requestProperty: string, requestValue: unknown): void {
        /**
         * We don't want to inject data into the this.requestProperties variable.
         */
    }

    /**
     * Returns an array containing all of the session properties.
     *
     * @return array
     *
     * @psalm-return array<string, mixed>
     */
    getSessionProperties(): Record<string, unknown> {
        return this.sessionProperties
    }

    /**
     * Sets a session lifetime.
     *
     * @param integer sessionLifetime
     */
    setSessionLifetime(_sessionLifetime = 1800): void {
        // TODO cookie management
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

    /**
     * Output
     *
     * @param mixed Output variable
     *
     * @return void
     */
    output(content: unknown, metadata: Record<string, string> = {}, status = 200): void {
        this.response.statusCode = status

        Object.entries(metadata).forEach(([headerName, headerValue]) => this.response.setHeader(headerName, headerValue))

        this.response.write(content)
        this.response.end()
    }
}

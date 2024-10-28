import type { IRequestAdapter } from '@colore/colore-js'

/**
 * The Ping class is an example class for remoting.
 */
export class PingExample {
    public reply(requestObject: IRequestAdapter): void {
        if (requestObject.getRequestArgument('message') != null) {
            requestObject.setRenderProperty('message', requestObject.getRequestArgument('message') as string)
        } else {
            requestObject.setRenderProperty('message', 'message in a bottle')
        }

        requestObject.setRenderProperty('ts', Date.now().toString())
    }
}

export default PingExample

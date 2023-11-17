import { type IRequestAdapter } from '../../../src/Interfaces/Adapters/IRequestAdapter'

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
    }
}

export default PingExample

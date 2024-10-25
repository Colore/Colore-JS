/**
 * The Ping class is an example class for remoting.
 */

class PingExample {
    reply(requestObject) {
        if (requestObject.getRequestArgument('message') != null) {
            requestObject.setRenderProperty('message', requestObject.getRequestArgument('message'))
        } else {
            requestObject.setRenderProperty('message', 'message in a bottle')
        }

        requestObject.setRenderProperty('ts', Date.now().toString())
    }
}

module.exports.PingExample = PingExample

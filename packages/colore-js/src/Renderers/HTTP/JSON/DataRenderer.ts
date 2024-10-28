import type { IRequestAdapter } from '../../../Interfaces/Adapters/IRequestAdapter.js'
import type { IRenderProvider } from '../../../Interfaces/Providers/IRenderProvider.js'
import { Logger } from '../../../Logger.js'

export class DataRenderer implements IRenderProvider {
    /**
     * @param IRequestAdapter - The request adapter
     * @returns void
     */
    public dispatch(cro: IRequestAdapter): void {
        const outputProperties: Record<string, unknown> = {}

        const renderProperties = cro.getRenderProperties()

        Logger.debug('Setting render properties [%s]', Object.entries(renderProperties).length)

        Object.entries(renderProperties).forEach(([propName, propVal]) => {
            Logger.debug('Setting render property [%s] to [%s]', propName, propVal)

            outputProperties[propName] = propVal
        })

        const httpHeaders: Record<string, string> = cro.getRenderArgument('httpHeaders') != null ? (cro.getRenderArgument('httpHeaders') as Record<string, string>) : {}
        httpHeaders['Content-Type'] = 'application/json'

        const httpStatusCode = typeof cro.getRenderArgument('httpStatusCode') === 'number' ? (cro.getRenderArgument('httpStatusCode') as number) : 200

        const output = JSON.stringify(outputProperties) + '\n'

        cro.output(output, httpHeaders, httpStatusCode)
    }
}

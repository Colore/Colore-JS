import { renderFile } from 'ejs'
import path from 'node:path'
import { Logger } from '../../Logger.js'
import type { IRequestAdapter } from '../../Interfaces/Adapters/IRequestAdapter.js'
import type { IRenderProvider } from '../../Interfaces/Providers/IRenderProvider.js'

export class SimpleTemplateRenderer implements IRenderProvider {
    dispatch(cro: IRequestAdapter): void {
        const renderPath = cro.getRenderPath()

        if (renderPath === false || cro.getRenderPath() === '') throw new Error('Empty render path')

        const templateFile = path.resolve(path.join(Logger.getBasePath(), renderPath))

        const renderProperties = cro.getRenderProperties()

        // Hold the template variables in the template variable.
        const template: Record<string, unknown> = {}

        Logger.debug('Setting render properties [%s]', Object.entries(renderProperties).length)

        Object.entries(renderProperties).forEach(([propName, propVal]) => {
            Logger.debug('Setting render property [%s] to [%s]', propName, propVal)

            template[propName] = propVal
        })

        template.context = cro.getRequestContext()

        renderFile(templateFile, { template }, (err, output) => {
            if (err != null) throw err

            const httpHeaders: Record<string, string> = cro.getRenderArgument('httpHeaders') != null ? (cro.getRenderArgument('httpHeaders') as Record<string, string>) : {}
            const httpStatusCode = typeof cro.getRenderArgument('httpStatusCode') === 'number' ? (cro.getRenderArgument('httpStatusCode') as number) : 200

            cro.output(output, httpHeaders, httpStatusCode)
        })
    }
}

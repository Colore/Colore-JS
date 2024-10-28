import { ClassLoader, Engine, type IConfig, LOG_TRACE, Logger } from '@colore/colore-js'
import { readFileSync } from 'fs'
import { createServer } from 'http'
import path from 'node:path'
import { fileURLToPath } from 'url'

const getFilename = (): string => fileURLToPath(import.meta.url)
const __filename = getFilename()
const __dirname = path.dirname(__filename)

ClassLoader.addBasePath('Colore.Examples.YamlConfigsTS', path.resolve(path.join(__dirname, 'src')))

Logger.setLogLevel(LOG_TRACE)
Logger.setBasePath(__dirname)

try {
    const fileContent = readFileSync(path.join(__dirname, 'config.json'), 'utf-8')

    const config = JSON.parse(fileContent) as IConfig

    /**
     * Create a new ColoreEngine instance.
     */
    Logger.debug('Instantiating ColoreEngine')

    const colore = new Engine(config)

    // create a server object:
    const server = createServer({ joinDuplicateHeaders: true })

    server.on('listening', () => {
        console.log('Listening on http://localhost:3742/')
    })

    server.on('request', function (req, res) {
        /**
         * Service (handle) the (new) request.
         */
        Logger.debug('Servicing request: %s', req.url)

        void colore.service(req, res)
    })

    server.listen(3742)
} catch (err) {
    Logger.fatal((err as Error).message)
}

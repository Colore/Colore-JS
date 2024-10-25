import { ClassLoader, Engine, LOG_TRACE, Logger } from '@colore/colore-js'
import { readFileSync } from 'fs'
import { createServer } from 'http'
import path from 'node:path'
import { fileURLToPath } from 'url'

// @ts-expect-error
const getFilename = () => fileURLToPath(import.meta.url)
const __filename = getFilename()
const __dirname = path.dirname(__filename)

ClassLoader.addBasePath('Colore.Examples.Ping', path.resolve(path.join(__dirname, 'src')))

Logger.setLogLevel(LOG_TRACE)
Logger.setBasePath(__dirname)

let config

try {
    const fileContent = readFileSync(`${path.join(__dirname, 'config.json')}`, 'utf-8')

    config = JSON.parse(fileContent)
} catch (err) {
    Logger.fatal((err as Error).message)
}

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

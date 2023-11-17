import { createServer } from 'http'
import { readFileSync } from 'fs'
import { Engine } from '../../src/Engine'
import { LOG_TRACE, Logger } from '../../src/Logger'
import path from 'node:path'
import { ClassLoader } from '../../src/ClassLoader'

ClassLoader.addBasePath('Colore', path.resolve(path.join(__dirname, '../../src')))
ClassLoader.addBasePath('Colore.Examples.Ping', path.resolve(path.join(__dirname, 'src')))

Logger.setLogLevel(LOG_TRACE)
Logger.setBasePath(__dirname)

let config

try {
    const fileContent = readFileSync(`${path.join(__dirname, 'config.json')}`, 'utf-8')

    config = JSON.parse(fileContent)
} catch (err) {
    Logger.fatal(err.message)
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

const { ClassLoader, Engine, LOG_TRACE, Logger } = require('@colore/colore-js')
const { readFileSync } = require('fs')
const { createServer } = require('http')
const path = require('node:path')

// ClassLoader.addBasePath('Colore', path.resolve(path.join(__dirname, '../../src')))
// ClassLoader.addBasePath('Colore', 'self')
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

    colore.service(req, res)
})

server.listen(3742)

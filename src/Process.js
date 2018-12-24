'use strict'

const Console = require('console')
const MainProcess = require('process')

module.exports = class Process {
    constructor(name = null, debugMode = false) {
        this.process = MainProcess
        this.console = new Console.Console(this.process.stdout, this.process.stderr)
        this.name = name || this.process.title
        this.debugMode = Boolean(debugMode) || false
        this.processEvents = [
            'beforeExit',
            'disconnect',
            'exit',
            'message',
            'rejectionHandled',
            'uncaughtException',
            'unhandledRejection',
            'warning'
        ]

        // binding events
        for (let event of this.processEvents) {
            let method = 'on' + event[0].toUpperCase() + event.substring(1)
            if (this[method] instanceof Function) {
                this.debug(`binding process event(${event}) to method(${method})`)
                this.process.on(event, (...args) => {
                    this[method](...args)
                })
            }
        }
    }

    print(...args) {
        args.unshift(`[${new Date().toLocaleString()}] [${this.name}]`)
        this.console.log(...args)
    }

    debug(...args) {
        if (this.debugMode) {
            this.print(...args)
        }
    }

    onBeforeExit(...args) {
        this.debug('receive event: onBeforeExit; args: ', args)
    }
    onDisconnect(...args) {
        this.debug('receive event: onDisconnect; args: ', args)
    }
    onExit(...args) {
        this.debug('receive event: onExit; args: ', args)
    }
    onMessage(...args) {
        this.debug('receive event: onMessage; args: ', args)
    }
    onRejectionHandled(...args) {
        this.debug('receive event: onRejectionHandled; args: ', args)
    }
    onUncaughtException(...args) {
        this.debug('receive event: onUncaughtException; args: ', args)
    }
    onUnhandledRejection(...args) {
        this.debug('receive event: onUnhandledRejection; args: ', args)
    }
    onWarning(...args) {
        this.debug('receive event: onWarning; args: ', args)
    }
}
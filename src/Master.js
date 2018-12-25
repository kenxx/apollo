'use strict'

const Process = require('./Process')
const Cluster = require('cluster')
const Path = require('path')

module.exports = class Master extends Process {
    constructor(name = 'Master', debugMode = false) {
        super(name, debugMode)
        this.master = Cluster
        this.workers = []
        this.appPath = this.process.cwd()

        this.masterEvents = [
            'disconnect',
            'exit',
            'fork',
            'listening',
            'message',
            'online',
            'setup'
        ]

        for (let event of this.masterEvents) {
            let method = 'onMaster' + event[0].toUpperCase() + event.substring(1)
            if (this[method] instanceof Function) {
                this.debug(`binding master event(${event}) to method(${method})`)
                this.master.on(event, (...args) => {
                    this[method](...args)
                })
            }
        }

        return (async () => {
            await this.__initiator()
            return this
        })()
    }

    async __initiator() {
        // do something awaitable
    }

    setConfig(config = {}) {
        Object.assign(this, config)
    }

    static async Start(config = {}) {
        if (process.env.APOLLO_PROCESS_NAME) {
            config.name = process.env.APOLLO_PROCESS_NAME
        }
        if (process.env.APOLLO_DEBUG_MODE) {
            config.debugMode = process.env.APOLLO_DEBUG_MODE
        }

        let master = await new Master(config.name, config.debugMode)
        master.setConfig(config)
        await master.__run()
    }

    async __run() {
        if (this.master.isMaster) {
            this.print('I am running at', this.appPath)
            this.debug(`Master ${process.pid} is running`)

            for (let i in this.workers) {
                let worker = this.workers[i]
                let setup = {}
                if (worker['name']) {
                    setup.exec = this.appPath + Path.sep + worker.name
                }
                if (worker['args']) {
                    setup.args = worker['args']
                }
            }

            // Fork workers.
            for (let i = 0; i < 1; i++) {
                this.master.fork({
                    APOLLO_DEBUG_MODE: this.debugMode,
                    APOLLO_PROCESS_NAME: 'Worker',
                    APOLLO_WORKER: true,
                })
            }
        } else if (this.master.isWorker) {
            this.print(this.workers)
        }
    }

    onMasterDisconnect(...args) {
        this.debug('Master event: onMasterDisconnect; args: ', args)
    }
    onMasterExit(...args) {
        this.debug('Master event: onMasterExit; args: ', args)
    }
    onMasterFork(...args) {
        this.debug('Master event: onMasterFork; args: ', args)
    }
    onMasterListening(...args) {
        this.debug('Master event: onMasterListening; args: ', args)
    }
    onMasterMessage(...args) {
        this.debug('Master event: onMasterMessage; args: ', args)
    }
    onMasterOnline(...args) {
        this.debug('Master event: onMasterOnline; args: ', args)
    }
    onMasterSetup(...args) {
        this.debug('Master event: onMasterSetup; args: ', args)
    }
}
'use strict'

const ApolloProcess = require('./apollo_process')

module.exports = class ApolloWorker extends ApolloProcess {
    constructor(config) {
        super()
        this.name = 'Worker'
        this.__exiting = false
        this.writeLine(`Apollo Worker run on PID=${this.process.pid} PPID=${this.process.ppid}`)

        ApolloWorker.SafetyCall(this, 'beforeInitial')
        Object.assign(this, config)
        this.__initial()
    }

    __initial() {
        this.bindEventsFromObject(this.process, this.__defaultSignal, 'defaultSignalHandle')
        this.bindEventsFromObject(this.process, this.__defaultProcessEvents, 'defaultProcessEvents')
        this.bindEvents(this.process, 'signal')
        this.bindEvents(this.process, 'processEvents')
        ApolloWorker.SafetyCall(this, 'afterInitial')
        this.__start()
    }

    async __start() {
        ApolloWorker.SafetyCall(this, 'beforeRun')
        await ApolloWorker.SafetyCall(this, 'run')
        ApolloWorker.SafetyCall(this, 'afterRun')
    }

    get __defaultProcessEvents() {
        return {
            beforeExit(exitCode) {
                this.writeInfo(`worker pid=${this.process.pid} is exiting by code=${exitCode}`)
            }
        }
    }

    get __defaultSignal() {
        return {
            SIGINT() {
                this.writeInfo('receive SIGINT')
                this.exit(0)
            }
        }
    }

    async exit(code) {
        this.process.exit(code)
    }

    async send(...args) {
        this.process.send(...args)
    }
}
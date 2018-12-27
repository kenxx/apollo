'use strict'

const ApolloProcess = require('./apollo_process')

module.exports = class ApolloWorker extends ApolloProcess {
    constructor(config) {
        super()
        this.name = 'Worker'
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

        }
    }

    get __defaultSignal() {
        return {
            SIGINT() {
                this.writeInfo('receive SIGINT')
                this.process.disconnect()
                this.process.exit(0)
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
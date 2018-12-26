'use strict'

const ApolloProcess = require('./apollo_process')

const SafetyCall = (obj, func, ...args) => {
    if (typeof obj[func] == 'function') {
        return obj[func].apply(obj, args)
    }
    return null
}

module.exports = class ApolloWorker extends ApolloProcess {
    constructor(config) {
        super()
        this.name = 'Worker'

        SafetyCall(this, 'beforeInitial')
        Object.assign(this, config)
        this.__initial()
    }

    __initial() {
        this.bindEvents(this.process, '__defaultProcessEvents')
        this.bindEvents(this.process, 'processEvents')
        SafetyCall(this, 'afterInitial')
        this.__start()
    }

    async __start() {
        await SafetyCall(this, 'run')
    }

    get __defaultProcessEvents() {
        return {

        }
    }

    async send(...args) {
        this.process.send(...args)
    }
}
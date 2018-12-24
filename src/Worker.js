'use strict'

const Process = require('./Process')
const Cluster = require('cluster')

module.exports = class Worker extends Process {
    constructor(name = 'Worker', debugMode = false) {
        super(name, debugMode)
        return (async () => {
            await this.__initiator()
            return this
        })()
    }

    async __initiator () {
        // do something awaitable
    }

    setConfig(config = {}) {
        Object.assign(this, config)
    }

    async __run() {

    }
}
'use strict'

const ApolloProcess = require('./apollo_process')

module.exports = class ApolloWorker extends ApolloProcess {
    constructor (config) {
        super(config)
        this.name = 'Worker'
    }
}
'use strict'

const path = require('path')
const { ApolloWorker } = require('../../index')

console.log('forked, ', process.ppid, process.pid)

new ApolloWorker({
    name: 'Worker',
    async run () {
        this.writeLine('test')
        this.process.exit(1)
    }
})
'use strict'

const { ApolloWorker } = require('../../index')

new ApolloWorker({
    name: 'Worker',
    develop: true,
    async run () {
        this.writeLine('test')
        await ApolloWorker.SleepMS(2000)
        this.send('test')
        await ApolloWorker.SleepMS(5000)
        this.process.exit(1)
    }
})